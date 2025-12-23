import { streamText } from "ai";
import { auth } from "@auth";
import { prisma } from "@/lib/database/prisma";

export const maxDuration = 30;

export async function POST() {
  const session = await auth();

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Fetch user with complete profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
        Goal: {
          where: { status: "active" },
          take: 5,
        },
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Fetch all available exercises
    const exercises = await prisma.exercise.findMany({
      select: {
        id: true,
        name: true,
        muscleGroup: true,
        description: true,
      },
    });

    // Build context for AI
    const userContext = `
INFORMACIÓN DEL USUARIO:
- Nombre: ${user.name}
- Nivel de experiencia: ${user.experienceLevel || "Principiante"}
- Objetivo principal: ${(user as any).profile?.goal || "Estar en forma"}
- Frecuencia de entrenamiento: ${(user as any).profile?.trainingFrequency || 3} días/semana
- Meses entrenando: ${(user as any).profile?.monthsTraining || 0}
${(user as any).Goal && (user as any).Goal.length > 0 ? `- Objetivos activos: ${(user as any).Goal.map((g: any) => g.title).join(", ")}` : ""}

EJERCICIOS DISPONIBLES:
${exercises.map((e) => `- ${e.id}: ${e.name} (${e.muscleGroup})`).join("\n")}
    `.trim();

    const result = await streamText({
      model: "openai/gpt-4o-mini",
      prompt: `Eres Rocco, un entrenador personal experto. Genera un plan de entrenamiento personalizado basado en la siguiente información:

${userContext}

INSTRUCCIONES:
1. Crea un plan de 3-5 días según la frecuencia de entrenamiento del usuario
2. Selecciona ejercicios SOLO de la lista proporcionada usando sus IDs exactos
3. Asigna series, repeticiones y tiempo de descanso apropiados según el nivel
4. Distribuye los grupos musculares de forma balanceada
5. Responde SOLO con un JSON válido en este formato exacto:

{
  "name": "Nombre descriptivo del plan",
  "description": "Breve descripción del plan",
  "days": [
    {
      "day": "Día 1 - Pecho y Tríceps",
      "exercises": [
        {
          "id": "ID_DEL_EJERCICIO",
          "sets": 3,
          "reps": 10,
          "restTime": 90
        }
      ]
    }
  ]
}

NO incluyas texto adicional, solo el JSON.`,
    });

    // Get the generated text
    let generatedText = "";
    for await (const textPart of result.textStream) {
      generatedText += textPart;
    }

    // Parse the JSON response
    const cleanedText = generatedText
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");
    const workoutPlan = JSON.parse(cleanedText);

    // Enrich with exercise details
    const enrichedPlan = {
      ...workoutPlan,
      days: workoutPlan.days.map((day: any) => ({
        ...day,
        exercises: day.exercises.map((ex: any) => {
          const exercise = exercises.find((e) => e.id === ex.id);
          return {
            ...ex,
            name: exercise?.name || "Ejercicio desconocido",
            muscleGroup: exercise?.muscleGroup || "General",
          };
        }),
      })),
    };

    return Response.json(enrichedPlan);
  } catch (error) {
    console.error("Error generating workout plan:", error);
    return Response.json(
      { error: "Error generando plan de entrenamiento" },
      { status: 500 },
    );
  }
}
