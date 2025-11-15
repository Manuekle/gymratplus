import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { publishChatMessage } from "@/lib/database/chat-redis";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const messageSchema = z
  .object({
    content: z.string().max(5000).optional().nullable(),
    type: z.enum(["text", "image", "audio", "video", "file"]).default("text"),
    fileUrl: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) =>
          !val ||
          (typeof val === "string" &&
            (val.trim().length === 0 ||
              z.string().url().safeParse(val).success)),
        { message: "fileUrl must be a valid URL if provided" },
      ),
    fileName: z.string().optional().nullable(),
    fileSize: z.number().int().positive().optional().nullable(),
    mimeType: z.string().optional().nullable(),
    duration: z.number().int().positive().optional().nullable(),
    thumbnail: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) =>
          !val ||
          (typeof val === "string" &&
            (val.trim().length === 0 ||
              z.string().url().safeParse(val).success)),
        { message: "thumbnail must be a valid URL if provided" },
      ),
    replyToId: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // Must have either content (non-empty) or fileUrl (non-empty)
      const hasContent =
        data.content &&
        typeof data.content === "string" &&
        data.content.trim().length > 0;
      const hasFileUrl =
        data.fileUrl &&
        typeof data.fileUrl === "string" &&
        data.fileUrl.trim().length > 0;
      return hasContent || hasFileUrl;
    },
    {
      message: "Message must have either content or fileUrl",
    },
  );

// GET /api/chats/[chatId] - Get messages for a specific chat
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

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

    // Check if relationship is active
    if (chat.studentInstructor.status !== "active") {
      return NextResponse.json(
        { error: "Chat is not available" },
        { status: 403 },
      );
    }

    // Check for incremental update (since parameter)
    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since");

    let messages;
    if (since) {
      // Incremental update - only get messages after the given timestamp
      const sinceDate = new Date(since);
      messages = await prisma.chatMessage.findMany({
        where: {
          chatId,
          createdAt: {
            gt: sinceDate,
          },
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
        orderBy: { createdAt: "asc" },
      });
    } else {
      // Full load - get last 100 messages
      messages = await prisma.chatMessage.findMany({
        where: { chatId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        take: 100,
      });
    }

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json(
      {
        chat: {
          id: chat.id,
          studentInstructorId: chat.studentInstructorId,
        },
        messages: messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          type: msg.type,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          mimeType: msg.mimeType,
          duration: msg.duration,
          thumbnail: msg.thumbnail,
          senderId: msg.senderId,
          sender: msg.sender,
          read: msg.read,
          deleted: msg.deleted,
          deletedAt: msg.deletedAt?.toISOString(),
          edited: msg.edited,
          editedAt: msg.editedAt?.toISOString(),
          replyToId: msg.replyToId,
          createdAt: msg.createdAt.toISOString(),
        })),
      },
      { status: 200 },
    );
  } catch {
    console.error("[GET_CHAT_MESSAGES_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST /api/chats/[chatId] - Send a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { chatId } = await params;
    const body = await req.json();
    const messageData = messageSchema.parse(body);

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

    // Check if relationship is active
    if (chat.studentInstructor.status !== "active") {
      return NextResponse.json(
        { error: "Chat is not available" },
        { status: 403 },
      );
    }

    // Create message in database
    const messageDataToCreate: Prisma.ChatMessageCreateInput = {
      chatId,
      senderId: userId,
      content: messageData.content || null,
      type: messageData.type,
      fileUrl: messageData.fileUrl || null,
      fileName: messageData.fileName || null,
      fileSize: messageData.fileSize || null,
      mimeType: messageData.mimeType || null,
      duration: messageData.duration || null,
      thumbnail: messageData.thumbnail || null,
    };

    // Only include replyToId if it's provided
    if (messageData.replyToId) {
      messageDataToCreate.replyToId = messageData.replyToId;
    }

    const message = await prisma.chatMessage.create({
      data: messageDataToCreate,
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

    // Update chat updatedAt
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Publish to Redis for real-time delivery
    await publishChatMessage(chatId, {
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    });

    return NextResponse.json(
      {
        id: message.id,
        content: message.content,
        type: message.type,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        fileSize: message.fileSize,
        mimeType: message.mimeType,
        duration: message.duration,
        thumbnail: message.thumbnail,
        senderId: message.senderId,
        sender: message.sender,
        read: message.read,
        deleted: message.deleted,
        deletedAt: message.deletedAt?.toISOString(),
        edited: message.edited,
        editedAt: message.editedAt?.toISOString(),
        replyToId: message.replyToId,
        createdAt: message.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch {
    if (error instanceof z.ZodError) {
      console.error("[SEND_MESSAGE_VALIDATION_ERROR]", error.errors);
      return NextResponse.json(
        {
          error: "Invalid message content",
          details: error.errors,
        },
        { status: 400 },
      );
    }
    console.error("[SEND_MESSAGE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
