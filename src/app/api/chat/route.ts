import { openai } from "@ai-sdk/openai";
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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: convertToModelMessages(messages),
    system: `Eres Rocco, un entrenador personal de IA avanzado y motivador.
    Tu objetivo es ayudar a los usuarios a alcanzar sus metas de fitness, responder preguntas sobre ejercicios, nutrición y rutinas.
    Sé amable, directo y utiliza emojis para hacer la conversación más amena.
    Si te preguntan algo que no sea de fitness, intenta redirigir la conversación al entrenamiento o la salud.`,
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
