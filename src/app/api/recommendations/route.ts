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
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  currentWeight: number;
  height: number;
  dietaryPreference?: "vegetarian" | "keto" | "no-preference";
  skipWorkout?: boolean; // Para usuarios intermedios/avanzados que solo quieren nutrición
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
  } | null;
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

    // Obtener perfil una sola vez para múltiples usos
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Calcular nivel de experiencia de manera optimizada
    let experienceLevel = profileData.experienceLevel;
    if (!experienceLevel) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { experienceLevel: true },
      });
      experienceLevel = user?.experienceLevel as ProfileData["experienceLevel"];
    }
    if (!experienceLevel) {
      experienceLevel = calculateExperienceLevel({
        trainingFrequency: profile.trainingFrequency
          ? Number(profile.trainingFrequency)
          : undefined,
        monthsTraining: profile.monthsTraining
          ? Number(profile.monthsTraining)
          : undefined,
      }) as ProfileData["experienceLevel"];
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

    // Si skipWorkout es true, solo generar plan de nutrición
    let workoutWithExercises = null;
    if (!profileData.skipWorkout) {
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
      workoutWithExercises = await prisma.workout.findUnique({
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
    }

    // Función optimizada para calcular calorías y macros
    const calculateNutritionTargets = (
      goal: string,
      currentWeight: number,
      dietaryPreference?: string,
    ) => {
      // Calcular calorías base
      let calorieTarget = Math.round(2000 * (currentWeight / 70));

      // Ajustar según objetivo
      if (goal === "lose-weight") {
        calorieTarget = Math.round(calorieTarget * 0.85); // 15% déficit
      } else if (goal === "gain-muscle") {
        calorieTarget = Math.round(calorieTarget * 1.1); // 10% superávit
      }

      // Calcular porcentajes de macros según objetivo
      let proteinPercentage = 0.3;
      let carbsPercentage = 0.5;
      let fatPercentage = 0.2;

      if (goal === "gain-muscle") {
        proteinPercentage = 0.35;
        carbsPercentage = 0.45;
        fatPercentage = 0.2;
      } else if (goal === "lose-weight") {
        proteinPercentage = 0.35;
        carbsPercentage = 0.35;
        fatPercentage = 0.3;
      }

      // Ajustar para preferencias dietéticas
      if (dietaryPreference === "keto") {
        proteinPercentage = 0.3;
        carbsPercentage = 0.1;
        fatPercentage = 0.6;
      }

      return {
        calorieTarget,
        dailyProteinTarget: Math.round((calorieTarget * proteinPercentage) / 4),
        dailyCarbTarget: Math.round((calorieTarget * carbsPercentage) / 4),
        dailyFatTarget: Math.round((calorieTarget * fatPercentage) / 9),
      };
    };

    const {
      calorieTarget,
      dailyProteinTarget,
      dailyCarbTarget,
      dailyFatTarget,
    } = calculateNutritionTargets(
      profileData.goal,
      profileData.currentWeight,
      profileData.dietaryPreference,
    );

    // Create nutrition plan using nutrition-utils
    const nutritionPlanRaw = await createNutritionPlan({
      userId,
      goal: profileData.goal,
      dietaryPreference: profileData.dietaryPreference || "no-preference",
      dailyCalorieTarget: calorieTarget,
      dailyProteinTarget,
      dailyCarbTarget,
      dailyFatTarget,
    });

    // Transformar la estructura para que coincida con lo esperado
    // Verificar que todas las comidas existan
    if (
      !nutritionPlanRaw.breakfast ||
      !nutritionPlanRaw.lunch ||
      !nutritionPlanRaw.dinner ||
      !nutritionPlanRaw.snack
    ) {
      throw new Error("Error al generar el plan nutricional: faltan comidas");
    }

    const nutritionPlan = {
      ...nutritionPlanRaw,
      meals: {
        breakfast: nutritionPlanRaw.breakfast,
        lunch: nutritionPlanRaw.lunch,
        dinner: nutritionPlanRaw.dinner,
        snacks: nutritionPlanRaw.snack, // snack -> snacks
      },
      macros: {
        protein: `${dailyProteinTarget}g (${Math.round(((dailyProteinTarget * 4) / calorieTarget) * 100)}%)`,
        carbs: `${dailyCarbTarget}g (${Math.round(((dailyCarbTarget * 4) / calorieTarget) * 100)}%)`,
        fat: `${dailyFatTarget}g (${Math.round(((dailyFatTarget * 9) / calorieTarget) * 100)}%)`,
        description: `Plan nutricional personalizado para ${profileData.goal}`,
      },
    };

    // Save the food recommendation to the database using normalized structure
    const { createFoodRecommendationNormalized } = await import(
      "@/lib/nutrition/food-recommendation-helpers"
    );

    // Extraer valores numéricos de macros
    let proteinTarget: number | undefined = dailyProteinTarget;
    let carbsTarget: number | undefined = dailyCarbTarget;
    let fatTarget: number | undefined = dailyFatTarget;

    if (nutritionPlan.macros?.protein) {
      const proteinMatch = String(nutritionPlan.macros.protein).match(
        /(\d+(?:\.\d+)?)/,
      );
      if (proteinMatch) {
        proteinTarget = parseFloat(proteinMatch[1]);
      }
    }
    if (nutritionPlan.macros.carbs) {
      const carbsMatch = String(nutritionPlan.macros.carbs).match(
        /(\d+(?:\.\d+)?)/,
      );
      if (carbsMatch) {
        carbsTarget = parseFloat(carbsMatch[1]);
      }
    }
    if (nutritionPlan.macros.fat) {
      const fatMatch = String(nutritionPlan.macros.fat).match(
        /(\d+(?:\.\d+)?)/,
      );
      if (fatMatch) {
        fatTarget = parseFloat(fatMatch[1]);
      }
    }

    await createFoodRecommendationNormalized({
      userId,
      calorieTarget,
      proteinTarget,
      carbsTarget,
      fatTarget,
      description: nutritionPlan.macros.description,
      meals: {
        breakfast: {
          entries: nutritionPlan.meals.breakfast.entries.map((entry) => ({
            foodId: entry.foodId,
            quantity: entry.quantity,
          })),
        },
        lunch: {
          entries: nutritionPlan.meals.lunch.entries.map((entry) => ({
            foodId: entry.foodId,
            quantity: entry.quantity,
          })),
        },
        dinner: {
          entries: nutritionPlan.meals.dinner.entries.map((entry) => ({
            foodId: entry.foodId,
            quantity: entry.quantity,
          })),
        },
        snacks: {
          entries: nutritionPlan.meals.snacks.entries.map((entry) => ({
            foodId: entry.foodId,
            quantity: entry.quantity,
          })),
        },
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

    // Solo procesar ejercicios si se creó el workout
    if (workoutWithExercises) {
      // Create a single day with all exercises
      const allExercises = workoutWithExercises.exercises.map(
        (exerciseData: PrismaExercise) => {
          // Extract muscle group from notes (format: "Full Body - [Muscle Group]")
          const muscleGroup =
            exerciseData.notes?.split(" - ")[1] || "Full Body";

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
        if (!food || !food.id) return; // Saltar alimentos inválidos

        foodsMap.set(food.id, {
          id: food.id,
          name: food.name || "Alimento sin nombre",
          calories: food.calories || 0,
          protein: food.protein || 0,
          carbs: food.carbs || 0,
          fat: food.fat || 0,
          serving: food.serving || 100,
          category: food.category || "unknown",
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
      workoutPlan: workoutWithExercises
        ? {
            id: workoutWithExercises.id,
            name: workoutWithExercises.name,
            description: workoutWithExercises.description || "",
            days,
          }
        : null,
      foodRecommendation: populatedNutritionPlan,
      recommendations: [],
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error generating recommendations",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
