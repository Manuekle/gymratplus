import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

import {
  createLegWorkout,
  createChestTricepsWorkout,
  createBackBicepsWorkout,
  createShoulderWorkout,
  createCoreWorkout,
} from "@/lib/workout-utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    // Obtener todos los workouts del usuario, incluyendo los asignados
    const workouts = await prisma.workout.findMany({
      where: {
        OR: [
          { createdById: session.user.id }, // Workouts creados por el usuario
          { assignedToId: session.user.id }, // Workouts asignados al usuario
        ],
      },
      include: {
        exercises: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Error obteniendo workouts:", error);
    return NextResponse.json(
      { error: "Error obteniendo workouts" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "No se pudo autenticar el usuario" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const { name, description, exercises, goal, type } = body;

    if (!name || exercises?.length === 0 || !type) {
      return NextResponse.json(
        { error: "Nombre, ejercicios y tipo de rutina requeridos" },
        { status: 400 },
      );
    }

    const workout = await prisma.workout.create({
      data: {
        name,
        description,
        createdById: session.user.id,
        type: "personal",
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
          { status: 400 },
        );
    }

    return NextResponse.json(workout, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error creando workout" },
      { status: 500 },
    );
  }
}
