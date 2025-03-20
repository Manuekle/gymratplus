import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import {
  getOrCreateExercises,
  createWorkoutPlan,
  getRecommendedWorkoutType,
} from "@/lib/workout-utils";
import {
  createNutritionPlan,
  type NutritionProfile,
} from "@/lib/nutrition-utils";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    // Get user profile with detailed information
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get user's workout history to inform recommendations
    const workoutHistory = await prisma.workout.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5, // Get last 5 workouts
    });

    // Get user's weight history to track progress
    const weightHistory = await prisma.weight.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 10,
    });

    // Check if user already has a recent workout plan (less than 2 weeks old)
    const existingWorkout = await prisma.workout.findFirst({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }, // 2 weeks
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    // Check if user has meal logs
    // Code removed

    // If recent plans exist, return them with some adaptive modifications
    if (existingWorkout) {
      // Define adherence based on some logic or fetch it from the database
      const adherence = { level: "medium", score: 75 }; // Example adherence data

      // Format existing workout with potential modifications based on adherence
      const workoutPlan = {
        id: existingWorkout.id,
        name: existingWorkout.name,
        description: existingWorkout.description,
        days: formatWorkoutPlan(
          existingWorkout.exercises.map((we) => ({
            id: we.id,
            name: we.exercise.name,
            sets: adaptSetsBasedOnProgress(
              we.sets,
              adherence,
              profile.goal || "default-goal"
            ),
            reps: adaptRepsBasedOnProgress(
              we.reps,
              adherence,
              profile.goal || "default-goal"
            ),
            restTime: we.restTime,
            notes: we.notes || "General",
          }))
        ),
        progressMetrics: calculateProgressMetrics(weightHistory, profile),
      };

      // Format nutrition plan if meal logs exist
      if (!profile.goal) {
        return NextResponse.json(
          { error: "Profile goal not set" },
          { status: 400 }
        );
      }
      const nutritionPlan = await createNutritionPlan(
        profile as NutritionProfile
      );

      return NextResponse.json({
        workoutPlan,
        nutritionPlan,
        recommendations: generateRecommendations(profile, weightHistory),
      });
    }

    // Generate new workout plan based on profile and history
    const workoutType = getRecommendedWorkoutType(profile, workoutHistory);

    // Determinar la metodología basada en el objetivo
    let methodology = "standard";
    if (profile.goal === "lose-weight" || profile.goal === "fat-loss") {
      methodology = Math.random() > 0.5 ? "circuit" : "hiit";
    } else if (
      profile.goal === "gain-muscle" ||
      profile.goal === "hypertrophy"
    ) {
      methodology = Math.random() > 0.5 ? "drop-sets" : "supersets";
    } else if (profile.goal === "strength") {
      methodology = "pyramid";
    }

    const workoutPlan = await generateAndSaveWorkoutPlan(
      profile,
      workoutType,
      workoutHistory,
      methodology
    );
    const nutritionPlan = await createNutritionPlan(profile);

    return NextResponse.json({
      workoutPlan,
      nutritionPlan,
      recommendations: generateRecommendations(profile, null, weightHistory),
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Error generating recommendations" },
      { status: 500 }
    );
  }
}

// Analyze how well the user has been following their workout plan

// Adapt sets based on user progress and adherence
function adaptSetsBasedOnProgress(
  currentSets: number,
  adherence: { level: string },
  goal: string
) {
  if (!adherence) return currentSets;

  if (
    adherence.level === "high" &&
    (goal === "gain-muscle" || goal === "hypertrophy" || goal === "strength")
  ) {
    return currentSets + 1; // Increase sets for high adherence and muscle gain goal
  } else if (adherence.level === "low") {
    return Math.max(2, currentSets - 1); // Decrease sets for low adherence, minimum 2
  }

  return currentSets; // Maintain sets otherwise
}

