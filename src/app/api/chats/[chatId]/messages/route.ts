import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "../../../../../../auth.ts";

// DELETE /api/chats/[chatId]/messages - Delete all messages in a chat
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { chatId } = await params;

    // Verify user has access to this chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        studentInstructor: {
          include: {
            student: true,
            instructor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Check if user is part of this chat
    const isStudent = chat.studentInstructor.studentId === userId;
    const isInstructor = chat.studentInstructor.instructor.userId === userId;

    if (!isStudent && !isInstructor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete all messages in the chat
    const result = await prisma.chatMessage.updateMany({
      where: {
        chatId,
      },
      data: {
        deleted: true,
        deletedAt: new Date(),
        content: null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        deletedCount: result.count,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[DELETE_CHAT_MESSAGES_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to clear chat" },
      { status: 500 },
    );
  }
}
