import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "../../../../../../auth.ts";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const workoutId = params.id;

    // Obtener el workout asignado al estudiante
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        assignedToId: session.user.id,
        type: "assigned",
        status: { not: "deleted" },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "Rutina no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error al obtener la rutina asignada:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
