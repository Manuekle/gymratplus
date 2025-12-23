import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";

interface DayExercise {
  exerciseId: string;
  day: string;
  sets: number;
  reps: number;
  restTime: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    const {
      exerciseIds,
      name = "Entrenamiento Personalizado",
      days,
      workoutType,
    } = await request.json();

    if (
      !exerciseIds ||
      !Array.isArray(exerciseIds) ||
      exerciseIds.length === 0 ||
      !days ||
      !Array.isArray(days) ||
      days.length === 0
    ) {
      return NextResponse.json(
        { error: "Exercise IDs and days are required" },
        { status: 400 },
      );
    }

    const exercises = await prisma.exercise.findMany({
      where: {
        id: { in: exerciseIds.map((ex: DayExercise) => ex.exerciseId) },
      },
    });

    if (
      exercises.length !==
      new Set(exerciseIds.map((ex: DayExercise) => ex.exerciseId)).size
    ) {
      return NextResponse.json(
        { error: "One or more exercise IDs are invalid" },
        { status: 400 },
      );
    }

    const workout = await prisma.workout.create({
      data: {
        name,
        description: `Entrenamiento personalizado - ${workoutType}`,
        createdById: userId,
        instructorId: userId,
        type: "personal",
      },
    });

    // Crear los ejercicios del entrenamiento con sus respectivos días
    await Promise.all(
      exerciseIds.map((exercise: DayExercise, index: number) =>
        prisma.workoutExercise.create({
          data: {
            workoutId: workout.id,
            exerciseId: exercise.exerciseId,
            sets: exercise.sets,
            reps: exercise.reps,
            restTime: exercise.restTime,
            notes: exercise.day,
            order: index,
          },
        }),
      ),
    );

    let workoutExercisesWithNames = await prisma.workoutExercise
      .findMany({
        where: {
          workoutId: workout.id,
        },
        include: {
          exercise: true,
        },
      })
      .then((workoutExercises) => {
        return workoutExercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          restTime: exercise.restTime ?? 60,
          notes: exercise.notes ?? "Sin día asignado",
        }));
      });

    if (!Array.isArray(workoutExercisesWithNames)) {
      workoutExercisesWithNames = [];
    }

    const formattedWorkout = {
      id: workout.id,
      name: workout.name,
      description: workout.description,
      days: formatWorkoutPlan(workoutExercisesWithNames),
      type: workoutType,
    };

    return NextResponse.json(formattedWorkout);
  } catch (error) {
    console.error("Error al crear el entrenamiento personalizado:", error);
    return NextResponse.json(
      {
        error: "Error al crear el entrenamiento personalizado",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}

function formatWorkoutPlan(
  workoutExercises: {
    id: string;
    name: string;
    sets: number;
    reps: number;
    restTime: number;
    notes: string;
  }[],
): { day: string; exercises: typeof workoutExercises }[] {
  if (!Array.isArray(workoutExercises)) {
    return [];
  }

  const exercisesByDay = workoutExercises.reduce<
    Record<string, typeof workoutExercises>
  >((acc, ex) => {
    if (!acc[ex.notes]) acc[ex.notes] = [];
    acc[ex.notes]?.push(ex);
    return acc;
  }, {});

  return Object.entries(exercisesByDay).map(([day, exercises]) => ({
    day,
    exercises,
  }));
}
