import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { Prisma } from "@prisma/client";

// GET /api/chats - Get all chats for the current user
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

    // Format response
    const formattedChats = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = chat.messages[0] || null;
        const otherUser = instructorProfile
          ? chat.studentInstructor.student
          : chat.studentInstructor.instructor.user;

        // Count unread messages (get all unread messages, not just the last one)
        const unreadCount = await prisma.chatMessage.count({
          where: {
            chatId: chat.id,
            senderId: { not: userId },
            read: false,
          },
        });

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
                sender: {
                  id: lastMessage.sender.id,
                  name: lastMessage.sender.name,
                  image: lastMessage.sender.image,
                },
                type: lastMessage.type,
                createdAt: lastMessage.createdAt.toISOString(),
                read: lastMessage.read,
              }
            : null,
          unreadCount,
          updatedAt: chat.updatedAt.toISOString(),
        };
      }),
    );

    return NextResponse.json(formattedChats, { status: 200 });
  } catch {
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
