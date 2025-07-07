import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get exercises
    const exercises = await prisma.exercise.findMany({
      take: 10,
    });

    if (exercises.length === 0) {
      return NextResponse.json({ error: "No exercises available" }, { status: 500 });
    }

    // Create a simple workout plan
    const workout = await prisma.workout.create({
      data: {
        name: "Plan de Entrenamiento Personalizado",
        description: "Plan de entrenamiento basado en tu perfil",
        userId: userId,
        exercises: {
          create: exercises.slice(0, 5).map((exercise, index) => ({
            exerciseId: exercise.id,
            sets: 3,
            reps: 10,
            restTime: 60,
            order: index,
            notes: "Ejercicio recomendado",
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
    });

    // Create a simple food recommendation
    const foodRecommendation = await prisma.foodRecommendation.create({
      data: {
        userId: userId,
        macros: {
          protein: 150,
          carbs: 200,
          fat: 60,
        },
        meals: {
          breakfast: ["Avena con frutas", "Huevos revueltos"],
          lunch: ["Pechuga de pollo", "Arroz integral", "Ensalada"],
          dinner: ["Salmón", "Quinoa", "Vegetales"],
          snacks: ["Yogur griego", "Nueces"],
        },
        calorieTarget: 2000,
      },
    });

    // Create weight entry if it doesn't exist
    const existingWeight = await prisma.weight.findFirst({
      where: { userId },
    });

    if (!existingWeight && profile.currentWeight) {
      await prisma.weight.create({
        data: {
          userId,
          weight: Number(profile.currentWeight),
          date: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      workout: {
        id: workout.id,
        name: workout.name,
        description: workout.description,
        exercises: workout.exercises.map(we => ({
            id: we.id,
          name: we.exercise.name,
          sets: we.sets,
          reps: we.reps,
          restTime: we.restTime,
          notes: we.notes,
        })),
      },
      foodRecommendation: {
        id: foodRecommendation.id,
        macros: foodRecommendation.macros,
        meals: foodRecommendation.meals,
        calorieTarget: foodRecommendation.calorieTarget,
      },
      recommendations: [
        "Mantén una rutina consistente de entrenamiento",
        "Consume proteína de alta calidad después del entrenamiento",
        "Descansa lo suficiente entre sesiones",
        "Mantén una hidratación adecuada",
      ],
    });
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
