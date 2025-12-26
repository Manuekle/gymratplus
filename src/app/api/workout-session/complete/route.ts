import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { WorkoutStreakService } from "@/lib/workout/workout-streak-service";
import { auth } from "@auth";

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

    // Note: Notification is handled by frontend toast for immediate user feedback
    // Backend notifications removed to prevent duplicates

    return NextResponse.json(updatedWorkoutSession);
  } catch (error) {
    console.error("Error al completar sesión de entrenamiento:", error);
    return NextResponse.json(
      { error: "Error al completar sesión de entrenamiento" },
      { status: 500 },
    );
  }
}
