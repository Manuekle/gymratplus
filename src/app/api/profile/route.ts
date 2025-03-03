import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.json();

    // Calcular valores automáticos
    const dailyCalorieTarget = calculateDailyCalories(data);
    const { dailyProteinTarget, dailyCarbTarget, dailyFatTarget } =
      calculateMacros(dailyCalorieTarget);
    const waterIntake = calculateWaterIntake(data.currentWeight);

    const profile = await prisma.profile.upsert({
      where: { userId: userId },
      update: {
        gender: data.gender,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        height: data.height,
        currentWeight: data.currentWeight,
        targetWeight: data.targetWeight,
        activityLevel: data.activityLevel,
        goal: data.goal,
        muscleMass: data.muscleMass,
        metabolicRate: calculateMetabolicRate(data),
        dailyActivity: data.dailyActivity,
        trainingFrequency: data.trainingFrequency,
        preferredWorkoutTime: data.preferredWorkoutTime,
        dietaryPreference: data.dietaryPreference,
        dailyCalorieTarget,
        dailyProteinTarget,
        dailyCarbTarget,
        dailyFatTarget,
        waterIntake,
      },
      create: {
        userId,
        gender: data.gender,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        height: data.height,
        currentWeight: data.currentWeight,
        targetWeight: data.targetWeight,
        activityLevel: data.activityLevel,
        goal: data.goal,
        bodyFatPercentage: data.bodyFatPercentage,
        muscleMass: data.muscleMass,
        metabolicRate: calculateMetabolicRate(data),
        dailyActivity: data.dailyActivity,
        trainingFrequency: data.trainingFrequency,
        preferredWorkoutTime: data.preferredWorkoutTime,
        dietaryPreference: data.dietaryPreference,
        dailyCalorieTarget,
        dailyProteinTarget,
        dailyCarbTarget,
        dailyFatTarget,
        waterIntake,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Funciones auxiliares para cálculos
function calculateDailyCalories(data: any): number {
  // Implementa la lógica para calcular las calorías diarias
  // Esto es un placeholder, deberías implementar la fórmula real
  const { gender, currentWeight, height, age, activityLevel } = data;

  let bmr: number;

  // Calcular BMR (Tasa Metabólica Basal) usando la fórmula de Harris-Benedict
  if (gender === "male") {
    bmr = 88.362 + 13.397 * currentWeight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * currentWeight + 3.098 * height - 4.33 * age;
  }

  // Ajustar BMR basado en el nivel de actividad
  const activityMultiplier: { [key: string]: number } = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };

  const dailyCalories = bmr * (activityMultiplier[activityLevel] || 1.2);

  return Math.round(dailyCalories);
}

function calculateMacros(calories: number): {
  dailyProteinTarget: number;
  dailyCarbTarget: number;
  dailyFatTarget: number;
} {
  // Implementa la lógica para calcular los macronutrientes
  // Esto es un placeholder, deberías implementar la fórmula real
  return {
    dailyProteinTarget: Math.round((calories * 0.3) / 4),
    dailyCarbTarget: Math.round((calories * 0.4) / 4),
    dailyFatTarget: Math.round((calories * 0.3) / 9),
  };
}

function calculateWaterIntake(weight: string): number {
  // Implementa la lógica para calcular la ingesta de agua
  // Esto es un placeholder, deberías implementar la fórmula real
  return Number.parseFloat(weight) * 0.033;
}

function calculateMetabolicRate(data: any): string {
  // Implementa la lógica para calcular la tasa metabólica
  const { gender, currentWeight, height, age } = data;

  let bmr: number;

  // Calcular BMR (Tasa Metabólica Basal) usando la fórmula de Harris-Benedict
  if (gender === "male") {
    bmr = 88.362 + 13.397 * currentWeight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * currentWeight + 3.098 * height - 4.33 * age;
  }

  return bmr.toFixed(2);
}
