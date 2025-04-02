import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redis } from "@/lib/redis";

const CALCULATION_CACHE_TTL = 60 * 5; // 5 minutes

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json();
    const {
      gender,
      age,
      weight,
      height,
      activityLevel,
      goal,
      dietaryPreference,
    } = data;
    const userId = session.user.id;

    // Validar datos
    if (
      !gender ||
      !age ||
      !weight ||
      !height ||
      !activityLevel ||
      !goal ||
      !dietaryPreference
    ) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Generar una clave de caché basada en los parámetros
    const cacheKey = `calorie-calc:${userId}:${gender}:${age}:${weight}:${height}:${activityLevel}:${goal}:${dietaryPreference}`;

    // Intentar obtener del caché primero
    const cachedResult = await redis.get(cacheKey).catch(() => null);

    if (cachedResult) {
      return NextResponse.json(JSON.parse(cachedResult as string));
    }

    // Calcular BMR (Basal Metabolic Rate) usando la fórmula de Mifflin-St Jeor
    let bmr = 0;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Aplicar multiplicador de actividad
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2, // Poco o ningún ejercicio
      light: 1.375, // Ejercicio ligero 1-3 días/semana
      moderate: 1.55, // Ejercicio moderado 3-5 días/semana
      active: 1.725, // Ejercicio intenso 6-7 días/semana
      very_active: 1.9, // Ejercicio muy intenso, trabajo físico
    };

    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

    // Ajustar según el objetivo
    let dailyCalorieTarget = tdee;
    if (goal === "lose-weight") {
      dailyCalorieTarget = Math.round(tdee * 0.85); // Déficit del 15%
    } else if (goal === "gain-muscle") {
      dailyCalorieTarget = Math.round(tdee * 1.1); // Superávit del 10%
    }

    // Calcular macronutrientes
    let proteinPercentage = 0.25; // 25% por defecto
    let carbPercentage = 0.45; // 45% por defecto
    let fatPercentage = 0.3; // 30% por defecto

    // Ajustar macros según objetivo y preferencia dietética
    if (goal === "gain-muscle") {
      proteinPercentage = 0.3; // 30%
      carbPercentage = 0.45; // 45%
      fatPercentage = 0.25; // 25%
    } else if (goal === "lose-weight") {
      proteinPercentage = 0.35; // 35%
      carbPercentage = 0.35; // 35%
      fatPercentage = 0.3; // 30%
    }

    // Ajustar para dieta keto
    if (dietaryPreference === "keto") {
      proteinPercentage = 0.3; // 30%
      carbPercentage = 0.05; // 5%
      fatPercentage = 0.65; // 65%
    }

    // Calcular gramos de cada macronutriente
    const dailyProteinTarget = Math.round(
      (dailyCalorieTarget * proteinPercentage) / 4
    ); // 4 cal/g
    const dailyCarbTarget = Math.round(
      (dailyCalorieTarget * carbPercentage) / 4
    ); // 4 cal/g
    const dailyFatTarget = Math.round((dailyCalorieTarget * fatPercentage) / 9); // 9 cal/g

    // Crear el objeto de resultados
    const result = {
      dailyCalorieTarget,
      dailyProteinTarget,
      dailyCarbTarget,
      dailyFatTarget,
    };

    // Guardar en Redis para futuras solicitudes
    await redis
      .set(cacheKey, JSON.stringify(result), {
        ex: CALCULATION_CACHE_TTL,
      })
      .catch((error) => {
        console.error("Error guardando en Redis:", error);
      });

    // Devolver los resultados calculados
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al calcular objetivos calóricos:", error);
    return NextResponse.json(
      { error: "Error al calcular objetivos calóricos" },
      { status: 500 }
    );
  }
}
