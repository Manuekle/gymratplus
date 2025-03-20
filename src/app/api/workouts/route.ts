import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

import {
  createLegWorkout,
  createChestTricepsWorkout,
  createBackBicepsWorkout,
  createShoulderWorkout,
  createCoreWorkout,
} from "@/lib/workout-utils";

export async function GET() {
  const session = await getServerSession();
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const workouts = await prisma.workout.findMany({
      where: { userId: session.user.id },
      include: { exercises: true },
    });
    return NextResponse.json(workouts);
  } catch {
    return NextResponse.json(
      { error: "Error obteniendo workouts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, description, exercises, goal, type } = body;

    if (!name || exercises?.length === 0 || !type) {
      return NextResponse.json(
        { error: "Nombre, ejercicios y tipo de rutina requeridos" },
        { status: 400 }
      );
    }

    const workout = await prisma.workout.create({
      data: {
        name,
        description,
        userId: session.user.id,
      },
    });

    switch (type) {
      case "leg":
        await createLegWorkout(workout.id, exercises, goal);
        break;
      case "chest-triceps":
        await createChestTricepsWorkout(workout.id, exercises, goal);
        break;
      case "back-biceps":
        await createBackBicepsWorkout(workout.id, exercises, goal);
        break;
      case "shoulder":
        await createShoulderWorkout(workout.id, exercises, goal);
        break;
      case "core":
        await createCoreWorkout(workout.id, exercises, goal);
        break;
      default:
        return NextResponse.json(
          { error: "Tipo de rutina no válido" },
          { status: 400 }
        );
    }

    return NextResponse.json(workout, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error creando workout" },
      { status: 500 }
    );
  }
}
