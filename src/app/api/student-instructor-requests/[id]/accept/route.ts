import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotificationByEmail } from "@/lib/notification-service";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const requestId = pathParts[pathParts.length - 2]; // El ID está en la penúltima posición
    if (!requestId) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    // Verificar si el usuario es un instructor y si la solicitud le pertenece
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructorProfile) {
      return NextResponse.json(
        { error: "Forbidden: User is not an instructor." },
        { status: 403 },
      );
    }

    const studentInstructorRequest = await prisma.studentInstructor.findUnique({
      where: { id: requestId },
    });

    if (!studentInstructorRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (studentInstructorRequest.instructorProfileId !== instructorProfile.id) {
      return NextResponse.json(
        { error: "Forbidden: Not authorized to accept this request." },
        { status: 403 },
      );
    }

    // Actualizar el estado de la solicitud a 'accepted'
    const updatedRequest = await prisma.studentInstructor.update({
      where: { id: requestId },
      data: {
        status: "active", // Cambiar a 'active' cuando se acepta
        startDate: new Date(), // Establecer la fecha de inicio de la relación
      },
      include: {
        student: {
          select: {
            name: true,
            email: true,
          },
        },
        instructor: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Crear notificación para el alumno
    await createNotificationByEmail({
      userEmail: updatedRequest.student.email!,
      title: "Solicitud aceptada",
      message: `${updatedRequest.instructor.user.name} ha aceptado tu solicitud. ¡Ya eres su alumno!`,
      type: "system",
    });

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error("[ACCEPT_STUDENT_REQUEST_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
