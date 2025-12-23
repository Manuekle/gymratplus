import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { auth } from "@auth";
import { prisma } from "@/lib/database/prisma";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  // Fetch user with complete profile and goals
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      profile: true,
      Goal: {
        where: { status: "active" },
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Build personalized context
  const userContext = `
CONTEXTO DEL USUARIO:
- Nombre: ${user.name || "Usuario"}
- Nivel de experiencia: ${user.experienceLevel || "Principiante"}
- Edad: ${(user as any).profile?.birthdate ? new Date().getFullYear() - new Date((user as any).profile.birthdate).getFullYear() : "No especificada"} años
- Género: ${(user as any).profile?.gender || "No especificado"}
- Altura: ${(user as any).profile?.height || "No especificada"} cm
- Peso actual: ${(user as any).profile?.currentWeight || "No especificado"} kg
- Peso objetivo: ${(user as any).profile?.targetWeight || "No especificado"} kg
- Objetivo principal: ${(user as any).profile?.goal || "Estar en forma"}
- Nivel de actividad: ${(user as any).profile?.activityLevel || "Moderado"}
- Preferencia dietética: ${(user as any).profile?.dietaryPreference || "Ninguna"}
- Frecuencia de entrenamiento: ${(user as any).profile?.trainingFrequency || "No especificada"} días/semana
- Horario preferido: ${(user as any).profile?.preferredWorkoutTime || "Flexible"}
${(user as any).Goal && (user as any).Goal.length > 0 ? `- Objetivos activos: ${(user as any).Goal.map((g: any) => g.title).join(", ")}` : ""}
  `.trim();

  const result = await streamText({
    model: "openai/gpt-4o-mini",
    messages: await convertToModelMessages(messages),
    system: `Eres Rocco, un entrenador personal de IA avanzado y motivador.

TU PERSONALIDAD:
- Eres enérgico, motivador y directo, como un verdadero entrenador profesional
- Usas emojis ocasionalmente para hacer la conversación más amigable
- Eres cercano pero profesional, llamas al usuario por su nombre cuando es relevante
- Adaptas tu lenguaje al nivel de experiencia del usuario

TUS FUNCIONES:
1. Responder dudas sobre entrenamiento, técnica de ejercicios y rutinas
2. Dar consejos básicos de nutrición (siempre recordando que no eres médico ni nutricionista)
3. Motivar al usuario cuando se sienta desanimado
4. Proporcionar información basada en ciencia del ejercicio
5. Ayudar a establecer y hacer seguimiento de objetivos realistas

${userContext}

INSTRUCCIONES:
- Usa esta información para personalizar tus consejos y respuestas
- Sé específico y práctico en tus recomendaciones
- Si el usuario pregunta algo que no sea de fitness, redirige la conversación amablemente
- Prioriza siempre la seguridad del usuario
- Si no sabes algo o requiere atención médica, admítelo y recomienda consultar a un profesional
- Sé conciso pero informativo (máximo 3-4 párrafos por respuesta)`,
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
