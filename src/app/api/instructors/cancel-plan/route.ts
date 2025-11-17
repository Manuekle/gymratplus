import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { redis } from "@/lib/database/redis";
import { createNotification } from "@/lib/notifications/notification-service";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    // Verificar si el perfil de instructor existe primero
    const existingProfile = await prisma.instructorProfile.findUnique({
      where: { userId },
      include: {
        students: {
          where: {
            status: "accepted", // Solo estudiantes con relación activa
          },
          include: {
            student: {
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

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Perfil de instructor no encontrado" },
        { status: 404 },
      );
    }

    // Obtener información del instructor para las notificaciones
    const instructor = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    });

    // Actualizar el estado del plan del instructor y el estado del usuario
    // IMPORTANTE: NO eliminamos datos, solo marcamos como inactivo
    await prisma.$transaction([
      // Actualizar el perfil del instructor (marcar como no pagado, pero mantener el perfil)
      prisma.instructorProfile.update({
        where: { userId },
        data: { isPaid: false },
      }),
      // Actualizar el estado del usuario (ya no es instructor activo)
      prisma.user.update({
        where: { id: userId },
        data: { isInstructor: false },
      }),
      // Marcar las relaciones estudiante-instructor como "inactive" en lugar de eliminarlas
      // Esto mantiene el historial pero indica que el instructor ya no está disponible
      prisma.studentInstructor.updateMany({
        where: {
          instructorProfileId: existingProfile.id,
          status: "accepted", // Solo actualizar relaciones activas
        },
        data: {
          status: "inactive", // Cambiar a inactive en lugar de eliminar
        },
      }),
    ]);

    // IMPORTANTE: NO eliminamos:
    // - InstructorProfile (se mantiene con isPaid: false)
    // - StudentInstructor (se mantiene con status: "inactive")
    // - Workout asignados (se mantienen)
    // - FoodRecommendation asignados (se mantienen)
    // - Chat y ChatMessage (se mantienen)

    // Notificar a todos los estudiantes activos que su instructor ya no está disponible
    const studentNotifications = existingProfile.students.map((rel) =>
      createNotification({
        userId: rel.studentId,
        title: "Instructor no disponible",
        message: `Tu instructor ${instructor?.name || "ha cancelado su suscripción"}. Ya no estará disponible para nuevas consultas, pero tus planes de entrenamiento y alimentación seguirán disponibles.`,
        type: "system",
      }),
    );

    await Promise.all(studentNotifications);

    // Notificar al instructor sobre la cancelación
    await createNotification({
      userId,
      title: "Suscripción cancelada",
      message:
        "Tu suscripción ha sido cancelada exitosamente. Ya no tendrás acceso a las funciones premium. Tus estudiantes han sido notificados.",
      type: "system",
    });

    // Limpiar todas las cachés relacionadas con el usuario
    const cacheKeys = [
      `user:${userId}:data`,
      `profile:${userId}`,
      `session:${userId}`,
      `instructorProfile:${userId}`,
    ];

    // También limpiar cachés de estudiantes afectados
    const studentCacheKeys = existingProfile.students.map(
      (rel) => `user:${rel.studentId}:data`,
    );

    // Eliminar todas las cachés
    await Promise.all(
      [...cacheKeys, ...studentCacheKeys].map((key) => redis.del(key)),
    ).catch(() => {});

    // Aquí podrías cancelar suscripciones activas en tu proveedor de pagos
    // Por ejemplo, si usas Stripe:
    // if (instructor.stripeSubscriptionId) {
    //   await cancelStripeSubscription(instructor.stripeSubscriptionId);
    // }

    return NextResponse.json(
      {
        message: "Plan cancelado exitosamente",
        studentsNotified: existingProfile.students.length,
      },
      { status: 200 },
    );
  } catch (error) {
    // Log more detailed error information
    if (error instanceof Error) {
      console.error({
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      {
        error:
          "Error al cancelar el plan. Por favor, inténtalo de nuevo más tarde.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
