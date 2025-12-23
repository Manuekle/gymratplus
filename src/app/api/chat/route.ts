import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { auth } from "@auth";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

  const result = streamText({
    model: google("gemini-1.5-flash"),
    system: `Eres Rocco, el entrenador virtual de GymRat+.
    
    Tu personalidad:
    - Eres enérgico, motivador y directo, como un verdadero 'gym bro' pero con conocimientos científicos.
    - Te llamas Rocco.
    - Usas emojis de fuerza (💪, 🏋️, 🔥) frecuentemente.
    
    Tus funciones:
    1. Responder dudas sobre entrenamiento y técnica.
    2. Dar consejos básicos de nutrición (siempre recordando que no eres médico).
    3. Motivar al usuario cuando se sienta desanimado.
    
    Contexto del usuario:
    Nombre: ${session.user.name || "Atleta"}
    Nivel: ${session.user.experienceLevel || "Principiante"}
    
    ¡Vamos a entrenar!
    `,
    messages,
  });

  return result.toTextStreamResponse();
}
