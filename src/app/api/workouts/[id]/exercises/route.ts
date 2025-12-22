import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "../../../../../../auth.ts";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { error: "Workout ID is required" },
      { status: 400 },
    );
  }

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const workout = await prisma.workout.findUnique({
      where: { id: id, createdById: session.user.id, type: "personal" },
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

    // Type assertion for the workout object
    type WorkoutWithExercises = {
      id: string;
      createdById: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      description: string | null;
      goal: string;
      exercises: Array<{
        id: string;
        sets: number;
        reps: number;
        weight: number | null;
        restTime: number | null;
        order: number;
        notes: string | null;
        exercise: { id: string; name: string };
      }>;
    };

    const typedWorkout = workout as WorkoutWithExercises | null;

    if (!typedWorkout) {
      return NextResponse.json(
        { error: "Entrenamiento no encontrado" },
        { status: 404 },
      );
    }

    // Format the workout plan for the response
    const formattedWorkout = {
      id: typedWorkout.id,
      name: typedWorkout.name,
      description: typedWorkout.description,
      days: formatWorkoutPlan(
        typedWorkout.exercises.map((ex) => ({
          ...ex,
          // Ensure we don't send null values for required fields
          weight: ex.weight ?? 0,
          restTime: ex.restTime ?? 0,
          notes: ex.notes ?? "",
          exercise: {
            id: ex.exercise.id,
            name: ex.exercise.name,
          },
        })),
      ),
      goal: typedWorkout.goal,
    };

    return NextResponse.json(formattedWorkout);
  } catch (error) {
    console.error("Error obteniendo workout:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 },
    );
  }
}

// Función auxiliar para extraer el ID del workout de la URL
function extractWorkoutIdFromUrl(url: string): string | null {
  // La URL será algo como /api/workouts/abc123/exercises
  const matches = url.match(/\/workouts\/([^/]+)\/exercises/);
  return matches ? matches[1] || null : null;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    // Extraer el ID del workout de la URL usando una función auxiliar
    const workoutId = extractWorkoutIdFromUrl(request.url);

    console.log("URL completa:", request.url);
    console.log("Workout ID extraído:", workoutId);

    // Validate that workoutId is not undefined
    if (!workoutId) {
      return NextResponse.json(
        {
          error:
            "ID de entrenamiento no proporcionado o formato de URL incorrecto",
        },
        { status: 400 },
      );
    }

    // Validate workout exists and belongs to the current user
    const existingWorkout = await prisma.workout.findUnique({
      where: {
        id: workoutId,
        createdById: session.user.id,
      },
    });

    if (!existingWorkout) {
      console.log(
        "Workout not found or not authorized. User ID:",
        session.user.id,
      );
      return NextResponse.json(
        { error: "Entrenamiento no encontrado o no autorizado" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { exerciseId, sets, reps, restTime, notes } = body;
    console.log("Request body:", body);

    // Validate exercise exists
    const existingExercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!existingExercise) {
      return NextResponse.json(
        { error: "Ejercicio no encontrado" },
        { status: 404 },
      );
    }

    if (!exerciseId || !sets || !reps) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 },
      );
    }

    // Obtain the last exercise order
    const lastExercise = await prisma.workoutExercise.findFirst({
      where: { workoutId },
      orderBy: { order: "desc" },
    });

    const newOrder = lastExercise ? lastExercise.order + 1 : 1;

    // Explicitly type the data object
    const workoutExerciseData = {
      workoutId: workoutId, // Ensure it's a non-optional string
      exerciseId,
      sets: Number(sets),
      reps: Number(reps),
      restTime: restTime ? Number(restTime) : 0,
      notes: notes || "",
      order: newOrder,
    };

    const workoutExercise = await prisma.workoutExercise.create({
      data: workoutExerciseData,
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
    console.error("Error creando ejercicio:", error);
    return NextResponse.json(
      {
        error: "Error creando ejercicio",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
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
  exerciseId: string; // ID real del ejercicio
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
  workoutExercises: WorkoutExercise[],
): FormattedWorkoutDay[] {
  // Agrupar ejercicios por grupo muscular
  const exercisesByDay = workoutExercises.reduce<
    Record<string, WorkoutExercise[]>
  >((acc, ex) => {
    // Extraer el grupo muscular del campo notes
    const muscleGroupMatch = ex.notes?.match(/^([^-]+)/);
    const muscleGroup = muscleGroupMatch?.[1]?.trim() || "General";

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
        exerciseId: ex.exercise.id, // ID real del ejercicio
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

  if (!id) {
    return NextResponse.json(
      { error: "Workout ID is required" },
      { status: 400 },
    );
  }

  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, description, exercises } = body;

    if (!name || exercises?.length === 0) {
      return NextResponse.json(
        { error: "Nombre y ejercicios requeridos" },
        { status: 400 },
      );
    }

    const workout = await prisma.workout.update({
      where: { id: id, createdById: session.user.id, type: "personal" },
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
            }),
          ),
        },
      },
    });

    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error actualizando workout:", error);
    return NextResponse.json(
      { error: "Error actualizando workout" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { error: "Workout ID is required" },
      { status: 400 },
    );
  }

  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    // Verificar que el workout existe y pertenece al usuario
    const workout = await prisma.workout.findUnique({
      where: { id, createdById: session.user.id, type: "personal" },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "Entrenamiento no encontrado o no autorizado" },
        { status: 404 },
      );
    }

    // Establecer workoutId a null en todas las sesiones asociadas para mantener el historial
    await prisma.workoutSession.updateMany({
      where: { workoutId: id },
      data: { workoutId: null },
    });

    // Eliminar el workout (el historial se mantiene con workoutId = null)
    await prisma.workout.delete({
      where: { id, createdById: session.user.id, type: "personal" },
    });
    return NextResponse.json({ message: "Workout eliminado" });
  } catch (error) {
    console.error("Error eliminando workout:", error);
    return NextResponse.json(
      { error: "Error eliminando workout" },
      { status: 500 },
    );
  }
}
