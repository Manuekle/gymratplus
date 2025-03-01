import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: session.user.id },
      include: { exercises: true },
    });
    return NextResponse.json(workouts);
  } catch (error) {
    return NextResponse.json(
      { error: "Error obteniendo workouts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    const workout = await prisma.workout.create({
      data: {
        name,
        description,
        userId: session.user.id,
        exercises: {
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

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error creando workout" },
      { status: 500 }
    );
  }
}
