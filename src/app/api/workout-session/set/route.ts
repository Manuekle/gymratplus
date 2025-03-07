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

    const { setId, weight, reps, completed } = await req.json();

    if (!setId) {
      return NextResponse.json(
        { error: "ID del set no proporcionado" },
        { status: 400 }
      );
    }

    // Verificar que el set pertenece a una sesión del usuario
    const setWithSession = await prisma.setSession.findUnique({
      where: { id: setId },
      include: {
        exerciseSession: {
          include: {
            workoutSession: true,
          },
        },
      },
    });

    if (!setWithSession) {
      return NextResponse.json({ error: "Set no encontrado" }, { status: 404 });
    }

    if (
      setWithSession.exerciseSession.workoutSession.userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "No autorizado para modificar este set" },
        { status: 403 }
      );
    }

    // Actualizar el set
    const updatedSet = await prisma.setSession.update({
      where: { id: setId },
      data: {
        weight: weight !== undefined ? weight : setWithSession.weight,
        reps: reps !== undefined ? reps : setWithSession.reps,
        completed:
          completed !== undefined ? completed : setWithSession.completed,
      },
    });

    return NextResponse.json(updatedSet);
  } catch (error) {
    console.error("Error al actualizar set:", error);
    return NextResponse.json(
      { error: "Error al actualizar set" },
      { status: 500 }
    );
  }
}
