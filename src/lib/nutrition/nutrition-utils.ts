import { prisma } from "@/lib/database/prisma";
import type { Food } from "@prisma/client";
import { foodsToCreate } from "@/data/food";

// Get or create foods in the database
export async function getOrCreateFoods(dietaryPreference = "no-preference") {
  // Check if foods already exist
  const count = await prisma.food.count();

  if (count === 0) {
    // Create foods if they don't exist
    const createdFoods = await prisma.$transaction(
      foodsToCreate.map((food) => prisma.food.create({ data: food }))
    );

    return filterFoodsByPreference(createdFoods, dietaryPreference);
  }

  // Get all foods and filter by preference
  const foods = await prisma.food.findMany();
  return filterFoodsByPreference(foods, dietaryPreference);
}

// Helper function to filter foods by dietary preference
function filterFoodsByPreference(
  foods: Food[],
  dietaryPreference: string
): Food[] {
  if (dietaryPreference === "vegetarian") {
    return foods.filter(
      (food) =>
        !food.name.toLowerCase().includes("pollo") &&
        !food.name.toLowerCase().includes("carne") &&
        !food.name.toLowerCase().includes("pescado") &&
        !food.name.toLowerCase().includes("salmón")
    );
  } else if (dietaryPreference === "keto") {
    return foods.filter(
      (food) =>
        food.carbs < 10 ||
        food.category === "proteína" ||
        food.category === "grasa"
    );
  }

  return foods;
}

// Create a nutrition plan based on user profile
export interface NutritionProfile {
  userId: string;
  goal: "lose-weight" | "maintain" | "gain-muscle" | string;
  dietaryPreference: "vegetarian" | "keto" | "no-preference" | string;
  dailyCalorieTarget?: number;
  dailyProteinTarget?: number;
  dailyCarbTarget?: number;
  dailyFatTarget?: number;
}

interface Macros {
  protein: string;
  carbs: string;
  fat: string;
  description: string;
}

interface MealLog {
  userId: string;
  date: Date;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: { foodId: string; quantity: number; food?: Food }[];
}

export interface NutritionPlan {
  macros: Macros;
  meals: {
    breakfast: MealLog;
    lunch: MealLog;
    dinner: MealLog;
    snacks: MealLog;
  };
  calorieTarget?: number;
}

export async function createNutritionPlan(
  profile: NutritionProfile
): Promise<NutritionPlan> {
  const { userId, goal, dietaryPreference } = profile;

  // Get foods from database or create new ones if they don't exist
  const foods = await getOrCreateFoods(dietaryPreference);

  // Generate meal plans for each meal type
  const breakfast: MealLog = await createMealLog(
    userId,
    "breakfast",
    foods,
    goal,
    dietaryPreference
  );

  const lunch: MealLog = await createMealLog(
    userId,
    "lunch",
    foods,
    goal,
    dietaryPreference
  );

  const dinner: MealLog = await createMealLog(
    userId,
    "dinner",
    foods,
    goal,
    dietaryPreference
  );

  const snacks: MealLog = await createMealLog(
    userId,
    "snack",
    foods,
    goal,
    dietaryPreference
  );

  const translationDictionary: Record<string, string> = {
    "lose-weight": "Perder peso",
    maintain: "Mantener",
    "gain-muscle": "Ganar músculo",
  };

  const translate = (key: string) => translationDictionary[key] ?? key;

  // Return the complete nutrition plan
  return {
    macros: {
      protein: `${profile.dailyProteinTarget ?? 0}g (${Math.round(
        (((profile.dailyProteinTarget ?? 0) * 4) /
          (profile.dailyCalorieTarget ?? 2000)) *
          100
      )}%)`,
      carbs: `${profile.dailyCarbTarget ?? 0}g (${Math.round(
        (((profile.dailyCarbTarget ?? 0) * 4) /
          (profile.dailyCalorieTarget ?? 2000)) *
          100
      )}%)`,
      fat: `${profile.dailyFatTarget ?? 0}g (${Math.round(
        (((profile.dailyFatTarget ?? 0) * 9) /
          (profile.dailyCalorieTarget ?? 2000)) *
          100
      )}%)`,
      description: `Basado en tu objetivo de ${translate(
        goal
      )} y un objetivo diario de ${
        profile.dailyCalorieTarget ?? 2000
      } calorías`,
    },
    meals: {
      breakfast,
      lunch,
      dinner,
      snacks,
    },
    calorieTarget: profile.dailyCalorieTarget,
  };
}

