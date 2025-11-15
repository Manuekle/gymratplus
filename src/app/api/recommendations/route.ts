import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth/next";
import {
  calculateExperienceLevel,
  createWorkoutPlan,
  getOrCreateExercises,
  getRecommendedWorkoutType,
  type WorkoutGoal,
} from "@/lib/workout/workout-utils";
import {
  createNutritionPlan,
  type NutritionPlan,
} from "@/lib/nutrition/nutrition-utils";

interface ProfileData {
  goal: "gain-muscle" | "lose-weight" | "maintain";
  experienceLevel: "beginner" | "intermediate" | "advanced";
  currentWeight: number;
  height: number;
  dietaryPreference?: "vegetarian" | "keto" | "no-preference";
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number | null;
  notes: string | null;
}

interface PrismaExercise {
  id: string;
  exercise: {
    name: string;
  };
  sets: number;
  reps: number;
  restTime: number | null;
  notes: string | null;
}

interface ResponseData {
  success: boolean;
  workoutPlan: {
    id: string;
    name: string;
    description: string;
    days: Array<{
      day: string;
      exercises: Exercise[];
    }>;
  };
  foodRecommendation: NutritionPlan;
  recommendations: string[];
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (!session.user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    // Get the profile data from request body
    const profileData: ProfileData = await req.json();

    // Si no viene experienceLevel en el body, obtenerlo del usuario
    let experienceLevel = profileData.experienceLevel;
    if (!experienceLevel) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      experienceLevel = user?.experienceLevel as ProfileData["experienceLevel"];
    }
    if (!experienceLevel) {
      // Obtener datos del perfil
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (profile) {
        const experienceData: {
          trainingFrequency?: number;
          monthsTraining?: number;
        } = {};

        if (profile.trainingFrequency) {
          experienceData.trainingFrequency = Number(profile.trainingFrequency);
        }

        if (profile.monthsTraining) {
          experienceData.monthsTraining = Number(profile.monthsTraining);
        }

        experienceLevel = calculateExperienceLevel(
          experienceData,
        ) as ProfileData["experienceLevel"];
      }
    }
    if (!experienceLevel) {
      return NextResponse.json(
        {
          error:
            "No se pudo calcular tu nivel de experiencia. Por favor, completa tu perfil con tu frecuencia de entrenamiento y meses entrenando.",
        },
        { status: 400 },
      );
    }
    profileData.experienceLevel = experienceLevel;

