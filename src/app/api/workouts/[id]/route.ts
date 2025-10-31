import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json(
      { error: "Workout ID is required" },
      { status: 400 },
    );
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const workout = await prisma.workout.findFirst({
      where: {
        id: id,
        OR: [
          { createdById: session.user.id },
          { assignedToId: session.user.id },
        ],
      },
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
        { status: 404 },
      );
    }

    // Formatear el plan de entrenamiento para la respuesta
    const formattedWorkout = {
      id: workout.id,
      name: workout.name,
      description: workout.description,
      days: formatWorkoutPlan(workout.exercises),
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

// Interfaces para tipar correctamente
// Esta interfaz representa exactamente lo que viene de la base de datos
type WorkoutExerciseFromDB = {
  id: string;
  sets: number;
  reps: number;
  weight: number | null;
  restTime: number | null;
  order: number;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
  };
};

interface FormattedExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number | null;
  notes: string;
}

interface FormattedWorkoutDay {
  day: string;
  exercises: FormattedExercise[];
}

// Función mejorada para formatear el plan de entrenamiento
function formatWorkoutPlan(
  workoutExercises: WorkoutExerciseFromDB[],
): FormattedWorkoutDay[] {
  // Agrupar ejercicios por grupo muscular
  const exercisesByDay = workoutExercises.reduce<
    Record<string, WorkoutExerciseFromDB[]>
  >((acc, ex) => {
    // Extraer el grupo muscular del campo notes
    // Manejar el caso donde notes puede ser null
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
        name: ex.exercise.name || "Ejercicio",
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime,
        // Convertir null a string vacía
        notes: ex.notes?.replace(/^[^-]+ - /, "") || "",
      })),
    };
  });
}

// Interfaz para los ejercicios en el cuerpo de la solicitud PUT
interface ExerciseInput {
  id: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
  order: number;
  notes?: string;
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

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, description, exercises } = body;

    if (!name || !exercises || exercises.length === 0) {
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
          create: exercises.map((exercise: ExerciseInput) => ({
            exerciseId: exercise.id,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            restTime: exercise.restTime,
            order: exercise.order,
            notes: exercise.notes,
          })),
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
  console.log("aqui es");

  if (!id) {
    return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    // Verificar que el workout existe y pertenece al usuario
    const workout = await prisma.workout.findUnique({
      where: { id, createdById: session.user.id, type: "personal" },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "Workout no encontrado o no autorizado" },
        { status: 404 },
      );
    }

    // Primero eliminar todas las sesiones asociadas
    await prisma.workoutSession.deleteMany({
      where: { workoutId: id },
    });

    // Luego eliminar el workout
    await prisma.workout.delete({
      where: { id, createdById: session.user.id, type: "personal" },
    });

    return NextResponse.json({ message: "Workout eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando workout:", error);
    return NextResponse.json(
      { error: "Error eliminando workout" },
      { status: 500 },
    );
  }
}
