import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { workoutSessionId, duration, notes } = await req.json();

    if (!workoutSessionId) {
      return NextResponse.json(
        { error: "ID de la sesión de entrenamiento no proporcionado" },
        { status: 400 }
      );
    }

    // Verificar que la sesión pertenece al usuario
    const workoutSession = await prisma.workoutSession.findUnique({
      where: { id: workoutSessionId },
    });

    if (!workoutSession) {
      return NextResponse.json(
        { error: "Sesión de entrenamiento no encontrada" },
        { status: 404 }
      );
    }

    if (workoutSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para modificar esta sesión de entrenamiento" },
        { status: 403 }
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

    return NextResponse.json(updatedWorkoutSession);
  } catch (error) {
    console.error("Error al completar sesión de entrenamiento:", error);
    return NextResponse.json(
      { error: "Error al completar sesión de entrenamiento" },
      { status: 500 }
    );
  }
}
