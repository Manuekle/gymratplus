import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

type RouteParams = {
  id: string;
  exerciseId: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: RouteParams }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const workoutExercise = await prisma.workoutExercise.findFirst({
      where: {
        id: params.exerciseId,
        workoutId: params.id,
        workout: {
          userId: session.user.id,
        },
      },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            muscleGroup: true,
            equipment: true,
          },
        },
      },
    });

    if (!workoutExercise) {
      return NextResponse.json(
        { error: "Ejercicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(workoutExercise);
  } catch (error) {
    console.error("Error obteniendo ejercicio:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: RouteParams }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sets, reps, restTime, notes } = body;

    const workoutExercise = await prisma.workoutExercise.update({
      where: {
        id: params.exerciseId,
        workoutId: params.id,
        workout: {
          userId: session.user.id,
        },
      },
      data: {
        sets,
        reps,
        restTime,
        notes,
      },
      include: {
        exercise: {
          select: {
            id: true,
            name: true,
            muscleGroup: true,
            equipment: true,
          },
        },
      },
    });

    return NextResponse.json(workoutExercise);
  } catch (error) {
    console.error("Error actualizando ejercicio:", error);
    return NextResponse.json(
      { error: "Error actualizando ejercicio" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: RouteParams }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    await prisma.workoutExercise.delete({
      where: {
        id: params.exerciseId,
        workoutId: params.id,
        workout: {
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ message: "Ejercicio eliminado" });
  } catch (error) {
    console.error("Error eliminando ejercicio:", error);
    return NextResponse.json(
      { error: "Error eliminando ejercicio" },
      { status: 500 }
    );
  }
}
