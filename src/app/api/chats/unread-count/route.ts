import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

// GET /api/chats/unread-count - Get total unread messages count for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user is instructor or student
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId },
    });

    let chats;

    if (instructorProfile) {
      // Get chats where user is instructor
      chats = await prisma.chat.findMany({
        where: {
          studentInstructor: {
            instructorProfileId: instructorProfile.id,
            status: "active",
          },
        },
        select: { id: true },
      });
    } else {
      // Get chats where user is student
      chats = await prisma.chat.findMany({
        where: {
          studentInstructor: {
            studentId: userId,
            status: "active",
          },
        },
        select: { id: true },
      });
    }

    // Count total unread messages across all chats
    const totalUnreadCount = await prisma.chatMessage.count({
      where: {
        chatId: { in: chats.map((c) => c.id) },
        senderId: { not: userId },
        read: false,
      },
    });

    return NextResponse.json(
      { unreadCount: totalUnreadCount },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET_UNREAD_COUNT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
