/**
 * Helpers para trabajar con FoodRecommendation
 * Usa estructura normalizada con tablas relacionadas
 */

import { prisma } from "@/lib/database/prisma";

interface MealEntry {
  foodId: string;
  quantity: number;
  food?: {
    id: string;
    name: string;
    category: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving: number;
    servingUnit: string | null;
  };
}

interface Meal {
  entries: MealEntry[];
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
}

interface Meals {
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
  snacks?: Meal;
}

interface Macros {
  protein?: string;
  carbs?: string;
  fat?: string;
  description?: string;
}

/**
 * Calcula los totales de una comida basándose en los entries
 */
export async function calculateMealTotals(entries: MealEntry[]) {
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  for (const entry of entries) {
    if (!entry.food) continue;

    // quantity está en gramos, calcular multiplier basado en 100g
    const multiplier = entry.quantity / 100;
    totals.calories += entry.food.calories * multiplier;
    totals.protein += entry.food.protein * multiplier;
    totals.carbs += entry.food.carbs * multiplier;
    totals.fat += entry.food.fat * multiplier;
  }

  return {
    totalCalories: Math.round(totals.calories),
    totalProtein: Math.round(totals.protein * 10) / 10,
    totalCarbs: Math.round(totals.carbs * 10) / 10,
    totalFat: Math.round(totals.fat * 10) / 10,
  };
}

/**
 * Obtiene un FoodRecommendation en formato unificado usando estructura normalizada
 */
export async function getFoodRecommendationUnified(
  foodRecommendationId: string,
) {
  const foodPlan = await prisma.foodRecommendation.findUnique({
    where: { id: foodRecommendationId },
    include: {
      mealPlanMeals: {
        include: {
          entries: {
            include: {
              food: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!foodPlan) {
    return null;
  }

  // Convertir estructura normalizada a formato unificado
  const meals: Meals = {};

  for (const mealPlanMeal of foodPlan.mealPlanMeals) {
    const entries: MealEntry[] = mealPlanMeal.entries.map((entry) => ({
      foodId: entry.foodId,
      quantity: entry.quantity,
      food: {
        id: entry.food.id,
        name: entry.food.name,
        category: entry.food.category,
        calories: entry.food.calories,
        protein: entry.food.protein,
        carbs: entry.food.carbs,
        fat: entry.food.fat,
        serving: entry.food.serving,
        servingUnit: entry.food.servingUnit || "g",
      },
    }));

    const totals = await calculateMealTotals(entries);

    meals[mealPlanMeal.mealType as keyof Meals] = {
      entries,
      ...totals,
    };
  }

  // Construir macros desde los campos normalizados
  const macros: Macros = {
    protein: foodPlan.proteinTarget
      ? `${Math.round(foodPlan.proteinTarget)}g`
      : undefined,
    carbs: foodPlan.carbsTarget
      ? `${Math.round(foodPlan.carbsTarget)}g`
      : undefined,
    fat: foodPlan.fatTarget ? `${Math.round(foodPlan.fatTarget)}g` : undefined,
    description: foodPlan.description || undefined,
  };

  return {
    ...foodPlan,
    meals,
    macros,
  };
}

/**
 * Crea un FoodRecommendation usando la nueva estructura normalizada
 */
export async function createFoodRecommendationNormalized(data: {
  userId: string;
  instructorId?: string;
  assignedToId?: string;
  name?: string;
  calorieTarget: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
  description?: string;
  notes?: string;
  meals: {
    breakfast?: { entries: Array<{ foodId: string; quantity: number }> };
    lunch?: { entries: Array<{ foodId: string; quantity: number }> };
    dinner?: { entries: Array<{ foodId: string; quantity: number }> };
    snacks?: { entries: Array<{ foodId: string; quantity: number }> };
  };
}) {
  // Crear FoodRecommendation
  const foodRecommendation = await prisma.foodRecommendation.create({
    data: {
      userId: data.userId,
      instructorId: data.instructorId,
      assignedToId: data.assignedToId,
      name: data.name,
      calorieTarget: data.calorieTarget,
      proteinTarget: data.proteinTarget,
      carbsTarget: data.carbsTarget,
      fatTarget: data.fatTarget,
      description: data.description,
      notes: data.notes,
    },
  });

  // Crear MealPlanMeal y MealPlanEntry para cada comida
  const mealTypeMap: Record<string, string> = {
    breakfast: "breakfast",
    lunch: "lunch",
    dinner: "dinner",
    snacks: "snacks",
  };

  for (const [mealKey, mealType] of Object.entries(mealTypeMap)) {
    const meal = data.meals[mealKey as keyof typeof data.meals];
    if (!meal || !meal.entries || meal.entries.length === 0) {
      continue;
    }

    const mealPlanMeal = await prisma.mealPlanMeal.create({
      data: {
        foodRecommendationId: foodRecommendation.id,
        mealType,
        order: Object.keys(mealTypeMap).indexOf(mealKey),
      },
    });

    // Crear entries
    for (let idx = 0; idx < meal.entries.length; idx++) {
      const entry = meal.entries[idx];
      await prisma.mealPlanEntry.create({
        data: {
          mealPlanMealId: mealPlanMeal.id,
          foodId: entry.foodId,
          quantity: entry.quantity,
          order: idx,
        },
      });
    }
  }

  return foodRecommendation;
}
