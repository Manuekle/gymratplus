import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { calculateExperienceLevel } from "@/lib/workout-utils";

interface ProfileData {
  goal: 'gain-muscle' | 'lose-weight' | 'maintain';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  currentWeight: number;
  height: number;
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

interface Macros {
  protein: string;
  carbs: string;
  fat: string;
  description: string;
}

interface FoodRecommendation {
  macros: Macros;
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  calorieTarget: number;
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
  foodRecommendation: FoodRecommendation;
  recommendations: string[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    // Get the profile data from request body
    const profileData: ProfileData = await req.json();
    
    // Si no viene experienceLevel en el body, obtenerlo del usuario
    let experienceLevel = profileData.experienceLevel;
    if (!experienceLevel) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      experienceLevel = user?.experienceLevel as ProfileData['experienceLevel'];
    }
    if (!experienceLevel) {
      // Obtener datos del perfil
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (profile) {
        experienceLevel = calculateExperienceLevel({
          trainingFrequency: profile.trainingFrequency ? Number(profile.trainingFrequency) : undefined,
          monthsTraining: profile.monthsTraining ? Number(profile.monthsTraining) : undefined,
        }) as ProfileData['experienceLevel'];
      }
    }
    if (!experienceLevel) {
      return NextResponse.json({ error: "No se pudo calcular tu nivel de experiencia. Por favor, completa tu perfil con tu frecuencia de entrenamiento y meses entrenando." }, { status: 400 });
    }
    profileData.experienceLevel = experienceLevel;

    // Validar los otros campos requeridos
    const requiredFields = ['goal', 'currentWeight', 'height'] as const;
    const missingFields = requiredFields.filter(field => !profileData[field as keyof ProfileData]);
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        status: 400
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
    const exercises = await prisma.exercise.findMany({
      where: {
        muscleGroup: profileData.goal === 'gain-muscle' ? 'piernas' : undefined,
      },
      take: 10,
    });

    if (exercises.length === 0) {
      return NextResponse.json({ error: "No exercises available" }, { status: 500 });
    }

    // Create a personalized workout plan based on profile
    const workout = await prisma.workout.create({
      data: {
        name: `Plan de Entrenamiento ${profileData.goal === 'gain-muscle' ? 'Muscular' : 'Cardio'}`,
        description: `Plan personalizado basado en tu objetivo: ${profileData.goal}`,
        createdById: userId,
        type: 'personal',
        exercises: {
          create: exercises.slice(0, 5).map((exercise, index) => ({
            exerciseId: exercise.id,
            sets: profileData.experienceLevel === 'beginner' ? 2 : 3,
            reps: profileData.experienceLevel === 'beginner' ? 8 : 12,
            restTime: profileData.experienceLevel === 'beginner' ? 90 : 60,
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
    }) as {
      id: string;
      name: string;
      description: string;
      exercises: PrismaExercise[];
    };

    // Create a personalized food recommendation
    const calorieTarget = Math.round(2000 * (profileData.currentWeight / 70));
    const macros: Macros = {
      protein: Math.round(calorieTarget * 0.3 / 4).toString(),
      carbs: Math.round(calorieTarget * 0.5 / 4).toString(),
      fat: Math.round(calorieTarget * 0.2 / 9).toString(),
      description: `Calorías: ${calorieTarget}`,
    };

    const foodRecommendation = await prisma.foodRecommendation.create({
      data: {
        userId: userId,
        macros: JSON.stringify(macros),
        meals: JSON.stringify({
          breakfast: profileData.goal === 'gain-muscle' ? 
            ['Batido de proteínas', 'Avena con frutos secos'] : 
            ['Yogur natural', 'Fruta fresca'],
          lunch: profileData.goal === 'gain-muscle' ? 
            ['Pechuga de pollo', 'Arroz integral', 'Batata'] : 
            ['Pescado blanco', 'Verduras', 'Ensalada'],
          dinner: profileData.goal === 'gain-muscle' ? 
            ['Salmón', 'Quinoa', 'Verduras'] : 
            ['Huevo revuelto', 'Verduras'],
          snacks: ['Yogur griego', 'Frutos secos'],
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
          weight: Number(profileData.currentWeight), // Convert to number
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
            exercises: workout.exercises.map((exerciseData: PrismaExercise) => ({
              id: exerciseData.id,
              name: exerciseData.exercise.name,
              sets: exerciseData.sets,
              reps: exerciseData.reps,
              restTime: exerciseData.restTime || 0,
              notes: exerciseData.notes || '',
            })),
          },
          {
            day: "Miércoles",
            exercises: workout.exercises.map((exerciseData: PrismaExercise) => ({
              id: exerciseData.id,
              name: exerciseData.exercise.name,
              sets: exerciseData.sets,
              reps: exerciseData.reps,
              restTime: exerciseData.restTime || 0,
              notes: exerciseData.notes || '',
            })),
          },
          {
            day: "Viernes",
            exercises: workout.exercises.map((exerciseData: PrismaExercise) => ({
              id: exerciseData.id,
              name: exerciseData.exercise.name,
              sets: exerciseData.sets,
              reps: exerciseData.reps,
              restTime: exerciseData.restTime || 0,
              notes: exerciseData.notes || '',
            })),
          },
        ],
      },
      foodRecommendation: {
        macros: {
          protein: Math.round(calorieTarget * 0.3 / 4).toString() + "g",
          carbs: Math.round(calorieTarget * 0.5 / 4).toString() + "g",
          fat: Math.round(calorieTarget * 0.2 / 9).toString() + "g",
          description: `Plan nutricional personalizado con ${calorieTarget} calorías diarias. Distribución equilibrada de macronutrientes para ${profileData.goal === 'gain-muscle' ? 'ganar masa muscular' : profileData.goal === 'lose-weight' ? 'perder peso' : 'mantener peso'}.`,
        },
        meals: JSON.parse(foodRecommendation.meals as string),
        calorieTarget: foodRecommendation.calorieTarget,
      },
      recommendations: [
        `Mantén una rutina consistente de entrenamiento, especialmente ${profileData.goal === 'gain-muscle' ? 'de fuerza' : 'cardio'}`,
        `Consume proteína de alta calidad después del entrenamiento`,
        `Descansa lo suficiente entre sesiones`,
        `Mantén una hidratación adecuada`,
        `Ajusta las calorías según ${profileData.goal === 'gain-muscle' ? 'ganar masa muscular' : 'perder grasa'}`,
      ],
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { 
        error: "Error generating recommendations", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