// Adapt reps based on user progress and adherence
function adaptRepsBasedOnProgress(
  currentReps: number,
  adherence: { level: string },
  goal: string
) {
  if (!adherence) return currentReps;

  if (adherence.level === "high") {
    if ((goal === "gain-muscle" || goal === "hypertrophy") && currentReps < 8) {
      return currentReps + 2; // Increase weight instead of reps for muscle gain
    } else if (goal === "strength" && currentReps > 5) {
      return currentReps - 1; // Decrease reps and increase weight for strength
    } else if (
      goal === "lose-weight" ||
      goal === "fat-loss" ||
      goal === "endurance"
    ) {
      return currentReps + 2; // Increase reps for weight loss and endurance
    }
  } else if (adherence.level === "low") {
    return Math.max(6, currentReps - 2); // Decrease reps for low adherence, minimum 6
  }

  return currentReps; // Maintain reps otherwise
}

// Calculate progress metrics based on weight history and profile goals
function calculateProgressMetrics(weightHistory, profile) {
  if (!weightHistory || weightHistory.length < 2) {
    return {
      weightChange: 0,
      onTrack: true,
      recommendation: "Continue with current plan",
    };
  }

  const latestWeight = weightHistory[0].weight;
  const oldestWeight = weightHistory[weightHistory.length - 1].weight;
  const weightChange = latestWeight - oldestWeight;

  let onTrack = true;
  let recommendation = "Continue with current plan";

  if (
    (profile.goal === "lose-weight" || profile.goal === "fat-loss") &&
    weightChange >= 0
  ) {
    onTrack = false;
    recommendation =
      "Consider reducing calorie intake or increasing workout intensity";
  } else if (
    (profile.goal === "gain-muscle" || profile.goal === "hypertrophy") &&
    weightChange <= 0
  ) {
    onTrack = false;
    recommendation = "Consider increasing calorie intake, especially protein";
  }

  return { weightChange, onTrack, recommendation };
}

