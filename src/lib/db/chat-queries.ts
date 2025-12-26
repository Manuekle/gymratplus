import { prisma } from "@/lib/database/prisma";

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await prisma.chat.upsert({
      where: { id },
      create: {
        id,
        userId,
        title,
        type: "ai",
      },
      update: {
        title, // Allow updating title
      },
    });
  } catch (error) {
    console.error("Failed to save chat:", error);
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    return await prisma.chat.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to get chat by id:", error);
    return null;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<{
    id: string;
    chatId: string;
    role: string;
    content: string;
    createdAt?: Date;
    senderId?: string; // Optional, only for user messages
    toolInvocations?: any;
  }>;
}) {
  try {
    await prisma.$transaction(
      messages.map((message) =>
        prisma.chatMessage.create({
          data: {
            id: message.id,
            chatId: message.chatId,
            content: message.content,
            role: message.role,
            senderId: message.role === "user" ? message.senderId : null,
            createdAt: message.createdAt || new Date(),
            toolInvocations: message.toolInvocations ?? undefined,
          },
        }),
      ),
    );
  } catch (error) {
    console.error("Failed to save messages:", error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { chatId: id },
      orderBy: { createdAt: "asc" },
    });

    return messages.map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content ?? "",
      createdAt: msg.createdAt,
      toolInvocations: msg.toolInvocations,
    }));
  } catch (error) {
    console.error("Failed to get messages by chat id:", error);
    return [];
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await prisma.chat.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Failed to delete chat by id:", error);
    throw error;
  }
}

export async function getChatsByUserId({ userId }: { userId: string }) {
  try {
    return await prisma.chat.findMany({
      where: { userId, type: "ai" },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to get chats by user id:", error);
    return [];
  }
}
