import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth/next";
import { createFoodRecommendationNormalized } from "@/lib/nutrition/food-recommendation-helpers";

interface NutritionPlan {
  name?: string;
  macros: {
    protein?: string;
    carbs?: string;
    fat?: string;
    description?: string;
  };
  meals: {
    breakfast?: { entries: Array<{ foodId: string; quantity: number }> };
    lunch?: { entries: Array<{ foodId: string; quantity: number }> };
    dinner?: { entries: Array<{ foodId: string; quantity: number }> };
    snacks?: { entries: Array<{ foodId: string; quantity: number }> };
  };
  calorieTarget: number;
}

interface RequestBody {
  nutritionPlan: NutritionPlan;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: RequestBody = await req.json();
    const { nutritionPlan } = body;

    // Validate required fields
    if (
      !nutritionPlan ||
      !nutritionPlan.macros ||
      !nutritionPlan.meals ||
      nutritionPlan.calorieTarget === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields in nutrition plan" },
        { status: 400 },
      );
    }

    // Extract the necessary data from the nutrition plan
    const { name, macros, meals, calorieTarget } = nutritionPlan;

    // Extraer valores numéricos de macros si están en formato "224g (39%)"
    let proteinTarget: number | undefined;
    let carbsTarget: number | undefined;
    let fatTarget: number | undefined;

    if (macros.protein) {
      const proteinMatch = String(macros.protein).match(/(\d+(?:\.\d+)?)/);
      if (proteinMatch) {
        proteinTarget = parseFloat(proteinMatch[1]);
      }
    }
    if (macros.carbs) {
      const carbsMatch = String(macros.carbs).match(/(\d+(?:\.\d+)?)/);
      if (carbsMatch) {
        carbsTarget = parseFloat(carbsMatch[1]);
      }
    }
    if (macros.fat) {
      const fatMatch = String(macros.fat).match(/(\d+(?:\.\d+)?)/);
      if (fatMatch) {
        fatTarget = parseFloat(fatMatch[1]);
      }
    }

    // Create the food recommendation using normalized structure
    const foodRecommendation = await createFoodRecommendationNormalized({
      userId: session.user.id,
      name: name?.trim() || undefined,
      calorieTarget: Number(calorieTarget),
      proteinTarget,
      carbsTarget,
      fatTarget,
      description: macros.description,
      meals: {
        breakfast: meals.breakfast,
        lunch: meals.lunch,
        dinner: meals.dinner,
        snacks: meals.snacks,
      },
    });

    return NextResponse.json(foodRecommendation);
  } catch (error) {
    console.error("Error creating food recommendation:", error);
    return NextResponse.json(
      { error: "Failed to save food recommendation" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 });
  }

  try {
    // Verificar si el usuario es instructor
    const instructorProfile = await prisma.instructorProfile.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    // Buscar planes donde el usuario es el dueño (userId), donde está asignado (assignedToId),
    // o donde es el instructor que lo creó (instructorId)
    // Esto asegura que los estudiantes vean los planes creados por sus instructores
    // y que los instructores vean los planes que crearon para sus estudiantes
    const foodRecommendations = await prisma.foodRecommendation.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { assignedToId: session.user.id },
          ...(instructorProfile ? [{ instructorId: session.user.id }] : []),
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        userId: true,
        instructorId: true,
        assignedToId: true,
        date: true,
        name: true,
        calorieTarget: true,
        proteinTarget: true,
        carbsTarget: true,
        fatTarget: true,
        description: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(foodRecommendations);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch food recommendations" },
      { status: 500 },
    );
  }
}

// TODO: QUITAR ESTO DESPUÉS DE PROBAR - Solo para testing
// DELETE todas las recomendaciones de comida del usuario
export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 });
  }

  try {
    // Eliminar todas las recomendaciones de comida del usuario
    // El cascade eliminará automáticamente MealPlanMeal y MealPlanEntry
    const result = await prisma.foodRecommendation.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Error deleting food recommendations:", error);
    return NextResponse.json(
      { error: "Failed to delete food recommendations" },
      { status: 500 },
    );
  }
}
