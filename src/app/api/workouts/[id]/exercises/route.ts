import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const workout = (await prisma.workout.findUnique({
      where: { id: id, userId: session.user.id },
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
    })) as {
      id: string;
      userId: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      description: string | null;
      exercises: {
        id: string;
        sets: number;
        reps: number;
        weight: number;
        restTime: number;
        order: number;
        notes: string;
        exercise: { id: string; name: string };
      }[];
      goal: string;
    };

    if (!workout) {
      return NextResponse.json(
        { error: "Workout no encontrado" },
        { status: 404 }
      );
    }

    // Formatear el plan de entrenamiento para la respuesta
    const formattedWorkout = {
      id: workout.id,
      name: workout.name,
      description: workout.description,
      days: formatWorkoutPlan(workout.exercises),
      // type: workout.type,
      // methodology: workout.methodology,
      goal: workout.goal,
    };

    return NextResponse.json(formattedWorkout);
  } catch (error) {
    console.error("Error obteniendo workout:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// Format workout plan for response
interface WorkoutExercise {
  id: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
  order: number;
  notes: string;
  exercise: {
    id: string;
    name: string;
  };
}

interface FormattedExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  notes: string;
}

interface FormattedWorkoutDay {
  day: string;
  exercises: FormattedExercise[];
}

function formatWorkoutPlan(
  workoutExercises: WorkoutExercise[]
): FormattedWorkoutDay[] {
  // Agrupar ejercicios por grupo muscular
  const exercisesByDay = workoutExercises.reduce<
    Record<string, WorkoutExercise[]>
  >((acc, ex) => {
    // Extraer el grupo muscular del campo notes
    const muscleGroupMatch = ex.notes?.match(/^([^-]+)/);
    const muscleGroup = muscleGroupMatch
      ? muscleGroupMatch[1].trim()
      : "General";

    if (!acc[muscleGroup]) acc[muscleGroup] = [];
    acc[muscleGroup].push(ex);
    return acc;
  }, {});

  // Formatear cada grupo muscular
  return Object.entries(exercisesByDay).map(([muscleGroup, exercises]) => {
    return {
      day: muscleGroup, // Usamos el grupo muscular como identificador del día
      exercises: exercises.map((ex) => ({
        id: ex.id,
        name: ex.exercise.name || "Ejercicio",
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime,
        notes: ex.notes?.replace(/^[^-]+ - /, "") || "",
      })),
    };
  });
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, description, exercises } = body;

    if (!name || exercises?.length === 0) {
      return NextResponse.json(
        { error: "Nombre y ejercicios requeridos" },
        { status: 400 }
      );
    }

    const workout = await prisma.workout.update({
      where: { id: id, userId: session.user.id },
      data: {
        name,
        description,
        exercises: {
          deleteMany: {}, // Eliminar ejercicios previos
          create: exercises.map(
            (exercise: {
              id: string;
              sets: number;
              reps: number;
              weight: number;
              restTime: number;
              order: number;
            }) => ({
              exerciseId: exercise.id,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              restTime: exercise.restTime,
              order: exercise.order,
            })
          ),
        },
      },
    });

    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error actualizando workout:", error);
    return NextResponse.json(
      { error: "Error actualizando workout" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    await prisma.workout.delete({
      where: { id: id, userId: session.user.id },
    });
    return NextResponse.json({ message: "Workout eliminado" });
  } catch (error) {
    console.error("Error eliminando workout:", error);
    return NextResponse.json(
      { error: "Error eliminando workout" },
      { status: 500 }
    );
  }
}
