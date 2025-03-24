import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    const { exerciseIds, name = "Entrenamiento Personalizado" } =
      await request.json();

    if (
      !exerciseIds ||
      !Array.isArray(exerciseIds) ||
      exerciseIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Exercise IDs are required" },
        { status: 400 }
      );
    }

    const exercises = await prisma.exercise.findMany({
      where: {
        id: { in: exerciseIds },
      },
    });

    if (exercises.length !== exerciseIds.length) {
      return NextResponse.json(
        { error: "One or more exercise IDs are invalid" },
        { status: 400 }
      );
    }

    const workout = await prisma.workout.create({
      data: {
        name,
        description: "Entrenamiento personalizado",
        userId,
      },
    });

    const exercisesByMuscleGroup: Record<string, typeof exercises> =
      exercises.reduce((acc, exercise) => {
        if (!acc[exercise.muscleGroup]) {
          acc[exercise.muscleGroup] = [];
        }
        acc[exercise.muscleGroup].push(exercise);
        return acc;
      }, {} as Record<string, typeof exercises>);

    await Promise.all(
      Object.entries(exercisesByMuscleGroup).flatMap(
        ([muscleGroup, muscleGroupExercises], muscleGroupIndex) =>
          muscleGroupExercises.map((exercise, exerciseIndex) =>
            prisma.workoutExercise.create({
              data: {
                workoutId: workout.id,
                exerciseId: exercise.id,
                sets: 3,
                reps: "10",
                restTime: "60",
                notes: muscleGroup,
                order: muscleGroupIndex + exerciseIndex,
              },
            })
          )
      )
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
          reps: exercise.reps.toString(),
          restTime: exercise.restTime.toString() ?? "60", // Valor por defecto para evitar null
          notes: exercise.notes ?? "Sin grupo muscular", // Valor por defecto
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
    };

    return NextResponse.json(formattedWorkout);
  } catch (error) {
    console.error("Error al crear el entrenamiento personalizado:", error);
    return NextResponse.json(
      {
        error: "Error al crear el entrenamiento personalizado",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

function formatWorkoutPlan(
  workoutExercises: {
    id: string;
    name: string;
    sets: number;
    reps: string;
    restTime: string;
    notes: string;
  }[]
): { day: string; exercises: typeof workoutExercises }[] {
  if (!Array.isArray(workoutExercises)) {
    return [];
  }

  const exercisesByDay = workoutExercises.reduce<
    Record<string, typeof workoutExercises>
  >((acc, ex) => {
    if (!acc[ex.notes]) acc[ex.notes] = [];
    acc[ex.notes].push(ex);
    return acc;
  }, {});

  return Object.entries(exercisesByDay).map(([day, exercises]) => ({
    day,
    exercises,
  }));
}
