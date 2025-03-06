import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrCreateExercises, createWorkoutPlan } from "@/lib/workout-utils";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    // Obtener los parámetros de la solicitud
    const {
      goal = "gain-muscle",
      splitType = "Full Body",
      methodology = "standard",
      trainingFrequency = 3,
      name = "Custom Workout",
    } = await request.json();

    // Validar los parámetros
    const validGoals = [
      "strength",
      "gain-muscle",
      "hypertrophy",
      "endurance",
      "lose-weight",
      "fat-loss",
      "mobility",
    ];
    const validSplitTypes = [
      "Full Body",
      "Upper/Lower Split",
      "Push/Pull/Legs",
      "Weider",
    ];
    const validMethodologies = [
      "standard",
      "circuit",
      "hiit",
      "drop-sets",
      "pyramid",
      "supersets",
    ];

    if (!validGoals.includes(goal)) {
      return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
    }

    if (!validSplitTypes.includes(splitType)) {
      return NextResponse.json(
        { error: "Invalid split type" },
        { status: 400 }
      );
    }

    if (!validMethodologies.includes(methodology)) {
      return NextResponse.json(
        { error: "Invalid methodology" },
        { status: 400 }
      );
    }

    if (trainingFrequency < 1 || trainingFrequency > 7) {
      return NextResponse.json(
        { error: "Training frequency must be between 1 and 7" },
        { status: 400 }
      );
    }

    // Obtener el perfil del usuario
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Crear un nuevo entrenamiento en la base de datos
    const workout = await prisma.workout.create({
      data: {
        name,
        description: `Custom ${splitType} workout with ${methodology} methodology for ${goal} goal`,
        userId,
      },
    });

    // Obtener o crear ejercicios
    const exercises = await getOrCreateExercises();

    // Crear plan de entrenamiento basado en los parámetros
    const workoutExercises = await createWorkoutPlan(
      workout.id,
      exercises,
      goal,
      profile.gender,
      trainingFrequency,
      splitType,
      [], // No hay historial de entrenamiento para considerar
      methodology
    );

    // Obtener detalles de ejercicios para cada ejercicio de entrenamiento
    const workoutExercisesWithNames = await Promise.all(
      workoutExercises.map(async (exercise) => {
        const exerciseDetails = await prisma.exercise.findUnique({
          where: { id: exercise.exerciseId },
        });
        return {
          ...exercise,
          name: exerciseDetails ? exerciseDetails.name : "Unknown Exercise",
        };
      })
    );

    // Formatear el plan de entrenamiento para la respuesta
    const formattedWorkout = {
      id: workout.id,
      name: workout.name,
      description: workout.description,
      days: formatWorkoutPlan(workoutExercisesWithNames),
      type: splitType,
      methodology,
      goal,
    };

    return NextResponse.json(formattedWorkout);
  } catch (error) {
    console.error("Error creating custom workout:", error);
    return NextResponse.json(
      { error: "Error creating custom workout" },
      { status: 500 }
    );
  }
}

// Format workout plan for response
function formatWorkoutPlan(workoutExercises) {
  // Agrupar ejercicios por grupo muscular
  const exercisesByDay = workoutExercises.reduce((acc, ex) => {
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
        name: ex.name || "Ejercicio",
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime,
        notes: ex.notes?.replace(/^[^-]+ - /, "") || "",
      })),
    };
  });
}
