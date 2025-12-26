import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  streamText,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { auth } from "@auth";
import { prisma } from "@/lib/database/prisma";
import {
  generateWorkoutPlan,
  generateNutritionPlan,
} from "@/lib/ai/plan-generators";
import { saveChat, saveMessages, getChatById } from "@/lib/db/chat-queries";
import { generateUUID } from "@/lib/ai/utils";

// Force Node.js runtime for iOS Safari compatibility and to avoid Edge WAF issues
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email || !session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const { messages, id } = json as { messages: UIMessage[]; id?: string };

    const { searchParams } = new URL(req.url);
    const chatId = id || searchParams.get("id") || generateUUID();

    console.log(
      `🔍 API Chat - Received ${messages.length} messages for chat ${chatId}`,
    );

    // Persist chat if it doesn't exist
    // Check if valid first
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1] as any;

      // Save chat skeleton if new
      const existingChat = await getChatById({ id: chatId });
      if (!existingChat && lastMessage.role === "user") {
        await saveChat({
          id: chatId,
          userId: session.user.id,
          title: (lastMessage.content || "").slice(0, 50) || "New Chat",
        });
      }

      // Save the user message (last one)
      if (lastMessage.role === "user") {
        await saveMessages({
          messages: [
            {
              id: lastMessage.id,
              chatId: chatId,
              role: "user",
              content: lastMessage.content || "",
              createdAt: new Date(),
              senderId: session.user.id,
              toolInvocations: lastMessage.toolInvocations,
            },
          ],
        });
      }
    }

    // Fetch user with complete profile, goals, and recent metrics
    const user = (await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
        Goal: {
          where: { status: "active" },
          take: 3,
        },
      },
    })) as any;

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Check subscription tier - AI chat is only available for PRO and INSTRUCTOR users
    const isPro = user.subscriptionTier === "PRO" && user.subscriptionStatus === "active";
    const isInstructor = user.isInstructor === true;

    if (!isPro && !isInstructor) {
      // Return a friendly message for free users
      const upgradeMessage = {
        role: "assistant",
        content: `¡Hola! 👋 Soy Rocco, tu entrenador personal de IA.

Para poder ayudarte con planes de entrenamiento personalizados, seguimiento nutricional y mucho más, necesitas actualizar a GymRat+ **Pro** o **Instructor**.

**Con Pro obtienes:**
✨ Planes de entrenamiento personalizados con IA
🍎 Seguimiento nutricional inteligente
📊 Análisis avanzado de progreso
💪 Acceso a todas las funciones premium

¿Listo para llevar tu entrenamiento al siguiente nivel? ¡Actualiza ahora!`,
      };

      return new Response(JSON.stringify(upgradeMessage), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build context string from user data
    const userContext = `
PERFIL DEL USUARIO:
- Nombre: ${user.name || "Usuario"}
- Nivel: ${user.experienceLevel || "No especificado"}
- Edad: ${user.profile?.age ? `${user.profile.age} años` : "No especificada"}
- Género: ${user.profile?.gender || "No especificado"}
- Altura: ${user.profile?.height ? `${user.profile.height}cm` : "No especificada"}
- Peso: ${user.profile?.weight ? `${user.profile.weight}kg` : "No especificado"}
- Objetivo: ${user.profile?.goal || "No especificado"}
- Actividad: ${user.profile?.activityLevel || "No especificada"}
- Preferencia Dietética: ${user.profile?.dietaryPreference || "Ninguna"}
- Frecuencia Entrenamiento: ${user.profile?.trainingFrequency ? `${user.profile.trainingFrequency} días/semana` : "No especificada"}
- Horario Preferido: ${user.profile?.preferredWorkoutTime || "No especificado"}

OBJETIVOS ACTIVOS:
${user.Goal && user.Goal.length > 0 ? user.Goal.map((g: any) => `- ${g.description || g.type}`).join("\n") : "Ninguno definido"}
- Preferencia dietética: ${user.profile?.dietaryPreference || "Ninguna"}
- Alergias/Restricciones: ${user.profile?.allergies ? user.profile.allergies.join(", ") : "Ninguna"}
- Lesiones/Limitaciones: ${user.profile?.injuries ? user.profile.injuries.join(", ") : "Ninguna"}
  `.trim();

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        const result = streamText({
          model: "openai/gpt-4o-mini",
          messages: await convertToModelMessages(messages),
          system: `Eres Rocco, un entrenador personal experto y motivador de GymRat+.
          
IMPORTANTE: SIEMPRE responde en ESPAÑOL.
${userContext}

TUS SUPERPODERES (HERRAMIENTAS):
Tienes acceso a herramientas para generar planes visuales y tracking nutricional. ÚSALAS cuando el usuario pida explícitamente un plan o cuando sea la mejor forma de ayudar.
- Si piden "dame una rutina" o "plan de entrenamiento", PRIMERO DEBES PREGUNTAS qué nombre quiere para el plan (ej. "Fuerza Bruta", "Operación Bikini"). NO generes el plan sin un nombre. Una vez lo tengas, usa 'generateTrainingPlan' con el nombre exacto.
- Si piden "dieta" o "plan de nutrición", usa 'generateNutritionPlan'.
- Si preguntan "cuántas calorías tengo hoy" o similar, usa 'getTodayCalories'.
- Si dicen "me comí [comida]" o "quiero guardar una comida", usa 'saveMealEntry'.
`,
          tools: {
            generateTrainingPlan: {
              description:
                "Genera un plan de entrenamiento completo y visual basado en el perfil del usuario.",
              inputSchema: z.object({
                planName: z
                  .string()
                  .describe("Nombre del plan de entrenamiento (pregunta al usuario)"),
                focus: z
                  .enum([
                    "fuerza",
                    "hipertrofia",
                    "resistencia",
                    "perdida_peso",
                    "flexibilidad",
                  ])
                  .describe("El enfoque principal del entrenamiento"),
                daysPerWeek: z
                  .number()
                  .min(1)
                  .max(7)
                  .describe("Días de entrenamiento por semana"),
                durationMinutes: z
                  .number()
                  .min(15)
                  .max(120)
                  .describe("Duración aproximada por sesión en minutos"),
                difficulty: z
                  .enum(["principiante", "intermedio", "avanzado"])
                  .describe("Nivel de dificultad"),
              }),
              execute: async (params: {
                planName: string;
                focus:
                | "fuerza"
                | "hipertrofia"
                | "resistencia"
                | "perdida_peso"
                | "flexibilidad";
                daysPerWeek: number;
                durationMinutes: number;
                difficulty: "principiante" | "intermedio" | "avanzado";
              }) => {
                return generateWorkoutPlan(user, params);
              },
            },
            generateNutritionPlan: {
              description:
                "Genera un plan nutricional detallado y visual con comidas y macros.",
              inputSchema: z.object({
                calories: z
                  .number()
                  .describe("Meta calórica diaria aproximada"),
                goal: z
                  .enum(["perder_grasa", "mantener", "ganar_musculo"])
                  .describe("Objetivo nutricional"),
                mealsPerDay: z
                  .number()
                  .min(3)
                  .max(6)
                  .describe("Número de comidas por día"),
                dietaryType: z
                  .string()
                  .describe("Tipo de dieta (ej. vegana, paleo, omnívora)"),
              }),
              execute: async (params: {
                calories: number;
                goal: "perder_grasa" | "mantener" | "ganar_musculo";
                mealsPerDay: number;
                dietaryType: string;
              }) => {
                return generateNutritionPlan(user, params);
              },
            },
            getTodayCalories: {
              description:
                "Obtiene el resumen de calorías y macros consumidos hoy comparado con los objetivos del usuario.",
              inputSchema: z.object({}),
              execute: async () => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                // Get today's meal logs
                const mealLogs = await prisma.mealLog.findMany({
                  where: {
                    userId: user.id,
                    consumedAt: {
                      gte: today,
                      lt: tomorrow,
                    },
                  },
                });

                // Calculate totals
                const totals = mealLogs.reduce(
                  (acc, log) => ({
                    calories: acc.calories + log.calories,
                    protein: acc.protein + log.protein,
                    carbs: acc.carbs + log.carbs,
                    fat: acc.fat + log.fat,
                  }),
                  { calories: 0, protein: 0, carbs: 0, fat: 0 },
                );

                return {
                  consumed: totals,
                  targets: {
                    calories: user.profile?.dailyCalorieTarget || 2000,
                    protein: user.profile?.dailyProteinTarget || 150,
                    carbs: user.profile?.dailyCarbTarget || 200,
                    fat: user.profile?.dailyFatTarget || 60,
                  },
                  date: today.toISOString(),
                };
              },
            },
            saveMealEntry: {
              description:
                "Guarda una entrada de comida con estimación de calorías y macros. Usa esta herramienta cuando el usuario mencione que comió algo.",
              inputSchema: z.object({
                foodName: z.string().describe("Nombre de la comida"),
                estimatedCalories: z
                  .number()
                  .describe("Calorías estimadas de la comida"),
                estimatedProtein: z
                  .number()
                  .describe("Proteína estimada en gramos"),
                estimatedCarbs: z
                  .number()
                  .describe("Carbohidratos estimados en gramos"),
                estimatedFat: z.number().describe("Grasas estimadas en gramos"),
                mealType: z
                  .enum(["desayuno", "almuerzo", "cena", "snack"])
                  .describe("Tipo de comida"),
                quantity: z
                  .number()
                  .default(1)
                  .describe("Cantidad/porciones (default 1)"),
              }),
              requiresApproval: true,
              execute: async (params: {
                foodName: string;
                estimatedCalories: number;
                estimatedProtein: number;
                estimatedCarbs: number;
                estimatedFat: number;
                mealType: "desayuno" | "almuerzo" | "cena" | "snack";
                quantity: number;
              }) => {
                // This executes only after user approval
                const mealLog = await prisma.mealLog.create({
                  data: {
                    userId: user.id,
                    mealType: params.mealType,
                    consumedAt: new Date(),
                    foodId: null,
                    recipeId: null,
                    customName: params.foodName,
                    quantity: params.quantity,
                    calories: Math.round(params.estimatedCalories),
                    protein: Number.parseFloat(
                      params.estimatedProtein.toFixed(2),
                    ),
                    carbs: Number.parseFloat(params.estimatedCarbs.toFixed(2)),
                    fat: Number.parseFloat(params.estimatedFat.toFixed(2)),
                  },
                });

                return {
                  success: true,
                  message: `${params.foodName} guardado correctamente`,
                  mealLog,
                };
              },
            },
          },
        }); // End streamText

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      onFinish: async ({ messages: finishedMessages }) => {
        // Persist generated messages (assistant)
        if (finishedMessages && finishedMessages.length > 0) {
          await saveMessages({
            messages: finishedMessages.map((msg: any) => ({
              id: msg.id,
              chatId: chatId,
              role: msg.role,
              content: msg.content ?? "",
              createdAt: new Date(),
              toolInvocations: msg.toolInvocations,
              // No senderId for assistant/system
            })),
          }).catch((e) => console.error("Error saving assistant messages:", e));
        }
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    // SSE headers required for iOS Safari compatibility
    return new Response(stream.pipeThrough(new JsonToSseTransformStream()), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
