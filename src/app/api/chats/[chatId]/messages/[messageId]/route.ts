import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";
import { auth } from "@auth";

const editMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

// PATCH /api/chats/[chatId]/messages/[messageId] - Edit a message
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string; messageId: string }> },
) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { chatId, messageId } = await params;
    const body = await req.json();
    const { content } = editMessageSchema.parse(body);

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

    // Get the message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if message belongs to this chat
    if (message.chatId !== chatId) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user is the sender
    if (message.senderId !== userId) {
      return NextResponse.json(
        { error: "You can only edit your own messages" },
        { status: 403 },
      );
    }

    // Check if message is deleted
    if (message.deleted) {
      return NextResponse.json(
        { error: "Cannot edit deleted message" },
        { status: 400 },
      );
    }

    // Update message
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content,
        edited: true,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedMessage.id,
      content: updatedMessage.content,
      type: updatedMessage.type,
      fileUrl: updatedMessage.fileUrl,
      fileName: updatedMessage.fileName,
      fileSize: updatedMessage.fileSize,
      mimeType: updatedMessage.mimeType,
      duration: updatedMessage.duration,
      thumbnail: updatedMessage.thumbnail,
      senderId: updatedMessage.senderId,
      sender: updatedMessage.sender,
      read: updatedMessage.read,
      deleted: updatedMessage.deleted,
      edited: updatedMessage.edited,
      editedAt: updatedMessage.editedAt,
      createdAt: updatedMessage.createdAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid message content" },
        { status: 400 },
      );
    }
    console.error("[EDIT_MESSAGE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to edit message" },
      { status: 500 },
    );
  }
}

// DELETE /api/chats/[chatId]/messages/[messageId] - Delete a message
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string; messageId: string }> },
) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { chatId, messageId } = await params;

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

    // Get the message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if message belongs to this chat
    if (message.chatId !== chatId) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if user is the sender
    if (message.senderId !== userId) {
      return NextResponse.json(
        { error: "You can only delete your own messages" },
        { status: 403 },
      );
    }

    // Soft delete message
    const deletedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        deleted: true,
        deletedAt: new Date(),
        content: null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: deletedMessage.id,
      content: deletedMessage.content,
      type: deletedMessage.type,
      fileUrl: deletedMessage.fileUrl,
      fileName: deletedMessage.fileName,
      fileSize: deletedMessage.fileSize,
      mimeType: deletedMessage.mimeType,
      duration: deletedMessage.duration,
      thumbnail: deletedMessage.thumbnail,
      senderId: deletedMessage.senderId,
      sender: deletedMessage.sender,
      read: deletedMessage.read,
      deleted: deletedMessage.deleted,
      deletedAt: deletedMessage.deletedAt,
      edited: deletedMessage.edited,
      editedAt: deletedMessage.editedAt,
      createdAt: deletedMessage.createdAt,
    });
  } catch (error) {
    console.error("[DELETE_MESSAGE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 },
    );
  }
}
