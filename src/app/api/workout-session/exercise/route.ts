import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { exerciseSessionId, completed } = await req.json();

    if (!exerciseSessionId) {
      return NextResponse.json(
        { error: "ID de la sesión de ejercicio no proporcionado" },
        { status: 400 },
      );
    }

    // Verificar que el ejercicio pertenece a una sesión del usuario
    const exerciseSession = await prisma.exerciseSession.findUnique({
      where: { id: exerciseSessionId },
      include: {
        workoutSession: true,
      },
    });

    if (!exerciseSession) {
      return NextResponse.json(
        { error: "Sesión de ejercicio no encontrada" },
        { status: 404 },
      );
    }

    if (exerciseSession.workoutSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para modificar esta sesión de ejercicio" },
        { status: 403 },
      );
    }

    // Actualizar el ejercicio
    const updatedExerciseSession = await prisma.exerciseSession.update({
      where: { id: exerciseSessionId },
      data: {
        completed:
          completed !== undefined ? completed : exerciseSession.completed,
      },
      include: {
        sets: true,
      },
    });

    // Si se marca como completado, también marcar todos los sets como completados
    if (completed === true) {
      await prisma.setSession.updateMany({
        where: { exerciseSessionId },
        data: { completed: true },
      });
    }

    return NextResponse.json(updatedExerciseSession);
  } catch (error) {
    console.error("Error al actualizar sesión de ejercicio:", error);
    return NextResponse.json(
      { error: "Error al actualizar sesión de ejercicio" },
      { status: 500 },
    );
  }
}
