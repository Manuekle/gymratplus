import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const workoutSessionId = params.id;

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
        { error: "No autorizado para eliminar esta sesión de entrenamiento" },
        { status: 403 }
      );
    }

    // Eliminar primero los sets
    await prisma.setSession.deleteMany({
      where: {
        exerciseSession: {
          workoutSessionId,
        },
      },
    });

    // Eliminar los ejercicios
    await prisma.exerciseSession.deleteMany({
      where: { workoutSessionId },
    });

    // Eliminar la sesión de entrenamiento
    await prisma.workoutSession.delete({
      where: { id: workoutSessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar la sesión de entrenamiento:", error);
    return NextResponse.json(
      { error: "Error al eliminar la sesión de entrenamiento" },
      { status: 500 }
    );
  }
}
