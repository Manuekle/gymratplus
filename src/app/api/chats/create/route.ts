import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "../../../../../../../../../../auth";

// POST /api/chats/create - Create a new chat for a student-instructor relationship
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { studentInstructorId } = body;

    if (!studentInstructorId) {
      return NextResponse.json(
        { error: "studentInstructorId is required" },
        { status: 400 },
      );
    }

    // Verify the relationship exists and is active
    const relationship = await prisma.studentInstructor.findUnique({
      where: { id: studentInstructorId },
      include: {
        student: true,
        instructor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 },
      );
    }

    // Check if user is part of this relationship
    const isStudent = relationship.studentId === userId;
    const isInstructor = relationship.instructor.userId === userId;

    if (!isStudent && !isInstructor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if relationship is active
    if (relationship.status !== "active") {
      return NextResponse.json(
        { error: "Relationship must be active to create a chat" },
        { status: 403 },
      );
    }

    // Check if chat already exists
    const existingChat = await prisma.chat.findUnique({
      where: { studentInstructorId },
    });

    if (existingChat) {
      return NextResponse.json(existingChat, { status: 200 });
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        studentInstructorId,
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
      },
    });

    return NextResponse.json(
      {
        id: chat.id,
        studentInstructorId: chat.studentInstructorId,
        createdAt: chat.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CREATE_CHAT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
