import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!params || !params.id) {
    return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const workout = await prisma.workout.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: {
        exercises: {
          select: {
            id: true,
            sets: true,
            reps: true,
            weight: true,
            restTime: true,
            order: true,
            notes: true,
            exercise: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "Workout no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error obteniendo workout:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, description, exercises } = body;

    if (!name || exercises?.length === 0) {
      return NextResponse.json(
        { error: "Nombre y ejercicios requeridos" },
        { status: 400 }
      );
    }

    const workout = await prisma.workout.update({
      where: { id: params.id, userId: session.user.id },
      data: {
        name,
        description,
        exercises: {
          deleteMany: {}, // Eliminar ejercicios previos
          create: exercises.map((exercise: any) => ({
            exerciseId: exercise.id,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            restTime: exercise.restTime,
            order: exercise.order,
          })),
        },
      },
    });

    return NextResponse.json(workout);
  } catch (error) {
    return NextResponse.json(
      { error: "Error actualizando workout" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    await prisma.workout.delete({
      where: { id: params.id, userId: session.user.id },
    });
    return NextResponse.json({ message: "Workout eliminado" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error eliminando workout" },
      { status: 500 }
    );
  }
}
