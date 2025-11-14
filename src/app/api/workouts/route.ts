import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";

import {
  createLegWorkout,
  createChestTricepsWorkout,
  createBackBicepsWorkout,
  createShoulderWorkout,
  createCoreWorkout,
} from "@/lib/workout/workout-utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    // Optimize: only select needed fields
    const workouts = await prisma.workout.findMany({
      where: {
        OR: [
          { createdById: session.user.id },
          { assignedToId: session.user.id },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        status: true,
        notes: true,
        createdById: true,
        instructorId: true,
        assignedToId: true,
        createdAt: true,
        updatedAt: true,
        exercises: {
          select: {
            id: true,
            exerciseId: true,
            order: true,
            exercise: {
              select: {
                id: true,
                name: true,
                muscleGroup: true,
                equipment: true,
              },
            },
            sets: true,
            reps: true,
            weight: true,
            restTime: true,
            notes: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
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

    // Mapear la respuesta para incluir campos necesarios y convertir fechas
    const mappedWorkouts = workouts.map((workout) => ({
      id: workout.id,
      name: workout.name,
      description: workout.description,
      type: workout.type,
      status: workout.status,
      notes: workout.notes,
      createdById: workout.createdById,
      instructorId: workout.instructorId,
      assignedToId: workout.assignedToId,
      userId: workout.createdById, // Alias para compatibilidad con el hook
      createdAt: workout.createdAt.toISOString(),
      updatedAt: workout.updatedAt.toISOString(),
      isTemplate: false, // El schema no tiene template, solo personal/assigned
      exercises: workout.exercises.map((ex) => ({
        id: ex.id,
        exerciseId: ex.exerciseId,
        order: ex.order,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        restTime: ex.restTime,
        notes: ex.notes,
        exercise: ex.exercise
          ? {
              id: ex.exercise.id,
              name: ex.exercise.name,
              muscleGroup: ex.exercise.muscleGroup,
              equipment: ex.exercise.equipment,
            }
          : null,
      })),
      instructor: workout.instructor,
      createdBy: workout.createdBy,
    }));

    return NextResponse.json(mappedWorkouts);
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
