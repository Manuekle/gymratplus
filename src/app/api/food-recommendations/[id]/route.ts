import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const foodPlanId = params.id;

    // Obtener el plan de alimentación
    const foodPlan = await prisma.foodRecommendation.findFirst({
      where: {
        id: foodPlanId,
        OR: [{ userId: session.user.id }, { assignedToId: session.user.id }],
      },
    });

    if (!foodPlan) {
      return NextResponse.json(
        { error: "Plan de alimentación no encontrado" },
        { status: 404 },
      );
    }

    // Parsear los JSON strings
    const parsedMeals =
      typeof foodPlan.meals === "string"
        ? JSON.parse(foodPlan.meals)
        : foodPlan.meals;

    const parsedMacros =
      typeof foodPlan.macros === "string"
        ? JSON.parse(foodPlan.macros)
        : foodPlan.macros;

    // Recopilar todos los foodIds de todas las comidas
    const allFoodIds = new Set<string>();
    Object.values(parsedMeals).forEach((meal: any) => {
      if (meal?.entries) {
        meal.entries.forEach((entry: any) => {
          // Si el entry ya tiene el objeto food completo, no necesitamos buscarlo
          if (!entry.food && entry.foodId) {
            allFoodIds.add(entry.foodId);
          }
        });
      }
    });

    // Obtener todos los alimentos necesarios
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
          category: food.category,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          serving: food.serving,
          servingUnit: food.servingUnit || "g",
        });
      });
    }

    // Poblar los objetos food en las entradas
    const populatedMeals: any = {};
    Object.keys(parsedMeals).forEach((mealKey) => {
      const meal = parsedMeals[mealKey];
      if (meal && meal.entries) {
        populatedMeals[mealKey] = {
          ...meal,
          entries: meal.entries.map((entry: any) => {
            // Si ya tiene el objeto food, usarlo; si no, buscarlo
            if (entry.food) {
              return entry;
            }
            const food = foodsMap.get(entry.foodId);
            return {
              ...entry,
              food: food || {
                id: entry.foodId,
                name: "Alimento no encontrado",
                category: "unknown",
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                serving: 100,
                servingUnit: "g",
              },
            };
          }),
        };
      } else {
        populatedMeals[mealKey] = meal;
      }
    });

    const parsedFoodPlan = {
      ...foodPlan,
      macros: parsedMacros,
      meals: populatedMeals,
    };

    return NextResponse.json(parsedFoodPlan);
  } catch (error) {
    console.error("Error al obtener el plan de alimentación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
