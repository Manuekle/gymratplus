import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { createNotificationByEmail } from "@/lib/notifications/notification-service";
import { auth } from "../../../../../../../../../../../auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const studentId = session.user.id;
    const studentInstructorId = params.id; // ID de la relación StudentInstructor

    // Verificar que existe la relación y que el estudiante es el dueño
    const relationship = await prisma.studentInstructor.findFirst({
      where: {
        id: studentInstructorId,
        studentId: studentId,
        status: { in: ["active", "accepted"] },
      },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: "Relación con instructor no encontrada o ya cancelada" },
        { status: 404 },
      );
    }

    const instructorUserId = relationship.instructor.userId;

    // Usar transacción para asegurar consistencia
    await prisma.$transaction(async (tx) => {
      // 1. Cambiar el estado de la relación a "cancelled"
      await tx.studentInstructor.update({
        where: { id: relationship.id },
        data: { status: "cancelled" },
      });

      // 2. Eliminar planes de alimentación asignados por este instructor
      // Solo eliminar los que tienen instructorId y assignedToId (asignados por el instructor)
      await tx.foodRecommendation.deleteMany({
        where: {
          instructorId: instructorUserId,
          assignedToId: studentId,
        },
      });

      // 3. Eliminar rutinas asignadas por este instructor
      // Solo eliminar las que tienen instructorId y assignedToId
      await tx.workout.deleteMany({
        where: {
          instructorId: instructorUserId,
          assignedToId: studentId,
        },
      });
    });

    // Crear notificación para el instructor
    if (relationship.instructor.user.email) {
      await createNotificationByEmail({
        userEmail: relationship.instructor.user.email,
        title: "Estudiante canceló la relación",
        message: `${session.user.name || "Un estudiante"} ha cancelado su relación contigo.`,
        type: "system",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Relación con instructor cancelada correctamente",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al cancelar relación con instructor:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
