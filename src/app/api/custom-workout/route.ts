import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";
import {
  getOrCreateExercises,
  createWorkoutPlan,
} from "@/lib/workout/workout-utils";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    // Get request parameters
    const {
      goal = "gain-muscle",
      splitType = "Full Body",
      methodology = "standard",
      trainingFrequency = 3,
      name = "Custom Workout",
    } = await request.json();

    // Validate parameters
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
        { status: 400 },
      );
    }

    if (!validMethodologies.includes(methodology)) {
      return NextResponse.json(
        { error: "Invalid methodology" },
        { status: 400 },
      );
    }

    if (trainingFrequency < 1 || trainingFrequency > 7) {
      return NextResponse.json(
        { error: "Training frequency must be between 1 and 7" },
        { status: 400 },
      );
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const translations = {
      "Full Body": "Cuerpo Completo",
      "Upper/Lower Split": "División Superior/Inferior",
      "Push/Pull/Legs": "Empuje/Tirón/Piernas",
      Weider: "Weider",
      standard: "estándar",
      circuit: "circuito",
      hiit: "HIIT",
      "drop-sets": "series descendentes",
      pyramid: "pirámide",
      supersets: "superseries",
      strength: "fuerza",
      "gain-muscle": "ganancia muscular",
      hypertrophy: "hipertrofia",
      endurance: "resistencia",
      "lose-weight": "pérdida de peso",
      "fat-loss": "reducción de grasa",
      mobility: "movilidad",
    };

    // Create a new workout in the database
    const workout = await prisma.workout.create({
      data: {
        name,
        description: `Entrenamiento ${
          translations[splitType as keyof typeof translations]
        } con metodología ${
          translations[methodology as keyof typeof translations]
        } para ${translations[goal as keyof typeof translations]}`,
        createdById: userId,
        type: "personal",
      },
    });

    // Get or create exercises
    const exercises = await getOrCreateExercises();

    // Create workout plan based on parameters
    const workoutExercises = await createWorkoutPlan(
      workout.id,
      exercises,
      goal,
      profile.gender,
      trainingFrequency,
      splitType,
      methodology,
    );

    // Get exercise details for each workout exercise
    const workoutExercisesWithNames = await Promise.all(
      workoutExercises.map(async (exercise) => {
        const exerciseDetails = await prisma.exercise.findUnique({
          where: { id: exercise.exerciseId },
        });
        return {
          ...exercise,
          name: exerciseDetails ? exerciseDetails.name : "Unknown Exercise",
        };
      }),
    );

    // Format workout plan for response
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
      { status: 500 },
    );
  }
}

// Format workout plan for response
interface WorkoutExercise {
  id: string;
  name?: string;
  sets: number;
  reps: number;
  restTime: number | null;
  notes?: string | null;
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
  workoutExercises: WorkoutExercise[],
): FormattedWorkoutDay[] {
  // Group exercises by muscle group/day
  const exercisesByDay = workoutExercises.reduce<
    Record<string, WorkoutExercise[]>
  >((acc, ex) => {
    // Extract the muscle group from the notes field
    const muscleGroupMatch = ex.notes?.match(/^([^-]+)/);
    const muscleGroup = muscleGroupMatch?.[1]?.trim() || "General";

    if (!acc[muscleGroup]) acc[muscleGroup] = [];
    acc[muscleGroup].push(ex);
    return acc;
  }, {});

  // Format each muscle group
  return Object.entries(exercisesByDay).map(([muscleGroup, exercises]) => {
    return {
      day: muscleGroup, // Use muscle group as day identifier
      exercises: exercises.map((ex) => ({
        id: ex.id,
        name: ex.name || "Ejercicio",
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime ?? 0,
        notes: ex.notes?.replace(/^[^-]+ - /, "") || "",
      })),
    };
  });
}
