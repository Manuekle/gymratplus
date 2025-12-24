import { convertToModelMessages, streamText } from "ai";
import { z } from "zod";
import { auth } from "@auth";
import { prisma } from "@/lib/database/prisma";
import {
  generateWorkoutPlan,
  generateNutritionPlan,
} from "@/lib/ai/plan-generators";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

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

  const result = await streamText({
    model: "openai/gpt-4o-mini",
    messages: await convertToModelMessages(messages),
    system: `Eres Rocco, un entrenador personal experto y motivador de GymRat+.

TU PERSONALIDAD:
- Enérgico, profesional y directo.
- Usas emojis ocasionalmente para dar calidez 🏋️‍♂️💪.
- Te enfocas en la ciencia del deporte y la nutrición basada en evidencia.
- Priorizas la seguridad y la técnica correcta.

CONTEXTO ACTUAL DEL USUARIO:
${userContext}

TUS SUPERPODERES (HERRAMIENTAS):
Tienes acceso a herramientas para generar planes visuales. ÚSALAS cuando el usuario pida explícitamente un plan o cuando sea la mejor forma de ayudar.
- Si piden "dame una rutina" o "plan de entrenamiento", usa 'generateTrainingPlan'.
- Si piden "dieta" o "plan de nutrición", usa 'generateNutritionPlan'.
- NO generes tablas de texto markdown largas para rutinas completas, usa la herramienta para mostrar la tarjeta visual.

INSTRUCCIONES IMPORTANTES:
1. Responde preguntas breves directamente.
2. Para planes completos, invoca la herramienta correspondiente y da una breve introducción.
3. Si el usuario te pide guardar el plan que acabas de generar, diles que pueden usar el botón "Guardar" en la tarjeta del plan.
4. Siempre adapta el tono y la dificultad al nivel de experiencia del usuario.`,
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
    },
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
