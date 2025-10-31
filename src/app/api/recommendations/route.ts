import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth/next";
import { calculateExperienceLevel } from "@/lib/workout/workout-utils";
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
          experienceData
        ) as ProfileData["experienceLevel"];
      }
    }
    if (!experienceLevel) {
      return NextResponse.json(
        {
          error:
            "No se pudo calcular tu nivel de experiencia. Por favor, completa tu perfil con tu frecuencia de entrenamiento y meses entrenando.",
        },
        { status: 400 }
      );
    }
    profileData.experienceLevel = experienceLevel;

    // Validar los otros campos requeridos
    const requiredFields = ["goal", "currentWeight", "height"] as const;
    const missingFields = requiredFields.filter(
      (field) => !profileData[field as keyof ProfileData]
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

    // Get exercises
    const whereClause: {
      muscleGroup?: string;
    } = {};

    if (profileData.goal === "gain-muscle") {
      whereClause.muscleGroup = "piernas";
    }

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      take: 10,
    });

    if (exercises.length === 0) {
      return NextResponse.json(
        { error: "No exercises available" },
        { status: 500 }
      );
    }

    // Create a personalized workout plan based on profile
    const workout = (await prisma.workout.create({
      data: {
        name: `Plan de Entrenamiento ${profileData.goal === "gain-muscle" ? "Muscular" : "Cardio"}`,
        description: `Plan personalizado basado en tu objetivo: ${profileData.goal}`,
        createdById: userId,
        type: "personal",
        exercises: {
          create: exercises.slice(0, 5).map((exercise, index) => ({
            exerciseId: exercise.id,
            sets: profileData.experienceLevel === "beginner" ? 2 : 3,
            reps: profileData.experienceLevel === "beginner" ? 8 : 12,
            restTime: profileData.experienceLevel === "beginner" ? 90 : 60,
            order: index,
            notes: `Ejercicio recomendado para ${profileData.goal}`,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    })) as {
      id: string;
      name: string;
      description: string;
      exercises: PrismaExercise[];
    };

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
      (calorieTarget * proteinPercentage) / 4
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
    const foodRecommendation = await prisma.foodRecommendation.create({
      data: {
        userId,
        macros: JSON.stringify(nutritionPlan.macros),
        meals: JSON.stringify({
          breakfast: nutritionPlan.meals.breakfast.entries.map((e) => e.foodId),
          lunch: nutritionPlan.meals.lunch.entries.map((e) => e.foodId),
          dinner: nutritionPlan.meals.dinner.entries.map((e) => e.foodId),
          snacks: nutritionPlan.meals.snacks.entries.map((e) => e.foodId),
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

    const responseData: ResponseData = {
      success: true,
      workoutPlan: {
        id: workout.id,
        name: workout.name,
        description: workout.description,
        days: [
          {
            day: "Lunes",
            exercises: workout.exercises.map(
              (exerciseData: PrismaExercise) => ({
                id: exerciseData.id,
                name: exerciseData.exercise.name,
                sets: exerciseData.sets,
                reps: exerciseData.reps,
                restTime: exerciseData.restTime || 0,
                notes: exerciseData.notes || "",
              })
            ),
          },
          {
            day: "Miércoles",
            exercises: workout.exercises.map(
              (exerciseData: PrismaExercise) => ({
                id: exerciseData.id,
                name: exerciseData.exercise.name,
                sets: exerciseData.sets,
                reps: exerciseData.reps,
                restTime: exerciseData.restTime || 0,
                notes: exerciseData.notes || "",
              })
            ),
          },
          {
            day: "Viernes",
            exercises: workout.exercises.map(
              (exerciseData: PrismaExercise) => ({
                id: exerciseData.id,
                name: exerciseData.exercise.name,
                sets: exerciseData.sets,
                reps: exerciseData.reps,
                restTime: exerciseData.restTime || 0,
                notes: exerciseData.notes || "",
              })
            ),
          },
        ],
      },
      foodRecommendation: {
        ...nutritionPlan,
        id: foodRecommendation.id,
      },
      recommendations: [
        `Mantén una rutina consistente de entrenamiento, especialmente ${profileData.goal === "gain-muscle" ? "de fuerza" : "cardio"}`,
        `Consume ${dailyProteinTarget}g de proteína de alta calidad diariamente`,
        `Descansa lo suficiente entre sesiones (48-72 horas por grupo muscular)`,
        `Mantén una hidratación adecuada (2-3 litros de agua al día)`,
        `${profileData.goal === "gain-muscle" ? "Consume un superávit calórico moderado" : profileData.goal === "lose-weight" ? "Mantén un déficit calórico controlado" : "Mantén tu ingesta calórica estable"}`,
      ],
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      {
        error: "Error generating recommendations",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