// Generate personalized recommendations based on profile and progress
function generateRecommendations(profile, adherence, weightHistory) {
  const recommendations = [];

  // Basic recommendations based on profile
  if (
    profile.trainingFrequency < 3 &&
    (profile.goal === "gain-muscle" || profile.goal === "hypertrophy")
  ) {
    recommendations.push(
      "Consider increasing your training frequency to at least 3 days per week for optimal muscle growth"
    );
  }

  if (profile.goal === "strength" && profile.trainingFrequency < 4) {
    recommendations.push(
      "For optimal strength gains, consider training at least 4 days per week with focus on compound movements"
    );
  }

  if (profile.dailyProteinTarget && profile.currentWeight) {
    const proteinPerKg =
      profile.dailyProteinTarget / Number.parseFloat(profile.currentWeight);
    if (
      (profile.goal === "gain-muscle" || profile.goal === "hypertrophy") &&
      proteinPerKg < 1.6
    ) {
      recommendations.push(
        "Your protein intake may be too low for your muscle-building goals. Aim for at least 1.6g per kg of bodyweight."
      );
    } else if (profile.goal === "strength" && proteinPerKg < 1.8) {
      recommendations.push(
        "For optimal strength development, consider increasing your protein intake to at least 1.8g per kg of bodyweight."
      );
    }
  }

  // Adherence-based recommendations
  if (adherence) {
    if (adherence.level === "low") {
      recommendations.push(
        "Your workout consistency has been low. Consider setting reminders or finding a workout buddy to stay motivated."
      );
    } else if (adherence.level === "high" && adherence.score >= 90) {
      recommendations.push(
        "Great job staying consistent! You might be ready to increase your workout intensity."
      );
    }
  }

  // Weight progress recommendations
  if (weightHistory && weightHistory.length >= 2) {
    const latestWeight = weightHistory[0].weight;
    const oldestWeight = weightHistory[weightHistory.length - 1].weight;
    const weightChange = latestWeight - oldestWeight;
    const weeksPassed = Math.max(
      1,
      Math.round(
        (weightHistory[0].date.getTime() -
          weightHistory[weightHistory.length - 1].date.getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      )
    );

    if (profile.goal === "lose-weight" || profile.goal === "fat-loss") {
      const weeklyChange = weightChange / weeksPassed;
      if (weeklyChange > 0) {
        recommendations.push(
          "You're gaining weight instead of losing. Consider reducing your calorie intake by 300-500 calories per day."
        );
      } else if (weeklyChange > -0.5 && weeklyChange <= 0) {
        recommendations.push(
          "You're losing weight, but at a slow pace. For faster results, you might increase your cardio or slightly reduce calories."
        );
      } else if (weeklyChange < -1) {
        recommendations.push(
          "You're losing weight quickly. Make sure you're getting enough nutrients and not losing muscle mass."
        );
      }
    } else if (
      profile.goal === "gain-muscle" ||
      profile.goal === "hypertrophy"
    ) {
      const weeklyChange = weightChange / weeksPassed;
      if (weeklyChange < 0) {
        recommendations.push(
          "You're losing weight instead of gaining. Consider increasing your calorie intake, especially protein and carbs."
        );
      } else if (weeklyChange > 0.5) {
        recommendations.push(
          "You're gaining weight quickly. Make sure it's mostly muscle by keeping your workouts intense and protein intake high."
        );
      }
    }
  }

  // Methodology recommendations based on goals
  if (profile.goal === "lose-weight" || profile.goal === "fat-loss") {
    recommendations.push(
      "Consider incorporating HIIT or circuit training into your routine for more efficient fat burning."
    );
  } else if (profile.goal === "gain-muscle" || profile.goal === "hypertrophy") {
    recommendations.push(
      "Try incorporating drop sets or supersets into your routine to increase muscle hypertrophy."
    );
  } else if (profile.goal === "strength") {
    recommendations.push(
      "Focus on compound movements with pyramid sets to maximize strength gains."
    );
  } else if (profile.goal === "endurance") {
    recommendations.push(
      "Consider higher rep ranges (15-20) with shorter rest periods to improve muscular endurance."
    );
  } else if (profile.goal === "mobility") {
    recommendations.push(
      "Include dynamic stretching before workouts and static stretching after to improve mobility."
    );
  }

  return recommendations;
}

// Generate and save a new workout plan
async function generateAndSaveWorkoutPlan(
  profile,
  workoutType,
  workoutHistory,
  methodology = "standard"
) {
  const { userId, gender, goal, trainingFrequency } = profile;

  // Create a new workout in the database
  const workout = await prisma.workout.create({
    data: {
      name: `${workoutType} Plan (${getGoalText(goal)})`,
      description: `Personalized ${workoutType} workout plan with ${methodology} methodology for ${
        gender === "male" ? "male" : "female"
      } with ${getGoalText(
        goal
      )} goal and ${trainingFrequency} days per week frequency.`,
      userId: userId,
    },
  });

  // Get or create exercises
  const exercises = await getOrCreateExercises();

  // Create workout plan based on type and user profile
  const workoutExercises = await createWorkoutPlan(
    workout.id,
    exercises,
    goal,
    gender,
    trainingFrequency,
    workoutType,
    workoutHistory,
    methodology
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
    })
  );

  return {
    id: workout.id,
    name: workout.name,
    description: workout.description,
    days: formatWorkoutPlan(workoutExercisesWithNames),
    type: workoutType,
    methodology,
  };
}

// Format workout plan for response
function formatWorkoutPlan(workoutExercises) {
  // Agrupar ejercicios por día/grupo muscular
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
      day: muscleGroup, // Ahora usamos el grupo muscular como identificador del día
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

function getGoalText(goal) {
  switch (goal) {
    case "lose-weight":
    case "fat-loss":
      return "weight loss";
    case "maintain":
      return "maintenance";
    case "gain-muscle":
    case "hypertrophy":
      return "muscle gain";
    case "strength":
      return "strength";
    case "endurance":
      return "endurance";
    case "mobility":
      return "mobility and flexibility";
    default:
      return goal;
  }
}
