import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";
import {
  publishTypingStatus,
  getTypingStatus,
} from "@/lib/database/chat-redis";

// POST /api/chats/[chatId]/typing - Notify typing status
export async function POST(
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
    const body = await req.json();
    const { isTyping } = body;

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

    // Publish typing status
    await publishTypingStatus(chatId, userId, isTyping === true);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[POST_TYPING_STATUS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// GET /api/chats/[chatId]/typing - Get typing status
export async function GET(
  _req: NextRequest,
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

    // Get typing status (exclude current user)
    const typingStatus = await getTypingStatus(chatId, userId);

    return NextResponse.json(
      { isTyping: typingStatus?.isTyping || false },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET_TYPING_STATUS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