async function createMealLog(
  userId: string,
  mealType: string,
  foods: Food[],
  goal: string,
  dietaryPreference: string = "no-preference"
): Promise<MealLog> {
  // Select appropriate foods based on meal type and dietary preference
  let selectedFoods: Food[] = [];

  // Helper function to safely get food items
  const getSafeFoods = (
    foods: Food[] | undefined,
    index: number = 0
  ): Food[] => {
    if (!foods || !Array.isArray(foods) || foods.length <= index) {
      return [];
    }
    const food = foods[index];
    if (
      food &&
      typeof food === "object" &&
      "id" in food &&
      "name" in food &&
      "calories" in food &&
      "protein" in food &&
      "carbs" in food &&
      "fat" in food
    ) {
      return [food as Food];
    }
    return [];
  };

  // Meal-specific food selection logic
  if (mealType === "breakfast") {
    const proteinFoods = foods.filter(
      (f) =>
        f.category === "proteína" &&
        (f.name === "Huevos" || f.name === "Yogur griego")
    );

    const carbFoods = foods.filter(
      (f) =>
        f.category === "carbohidrato" &&
        (f.name === "Avena" || f.name === "Pan integral")
    );

    const fruitFoods = foods.filter((f) => f.category === "fruta");

    const fatFoods = foods.filter(
      (f) =>
        f.category === "grasa" &&
        (f.name === "Aguacate" || f.name === "Almendras")
    );

    if (dietaryPreference === "keto") {
      const safeProteinFoods = getSafeFoods(proteinFoods);
      const safeFatFoods = getSafeFoods(fatFoods);
      const additionalFat =
        fatFoods.length > 1 ? getSafeFoods(fatFoods, 1) : [];

      selectedFoods = [
        ...safeProteinFoods,
        ...safeFatFoods,
        ...additionalFat,
      ].filter((food): food is Food => food !== undefined && food !== null);
    } else {
      const safeProteinFoods = getSafeFoods(proteinFoods);
      const safeCarbFoods = getSafeFoods(carbFoods);
      const safeFruitFoods = getSafeFoods(fruitFoods);
      const safeFatFoods = getSafeFoods(fatFoods);

      selectedFoods = [
        ...safeProteinFoods,
        ...safeCarbFoods,
        ...safeFruitFoods,
        ...safeFatFoods,
      ].filter((food): food is Food => food !== undefined && food !== null);
    }
  } else if (mealType === "lunch") {
    const proteinFoods = foods.filter((f) => f.category === "proteína");
    const carbFoods = foods.filter(
      (f) => f.category === "carbohidrato" && f.name !== "Avena"
    );
    const vegFoods = foods.filter((f) => f.category === "verdura");
    const fatFoods = foods.filter(
      (f) => f.category === "grasa" && f.name === "Aceite de oliva"
    );

    if (dietaryPreference === "keto") {
      selectedFoods = [
        ...getSafeFoods(proteinFoods),
        ...getSafeFoods(vegFoods),
        ...(vegFoods.length > 1 ? getSafeFoods(vegFoods, 1) : []),
        ...getSafeFoods(fatFoods),
      ].filter((food): food is Food => food !== undefined && food !== null);
    } else {
      selectedFoods = [
        ...getSafeFoods(proteinFoods),
        ...getSafeFoods(carbFoods),
        ...getSafeFoods(vegFoods),
        ...(vegFoods.length > 1 ? getSafeFoods(vegFoods, 1) : []),
        ...getSafeFoods(fatFoods),
      ].filter((food): food is Food => food !== undefined && food !== null);
    }
  } else if (mealType === "dinner") {
    const proteinFoods = foods.filter((f) => f.category === "proteína");
    const vegFoods = foods.filter((f) => f.category === "verdura");
    const fatFoods = foods.filter((f) => f.category === "grasa");
    const carbFoods =
      dietaryPreference === "keto"
        ? []
        : foods.filter(
            (f) => f.category === "carbohidrato" && f.name !== "Avena"
          );

    selectedFoods = [
      ...(proteinFoods.length > 1
        ? getSafeFoods(proteinFoods, 1)
        : getSafeFoods(proteinFoods)),
      ...getSafeFoods(carbFoods),
      ...getSafeFoods(vegFoods),
      ...(vegFoods.length > 1 ? getSafeFoods(vegFoods, 1) : []),
      ...getSafeFoods(fatFoods),
    ].filter((food): food is Food => food !== undefined && food !== null);
  } else if (mealType === "snack") {
    const proteinFoods = foods.filter(
      (f) =>
        f.category === "proteína" &&
        (f.name === "Yogur griego" || f.name === "Huevos")
    );
    const fruitFoods =
      dietaryPreference === "keto"
        ? []
        : foods.filter((f) => f.category === "fruta");
    const nutFoods = foods.filter(
      (f) =>
        f.category === "grasa" &&
        (f.name === "Almendras" || f.name === "Semillas de chía")
    );

    selectedFoods = [
      ...getSafeFoods(proteinFoods),
      ...getSafeFoods(fruitFoods),
      ...getSafeFoods(nutFoods),
    ].filter((food): food is Food => food !== undefined && food !== null);
  }

  // Calculate macros and create meal entries
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  const mealEntries: { foodId: string; quantity: number }[] = [];

  for (const food of selectedFoods) {
    let baseQuantity = 1.0;

    if (food.category === "proteína") {
      baseQuantity = goal === "gain-muscle" ? 1.2 : 1.0;
    } else if (food.category === "carbohidrato") {
      baseQuantity = goal === "lose-weight" ? 0.8 : 1.0;
    } else if (food.category === "verdura") {
      baseQuantity = 1.5;
    } else if (food.category === "grasa") {
      baseQuantity = goal === "lose-weight" ? 0.7 : 1.0;
    }

    if (mealType === "snack") {
      baseQuantity *= 0.5;
    }

    const quantity = baseQuantity;
    totalCalories += food.calories * quantity;
    totalProtein += food.protein * quantity;
    totalCarbs += food.carbs * quantity;
    totalFat += food.fat * quantity;

    mealEntries.push({
      foodId: food.id.toString(),
      quantity,
    });
  }

  return {
    userId,
    date: new Date(),
    mealType,
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    entries: mealEntries,
  };
}
