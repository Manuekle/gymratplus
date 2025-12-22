import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { publishWorkoutNotification } from "@/lib/notifications/workout-notifications";
import { createNotification } from "@/lib/notifications/notification-service";
import { WorkoutStreakService } from "@/lib/workout/workout-streak-service";
import { auth } from "../../../../../auth.ts";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { workoutSessionId, duration, notes } = await req.json();

    if (!workoutSessionId) {
      return NextResponse.json(
        { error: "ID de la sesión de entrenamiento no proporcionado" },
        { status: 400 },
      );
    }

    // Verificar que la sesión pertenece al usuario
    const workoutSession = await prisma.workoutSession.findUnique({
      where: { id: workoutSessionId },
      include: {
        workout: {
          select: {
            name: true,
            type: true,
            instructorId: true,
            instructor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!workoutSession) {
      return NextResponse.json(
        { error: "Sesión de entrenamiento no encontrada" },
        { status: 404 },
      );
    }

    if (workoutSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para modificar esta sesión de entrenamiento" },
        { status: 403 },
      );
    }

    // Actualizar la sesión de entrenamiento
    const updatedWorkoutSession = await prisma.workoutSession.update({
      where: { id: workoutSessionId },
      data: {
        completed: true,
        duration: duration || workoutSession.duration,
        notes: notes || workoutSession.notes,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
        workout: {
          select: { name: true },
        },
      },
    });

    // Marcar todos los ejercicios y sets como completados
    await prisma.exerciseSession.updateMany({
      where: { workoutSessionId },
      data: { completed: true },
    });

    const exerciseSessions = await prisma.exerciseSession.findMany({
      where: { workoutSessionId },
      select: { id: true },
    });

    await prisma.setSession.updateMany({
      where: {
        exerciseSessionId: {
          in: exerciseSessions.map((es) => es.id),
        },
      },
      data: { completed: true },
    });

    // Actualizar la racha de entrenamiento
    const streakService = new WorkoutStreakService();
    await streakService.updateStreak(session.user.id, true);

    // Create notification for workout completion
    try {
      // Check if user has notifications enabled
      const userProfile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { notificationsActive: true },
      });

      if (userProfile?.notificationsActive !== false) {
        // Default to true if not set
        const workoutName = workoutSession.workout?.name || "Entrenamiento";
        const workoutType = workoutSession.workout?.type;
        const instructorName = workoutSession.workout?.instructor?.name;

        // Si el entrenamiento fue asignado por un instructor, crear notificación especial
        if (
          workoutType === "assigned" &&
          workoutSession.workout?.instructorId
        ) {
          // Crear notificación específica para entrenamientos asignados
          await createNotification({
            userId: session.user.id,
            title: "Entrenamiento completado",
            message: `¡Felicidades! Has completado el entrenamiento "${workoutName}" de hoy${instructorName ? ` asignado por ${instructorName}` : ""}.`,
            type: "workout",
          });

          console.log(
            `Assigned workout completion notification created for user ${session.user.id}`,
          );
        } else {
          // Para entrenamientos personales, usar el sistema de notificaciones existente
          await publishWorkoutNotification(
            session.user.id,
            workoutSessionId,
            "completed",
            workoutName,
          );

          console.log(
            `Workout completion notification queued for user ${session.user.id}`,
          );
        }
      }
    } catch (notificationError) {
      // Log but don't fail the request if notification creation fails
      console.error(
        "Error creating workout completion notification:",
        notificationError,
      );
    }

    return NextResponse.json(updatedWorkoutSession);
  } catch (error) {
    console.error("Error al completar sesión de entrenamiento:", error);
    return NextResponse.json(
      { error: "Error al completar sesión de entrenamiento" },
      { status: 500 },
    );
  }
}
