import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";
import { auth } from "@auth";
import { prisma } from "@/lib/database/prisma";
import {
  generateWorkoutPlan,
  generateNutritionPlan,
} from "@/lib/ai/plan-generators";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      console.error("❌ [API Chat] Unauthorized - No session");
      return new Response(
        JSON.stringify({ error: "Unauthorized", code: "NO_SESSION" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("✅ [API Chat] Session found:", session.user.email);

    // Log all headers for debugging
    console.log(
      "🔍 [API Chat] Request Headers:",
      Object.fromEntries(req.headers),
    );

    // Try to read body as text first to debug empty/malformed bodies
    let bodyText = "";
    try {
      bodyText = await req.text();
      console.log("🔍 [API Chat] Raw Body Length:", bodyText.length);
      console.log(
        "🔍 [API Chat] Raw Body Preview:",
        bodyText.substring(0, 100),
      );
    } catch (e) {
      console.error("❌ [API Chat] Error reading body:", e);
    }

    if (!bodyText) {
      console.error("❌ [API Chat] Empty body received");
      return new Response(
        JSON.stringify({ error: "Empty request body", code: "EMPTY_BODY" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    let messages: UIMessage[];
    try {
      const json = JSON.parse(bodyText);
      messages = json.messages;
    } catch (e) {
      console.error("❌ [API Chat] JSON parse error:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON", code: "INVALID_JSON" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log("🔍 API Chat - Received messages:", messages.length);
    console.log("🔍 API Chat - Last message:", messages[messages.length - 1]);

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
      console.error("❌ [API Chat] User not found:", session.user.email);
      return new Response(
        JSON.stringify({ error: "User not found", code: "USER_NOT_FOUND" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("✅ [API Chat] User found:", user.name);

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

    console.log("🔍 API Chat - User context prepared for:", user.name);
    console.log("🔍 API Chat - Starting streamText...");

    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ [API Chat] OPENAI_API_KEY not configured");
      return new Response(
        JSON.stringify({
          error: "AI service not configured",
          code: "MISSING_API_KEY",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const result = await streamText({
      model: "openai/gpt-4o-mini",
      messages: await convertToModelMessages(messages),
      system: `Eres Rocco, un entrenador personal experto y motivador de GymRat+.

IMPORTANTE: SIEMPRE responde en ESPAÑOL. Nunca uses inglés en tus respuestas.

TU PERSONALIDAD:
- Enérgico, profesional y directo.
- Usas emojis ocasionalmente para dar calidez 🏋️‍♂️💪.
- Te enfocas en la ciencia del deporte y la nutrición basada en evidencia.
- Priorizas la seguridad y la técnica correcta.

CONTEXTO ACTUAL DEL USUARIO:
${userContext}

TUS SUPERPODERES (HERRAMIENTAS):
Tienes acceso a herramientas para generar planes visuales y tracking nutricional. ÚSALAS cuando el usuario pida explícitamente un plan o cuando sea la mejor forma de ayudar.
- Si piden "dame una rutina" o "plan de entrenamiento", usa 'generateTrainingPlan'.
- Si piden "dieta" o "plan de nutrición", usa 'generateNutritionPlan'.
- Si preguntan "cuántas calorías tengo hoy" o similar, usa 'getTodayCalories'.
- Si dicen "me comí [comida]" o "quiero guardar una comida", usa 'saveMealEntry'.
- NO generes tablas de texto markdown largas para rutinas completas, usa la herramienta para mostrar la tarjeta visual.

INSTRUCCIONES IMPORTANTES:
1. Responde preguntas breves directamente.
2. Para planes completos, invoca la herramienta correspondiente y da una breve introducción.
3. Si el usuario te pide guardar el plan que acabas de generar, diles que pueden usar el botón "Guardar" en la tarjeta del plan.
4. Siempre adapta el tono y la dificultad al nivel de experiencia del usuario.
5. Para tracking de comidas, estima los macros basándote en tu conocimiento nutricional.`,
      tools: {
        generateTrainingPlan: {
          description:
            "Genera un plan de entrenamiento completo y visual basado en el perfil del usuario.",
          inputSchema: z.object({
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
            calories: z.number().describe("Meta calórica diaria aproximada"),
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
                quantity: params.quantity,
                calories: Math.round(params.estimatedCalories),
                protein: Number.parseFloat(params.estimatedProtein.toFixed(2)),
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
    });

    console.log("🔍 API Chat - Stream created, returning response");

    return result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
    });
  } catch (error) {
    console.error("❌ [API Chat] Fatal error:", error);
    console.error(
      "❌ [API Chat] Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        code: "INTERNAL_ERROR",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
