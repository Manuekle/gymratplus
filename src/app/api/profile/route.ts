import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { redis } from "@/lib/redis";

const PROFILE_CACHE_TTL = 60 * 5; // 5 minutos

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    // Obtener el usuario y su perfil
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user || !user.profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 },
      );
    }

    console.log(user);

    // Actualizar Redis en segundo plano sin esperar la respuesta
    const cacheKey = `profile:${userId}`;
    redis
      .set(cacheKey, JSON.stringify(user.profile), {
        ex: PROFILE_CACHE_TTL,
      })
      .catch((error) => {
        console.error("Error actualizando cache Redis:", error);
      });

    return NextResponse.json({
      ...user.profile,
      isInstructor: user.isInstructor,
      experienceLevel: user.experienceLevel,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Error al obtener el perfil" },
      { status: 500 },
    );
  }
}

// Existing POST and PUT routes remain the same...
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    if (!userId) {
      return NextResponse.json(
        { error: "No se encontró el userId" },
        { status: 400 },
      );
    }
    const data = await req.json();

    // Calcular valores automáticos
    const dailyCalorieTarget = calculateDailyCalories(data);
    const { dailyProteinTarget, dailyCarbTarget, dailyFatTarget } =
      calculateMacros(dailyCalorieTarget, data);
    const waterIntake = calculateWaterIntake(data.currentWeight);

    // Manejar la fecha de nacimiento de forma segura
    if (data.birthdate) {
      try {
        // Intentar convertir a Date
        const dateObj = new Date(data.birthdate);
        if (!isNaN(dateObj.getTime())) {
          data.birthdate = dateObj;
        } else {
          console.warn("Invalid birthdate received:", data.birthdate);
          data.birthdate = null;
        }
      } catch (e) {
        console.error("Error parsing birthdate:", e);
        data.birthdate = null;
      }
    } else {
      data.birthdate = null;
    }

    // Crear un objeto de respuesta con los datos del perfil y los cálculos

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
        monthsTraining: data.monthsTraining ?? undefined,
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
        monthsTraining: data.monthsTraining ?? undefined,
      },
    });

    // Cache the profile in Redis
    const cacheKey = `profile:${userId}`;
    await redis.set(cacheKey, JSON.stringify(profile), {
      ex: PROFILE_CACHE_TTL,
    });

    // Guardar experienceLevel en User si viene en el body
    if (data.experienceLevel) {
      await prisma.user.update({
        where: { id: userId },
        data: { experienceLevel: data.experienceLevel },
      });
    }

    // Simular un pequeño retraso para mostrar el estado de carga
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const userId = session.user.id;

    // Actualizar datos del usuario
    if (data.name || data.email || data.image || data.experienceLevel) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name ?? undefined,
          email: data.email ?? undefined,
          image: data.image ?? undefined,
          experienceLevel: data.experienceLevel ?? undefined,
        },
      });

      // Limpiar la caché del usuario
      await redis.del(`user:${userId}:data`);
    }

    // Actualizar o crear el perfil del usuario
    const profile = await prisma.profile.upsert({
      where: { userId: userId },
      update: {
        phone: data.phone ?? undefined,
        birthdate: data.birthdate ?? undefined,
        preferredWorkoutTime: data.preferredWorkoutTime ?? undefined,
        dailyActivity: data.dailyActivity ?? undefined,
        goal: data.goal ?? undefined,
        dietaryPreference: data.dietaryPreference ?? undefined,
        waterIntake: data.waterIntake ?? undefined,
        monthsTraining: data.monthsTraining ?? undefined,
      },
      create: {
        userId: userId as string,
        phone: data.phone ?? undefined,
        birthdate: data.birthdate ?? undefined,
        preferredWorkoutTime: data.preferredWorkoutTime ?? undefined,
        dailyActivity: data.dailyActivity ?? undefined,
        goal: data.goal ?? undefined,
        dietaryPreference: data.dietaryPreference ?? undefined,
        waterIntake: data.waterIntake ?? undefined,
        monthsTraining: data.monthsTraining ?? undefined,
      },
    });

    // Clave correcta para Redis
    const cacheKey = `profile:${userId}`;

    // Eliminar la caché anterior
    await redis.del(cacheKey);

    // Guardar el nuevo perfil en Redis
    await redis.set(cacheKey, JSON.stringify(profile), {
      ex: PROFILE_CACHE_TTL,
    });

    // Obtener el usuario actualizado con todos sus datos
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        experienceLevel: true,
        image: true,
        profile: true,
      },
    });

    // Refrescar la sesión actualizada
    const updatedSession = await getServerSession(authOptions);

    return NextResponse.json({
      success: true,
      profile,
      user: updatedUser,
      session: updatedSession,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}

// Helper functions for calculations
function calculateDailyCalories(data: {
  gender: string;
  height: string;
  currentWeight: string;
  birthdate: string | null;
  activityLevel: string;
  goal: string;
}): number {
  // Implementación real de la fórmula de Harris-Benedict para BMR
  const { gender, height, currentWeight, birthdate, activityLevel, goal } =
    data;

  // Calcular edad basada en la fecha de nacimiento
  let age = 30; // Valor predeterminado si no hay fecha de nacimiento
  if (birthdate) {
    try {
      const birthDate = new Date(birthdate);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    } catch (e) {
      console.error("Error calculating age:", e);
    }
  }

  // Convertir altura y peso a números
  const heightCm = Number.parseFloat(height);
  const weightKg = Number.parseFloat(currentWeight);

  // Calcular BMR (Basal Metabolic Rate)
  let bmr = 0;
  if (gender === "male") {
    bmr = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  }

  // Aplicar multiplicador de actividad
  let activityMultiplier = 1.2; // Sedentario
  switch (activityLevel) {
    case "sedentary":
      activityMultiplier = 1.2;
      break;
    case "light":
      activityMultiplier = 1.375;
      break;
    case "moderate":
      activityMultiplier = 1.55;
      break;
    case "active":
      activityMultiplier = 1.725;
      break;
    case "very-active":
      activityMultiplier = 1.9;
      break;
  }

  let tdee = bmr * activityMultiplier;

  // Ajustar según el objetivo
  switch (goal) {
    case "lose-weight":
      tdee -= 500; // Déficit de 500 calorías para perder peso
      break;
    case "gain-muscle":
      tdee += 300; // Superávit de 300 calorías para ganar músculo
      break;
    // Para 'maintain', no se hace ajuste
  }

  return Math.round(tdee);
}

function calculateMacros(
  calories: number,
  data: { goal: string },
): {
  dailyProteinTarget: number;
  dailyCarbTarget: number;
  dailyFatTarget: number;
} {
  const { goal } = data;

  let proteinPercentage = 0.3; // 30% por defecto
  let fatPercentage = 0.3; // 30% por defecto
  let carbPercentage = 0.4; // 40% por defecto

  // Ajustar macros según el objetivo
  if (goal === "lose-weight") {
    proteinPercentage = 0.4; // Más proteína para preservar masa muscular
    fatPercentage = 0.3;
    carbPercentage = 0.3; // Menos carbohidratos
  } else if (goal === "gain-muscle") {
    proteinPercentage = 0.35;
    fatPercentage = 0.25;
    carbPercentage = 0.4; // Más carbohidratos para energía
  }

  // Calcular gramos de cada macronutriente
  // Proteína: 4 calorías por gramo
  // Carbohidratos: 4 calorías por gramo
  // Grasa: 9 calorías por gramo
  return {
    dailyProteinTarget: Math.round((calories * proteinPercentage) / 4),
    dailyCarbTarget: Math.round((calories * carbPercentage) / 4),
    dailyFatTarget: Math.round((calories * fatPercentage) / 9),
  };
}

function calculateWaterIntake(weight: string): number {
  // Fórmula básica: 30-35 ml por kg de peso corporal
  const weightKg = Number.parseFloat(weight);
  return Math.round(weightKg * 0.033 * 10) / 10; // Litros, redondeado a 1 decimal
}

function calculateMetabolicRate(data: {
  gender: string;
  height: string;
  currentWeight: string;
  birthdate: string | null;
}): number {
  // Simplemente devolvemos el BMR calculado
  const { gender, height, currentWeight, birthdate } = data;

  // Calcular edad basada en la fecha de nacimiento
  let age = 30; // Valor predeterminado si no hay fecha de nacimiento
  if (birthdate) {
    try {
      const birthDate = new Date(birthdate);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    } catch (e) {
      console.error("Error calculating age:", e);
    }
  }

  // Convertir altura y peso a números
  const heightCm = Number.parseFloat(height);
  const weightKg = Number.parseFloat(currentWeight);

  // Calcular BMR (Basal Metabolic Rate)
  let bmr = 0;
  if (gender === "male") {
    bmr = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  }

  return Math.round(bmr);
}