    // Validar los otros campos requeridos
    const requiredFields = ["goal", "currentWeight", "height"] as const;
    const missingFields = requiredFields.filter(
      (field) => !profileData[field as keyof ProfileData],
    );
    if (missingFields.length > 0) {
      return NextResponse.json({
        error: `Faltan campos requeridos: ${missingFields.join(", ")}`,
        status: 400,
      });
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get all exercises
    const exercises = await getOrCreateExercises();
    if (exercises.length === 0) {
      return NextResponse.json(
        { error: "No exercises available" },
        { status: 500 },
      );
    }

    // Determine workout type based on profile
    const workoutType = getRecommendedWorkoutType({
      trainingFrequency: profile.trainingFrequency ?? undefined,
      goal: profileData.goal as WorkoutGoal,
      activityLevel: profile.activityLevel ?? undefined,
      experienceLevel: experienceLevel,
    });

    // Map goal to WorkoutGoal type
    const goalMap: Record<string, WorkoutGoal> = {
      "gain-muscle": "gain-muscle",
      "lose-weight": "fat-loss",
      maintain: "maintain",
    };
    const workoutGoal = goalMap[profileData.goal] || "maintain";

    // Get training frequency from profile
    const trainingFrequency = profile.trainingFrequency ?? 3;

    // Create workout first
    const workout = await prisma.workout.create({
      data: {
        name: `Plan de Entrenamiento ${workoutType}`,
        description: `Plan personalizado basado en tu objetivo: ${profileData.goal} y nivel: ${experienceLevel}`,
        createdById: userId,
        type: "personal",
      },
    });

    // Create workout plan with exercises
    await createWorkoutPlan(
      workout.id,
      exercises,
      workoutGoal,
      profile.gender,
      trainingFrequency,
      workoutType,
      [],
      "standard",
    );

    // Fetch the complete workout with exercises
    const workoutWithExercises = await prisma.workout.findUnique({
      where: { id: workout.id },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!workoutWithExercises || !workoutWithExercises.exercises.length) {
      return NextResponse.json(
        { error: "Failed to create workout plan" },
        { status: 500 },
      );
    }

    // Calculate calorie target based on goal and weight
    let calorieTarget = Math.round(2000 * (profileData.currentWeight / 70));

    // Adjust calories based on goal
    if (profileData.goal === "lose-weight") {
      calorieTarget = Math.round(calorieTarget * 0.85); // 15% deficit
    } else if (profileData.goal === "gain-muscle") {
      calorieTarget = Math.round(calorieTarget * 1.1); // 10% surplus
    }

    // Calculate macros based on goal
    let proteinPercentage = 0.3;
    let carbsPercentage = 0.5;
    let fatPercentage = 0.2;

    if (profileData.goal === "gain-muscle") {
      proteinPercentage = 0.35;
      carbsPercentage = 0.45;
      fatPercentage = 0.2;
    } else if (profileData.goal === "lose-weight") {
      proteinPercentage = 0.35;
      carbsPercentage = 0.35;
      fatPercentage = 0.3;
    }

    // Adjust for dietary preferences
    if (profileData.dietaryPreference === "keto") {
      proteinPercentage = 0.3;
      carbsPercentage = 0.1;
      fatPercentage = 0.6;
    }

    const dailyProteinTarget = Math.round(
      (calorieTarget * proteinPercentage) / 4,
    );
    const dailyCarbTarget = Math.round((calorieTarget * carbsPercentage) / 4);
    const dailyFatTarget = Math.round((calorieTarget * fatPercentage) / 9);

    // Create nutrition plan using nutrition-utils
    const nutritionPlan = await createNutritionPlan({
      userId,
      goal: profileData.goal,
      dietaryPreference: profileData.dietaryPreference || "no-preference",
      dailyCalorieTarget: calorieTarget,
      dailyProteinTarget,
      dailyCarbTarget,
      dailyFatTarget,
    });

    // Save the food recommendation to the database
    // Save the complete meals structure with entries, calories, and macros
    await prisma.foodRecommendation.create({
      data: {
        userId,
        macros: JSON.stringify(nutritionPlan.macros),
        meals: JSON.stringify({
          breakfast: {
            entries: nutritionPlan.meals.breakfast.entries,
            calories: nutritionPlan.meals.breakfast.calories,
            protein: nutritionPlan.meals.breakfast.protein,
            carbs: nutritionPlan.meals.breakfast.carbs,
            fat: nutritionPlan.meals.breakfast.fat,
          },
          lunch: {
            entries: nutritionPlan.meals.lunch.entries,
            calories: nutritionPlan.meals.lunch.calories,
            protein: nutritionPlan.meals.lunch.protein,
            carbs: nutritionPlan.meals.lunch.carbs,
            fat: nutritionPlan.meals.lunch.fat,
          },
          dinner: {
            entries: nutritionPlan.meals.dinner.entries,
            calories: nutritionPlan.meals.dinner.calories,
            protein: nutritionPlan.meals.dinner.protein,
            carbs: nutritionPlan.meals.dinner.carbs,
            fat: nutritionPlan.meals.dinner.fat,
          },
          snacks: {
            entries: nutritionPlan.meals.snacks.entries,
            calories: nutritionPlan.meals.snacks.calories,
            protein: nutritionPlan.meals.snacks.protein,
            carbs: nutritionPlan.meals.snacks.carbs,
            fat: nutritionPlan.meals.snacks.fat,
          },
        }),
        calorieTarget,
      },
    });

    // Create weight entry if it doesn't exist
    const existingWeight = await prisma.weight.findFirst({
      where: { userId },
    });

    if (!existingWeight && profileData.currentWeight) {
      await prisma.weight.create({
        data: {
          userId,
          weight: Number(profileData.currentWeight),
          date: new Date(),
        },
      });
    }

    // Group all exercises in a single day with muscle groups in notes
    const days: Array<{ day: string; exercises: Exercise[] }> = [];

    // Create a single day with all exercises
    const allExercises = workoutWithExercises.exercises.map(
      (exerciseData: PrismaExercise) => {
        // Extract muscle group from notes (format: "Full Body - [Muscle Group]")
        const muscleGroup = exerciseData.notes?.split(" - ")[1] || "Full Body";

        return {
          id: exerciseData.id,
          name: exerciseData.exercise.name,
          sets: exerciseData.sets,
          reps: exerciseData.reps,
          restTime: exerciseData.restTime || 0,
          notes: muscleGroup, // Store the muscle group in notes
        };
      },
    );

    // Add all exercises to a single day
    if (allExercises.length > 0) {
      days.push({
        day: "Full Body",
        exercises: allExercises,
      });
    }

    // Collect all food IDs from all meals
    const allFoodIds = new Set<string>();
    Object.values(nutritionPlan.meals).forEach((meal) => {
      meal.entries.forEach((entry) => {
        allFoodIds.add(entry.foodId);
      });
    });

    // Fetch all foods
    const foodsMap = new Map();
    if (allFoodIds.size > 0) {
      const foods = await prisma.food.findMany({
        where: {
          id: { in: Array.from(allFoodIds) },
        },
      });

      foods.forEach((food) => {
        foodsMap.set(food.id, {
          id: food.id,
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          serving: food.serving,
          category: food.category,
        });
      });
    }

    // Populate food objects in nutrition plan entries
    const populatedNutritionPlan = {
      ...nutritionPlan,
      meals: {
        breakfast: {
          ...nutritionPlan.meals.breakfast,
          id: `meal-breakfast-${Date.now()}`,
          entries: nutritionPlan.meals.breakfast.entries.map(
            (entry, index) => ({
              id: `entry-${index}-${Date.now()}`,
              foodId: entry.foodId,
              quantity: entry.quantity,
              food: foodsMap.get(entry.foodId) || {
                id: entry.foodId,
                name: "Alimento no encontrado",
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                serving: 100,
                category: "unknown",
              },
            }),
          ),
        },
        lunch: {
          ...nutritionPlan.meals.lunch,
          id: `meal-lunch-${Date.now()}`,
          entries: nutritionPlan.meals.lunch.entries.map((entry, index) => ({
            id: `entry-${index}-${Date.now()}`,
            foodId: entry.foodId,
            quantity: entry.quantity,
            food: foodsMap.get(entry.foodId) || {
              id: entry.foodId,
              name: "Alimento no encontrado",
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              serving: 100,
              category: "unknown",
            },
          })),
        },
        dinner: {
          ...nutritionPlan.meals.dinner,
          id: `meal-dinner-${Date.now()}`,
          entries: nutritionPlan.meals.dinner.entries.map((entry, index) => ({
            id: `entry-${index}-${Date.now()}`,
            foodId: entry.foodId,
            quantity: entry.quantity,
            food: foodsMap.get(entry.foodId) || {
              id: entry.foodId,
              name: "Alimento no encontrado",
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              serving: 100,
              category: "unknown",
            },
          })),
        },
        snacks: {
          ...nutritionPlan.meals.snacks,
          id: `meal-snacks-${Date.now()}`,
          entries: nutritionPlan.meals.snacks.entries.map((entry, index) => ({
            id: `entry-${index}-${Date.now()}`,
            foodId: entry.foodId,
            quantity: entry.quantity,
            food: foodsMap.get(entry.foodId) || {
              id: entry.foodId,
              name: "Alimento no encontrado",
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              serving: 100,
              category: "unknown",
            },
          })),
        },
      },
    };

    const responseData: ResponseData = {
      success: true,
      workoutPlan: {
        id: workoutWithExercises.id,
        name: workoutWithExercises.name,
        description: workoutWithExercises.description || "",
        days,
      },
      foodRecommendation: populatedNutritionPlan,
      recommendations: [],
    };

    return NextResponse.json(responseData);
  } catch {
    return NextResponse.json(
      {
        error: "Error generating recommendations",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
