import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@auth";

// GET /api/chats - Get all chats for the current user
export async function GET() {
  try {
    const session = await auth();

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
        include: {
          studentInstructor: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  email: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
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
        include: {
          studentInstructor: {
            include: {
              instructor: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    // Format response - Optimized: Use groupBy to avoid N+1 query
    const chatIds = chats.map((c) => c.id);

    // Single query to get all unread counts at once
    const unreadCounts = await prisma.chatMessage.groupBy({
      by: ["chatId"],
      where: {
        chatId: { in: chatIds },
        senderId: { not: userId },
        read: false,
      },
      _count: { id: true },
    });

    // Create a map for O(1) lookup
    const unreadMap = new Map(
      unreadCounts.map((u) => [u.chatId, u._count.id]),
    );

    // Format chats without additional queries
    const formattedChats = chats.map((chat) => {
      const lastMessage = chat.messages[0] || null;
      const otherUser = instructorProfile
        ? (chat as any).studentInstructor.student
        : (chat as any).studentInstructor.instructor.user;

      return {
        id: chat.id,
        studentInstructorId: chat.studentInstructorId,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          image: otherUser.image,
          email: otherUser.email,
        },
        lastMessage: lastMessage
          ? {
            id: lastMessage.id,
            content: lastMessage.content,
            senderId: lastMessage.senderId,
            sender: lastMessage.sender
              ? {
                id: lastMessage.sender.id,
                name: lastMessage.sender.name,
                image: lastMessage.sender.image,
              }
              : null,
            type: lastMessage.type,
            createdAt: lastMessage.createdAt.toISOString(),
            read: lastMessage.read,
          }
          : null,
        unreadCount: unreadMap.get(chat.id) || 0,
        updatedAt: chat.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(formattedChats, { status: 200 });
  } catch (error) {
    console.error("[GET_CHATS_ERROR]", error);

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error code:", error.code);
      return NextResponse.json(
        { error: "Error de base de datos al cargar los chats" },
        { status: 500 },
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      { status: 500 },
    );
  }
}
