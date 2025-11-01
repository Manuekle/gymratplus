import { prisma } from "@/lib/database/prisma";
import type { Food } from "@prisma/client";
import { foodsToCreate } from "@/data/food";

// Helper function to map English categories to functional meal categories
function isProteinCategory(category: string): boolean {
  return ["meat", "fish", "eggs", "dairy", "legumes", "plant_protein"].includes(
    category,
  );
}

function isCarbCategory(category: string): boolean {
  return ["cereals", "pasta", "rice", "bars"].includes(category);
}

function isVegetableCategory(category: string): boolean {
  return ["vegetables"].includes(category);
}

function isFruitCategory(category: string): boolean {
  return ["fruits"].includes(category);
}

function isFatCategory(category: string): boolean {
  return ["nuts", "seeds", "oils"].includes(category);
}

// Get or create foods in the database
export async function getOrCreateFoods(dietaryPreference = "no-preference") {
  // Check if foods already exist
  const count = await prisma.food.count();

  if (count === 0) {
    // Create foods if they don't exist
    const createdFoods = await prisma.$transaction(
      foodsToCreate.map((food) => prisma.food.create({ data: food })),
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
  dietaryPreference: string,
): Food[] {
  if (dietaryPreference === "vegetarian") {
    return foods.filter(
      (food) =>
        !food.name.toLowerCase().includes("pollo") &&
        !food.name.toLowerCase().includes("chicken") &&
        !food.name.toLowerCase().includes("carne") &&
        !food.name.toLowerCase().includes("meat") &&
        !food.name.toLowerCase().includes("pescado") &&
        !food.name.toLowerCase().includes("fish") &&
        !food.name.toLowerCase().includes("salmón") &&
        !food.name.toLowerCase().includes("salmon") &&
        food.category !== "meat" &&
        food.category !== "fish",
    );
  } else if (dietaryPreference === "keto") {
    return foods.filter(
      (food) =>
        food.carbs < 10 ||
        isProteinCategory(food.category) ||
        isFatCategory(food.category) ||
        isVegetableCategory(food.category),
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
  profile: NutritionProfile,
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
    dietaryPreference,
  );

  const lunch: MealLog = await createMealLog(
    userId,
    "lunch",
    foods,
    goal,
    dietaryPreference,
  );

  const dinner: MealLog = await createMealLog(
    userId,
    "dinner",
    foods,
    goal,
    dietaryPreference,
  );

  const snacks: MealLog = await createMealLog(
    userId,
    "snack",
    foods,
    goal,
    dietaryPreference,
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
          100,
      )}%)`,
      carbs: `${profile.dailyCarbTarget ?? 0}g (${Math.round(
        (((profile.dailyCarbTarget ?? 0) * 4) /
          (profile.dailyCalorieTarget ?? 2000)) *
          100,
      )}%)`,
      fat: `${profile.dailyFatTarget ?? 0}g (${Math.round(
        (((profile.dailyFatTarget ?? 0) * 9) /
          (profile.dailyCalorieTarget ?? 2000)) *
          100,
      )}%)`,
      description: `Basado en tu objetivo de ${translate(
        goal,
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

// Helper to find foods by name pattern (case-insensitive, partial match)
function findFoodsByNamePattern(foods: Food[], patterns: string[]): Food[] {
  return foods.filter((f) =>
    patterns.some((pattern) =>
      f.name.toLowerCase().includes(pattern.toLowerCase()),
    ),
  );
}

async function createMealLog(
  userId: string,
  mealType: string,
  foods: Food[],
  goal: string,
  dietaryPreference: string = "no-preference",
): Promise<MealLog> {
  // Select appropriate foods based on meal type and dietary preference
  let selectedFoods: Food[] = [];

  // Helper function to safely get food items
  const getSafeFoods = (
    foods: Food[],
    count: number = 1,
    startIndex: number = 0,
  ): Food[] => {
    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      return [];
    }
    const safeFoods: Food[] = [];
    for (
      let i = startIndex;
      i < Math.min(startIndex + count, foods.length);
      i++
    ) {
      const food = foods[i];
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
        safeFoods.push(food as Food);
      }
    }
    return safeFoods;
  };

  // Meal-specific food selection logic using English categories
  if (mealType === "breakfast") {
    // Protein foods: eggs, dairy (yogurt, cottage cheese)
    const proteinFoods = foods.filter(
      (f) =>
        isProteinCategory(f.category) &&
        (f.category === "eggs" ||
          f.category === "dairy" ||
          f.name.toLowerCase().includes("huevo") ||
          f.name.toLowerCase().includes("egg") ||
          f.name.toLowerCase().includes("yogur") ||
          f.name.toLowerCase().includes("yogurt") ||
          f.name.toLowerCase().includes("cottage")),
    );

    // Carb foods: cereals (oatmeal, bread)
    const carbFoods = foods.filter(
      (f) =>
        isCarbCategory(f.category) &&
        (f.name.toLowerCase().includes("avena") ||
          f.name.toLowerCase().includes("oat") ||
          f.name.toLowerCase().includes("pan") ||
          f.name.toLowerCase().includes("bread")),
    );

    // Fruits
    const fruitFoods = foods.filter((f) => isFruitCategory(f.category));

    // Fats: nuts, avocado
    const fatFoods = foods.filter(
      (f) =>
        isFatCategory(f.category) &&
        (f.name.toLowerCase().includes("aguacate") ||
          f.name.toLowerCase().includes("avocado") ||
          f.name.toLowerCase().includes("almendra") ||
          f.name.toLowerCase().includes("almond")),
    );

    if (dietaryPreference === "keto") {
      selectedFoods = [
        ...getSafeFoods(proteinFoods, 2),
        ...getSafeFoods(fatFoods, 2),
      ].filter((food): food is Food => food !== undefined && food !== null);

      // Fallback: if still empty, get any protein and fat foods
      if (selectedFoods.length === 0) {
        const anyProtein = foods.filter((f) => isProteinCategory(f.category));
        const anyFat = foods.filter((f) => isFatCategory(f.category));
        selectedFoods = [
          ...getSafeFoods(anyProtein, 2),
          ...getSafeFoods(anyFat, 2),
        ];
      }
    } else {
      selectedFoods = [
        ...getSafeFoods(proteinFoods, 1),
        ...getSafeFoods(carbFoods, 1),
        ...getSafeFoods(fruitFoods, 1),
        ...getSafeFoods(fatFoods, 1),
      ].filter((food): food is Food => food !== undefined && food !== null);

      // Fallback: if still empty, get foods by category
      if (selectedFoods.length === 0) {
        const anyProtein = foods.filter((f) => isProteinCategory(f.category));
        const anyCarb = foods.filter((f) => isCarbCategory(f.category));
        const anyFruit = foods.filter((f) => isFruitCategory(f.category));
        const anyFat = foods.filter((f) => isFatCategory(f.category));
        selectedFoods = [
          ...getSafeFoods(anyProtein, 1),
          ...getSafeFoods(anyCarb, 1),
          ...getSafeFoods(anyFruit, 1),
          ...getSafeFoods(anyFat, 1),
        ];
      }
    }
  } else if (mealType === "lunch") {
    // Protein: meat, fish, legumes
    const proteinFoods = foods.filter((f) => isProteinCategory(f.category));
    // Carbs: rice, pasta, excluding oatmeal
    const carbFoods = foods.filter(
      (f) =>
        isCarbCategory(f.category) &&
        !f.name.toLowerCase().includes("avena") &&
        !f.name.toLowerCase().includes("oat"),
    );
    // Vegetables
    const vegFoods = foods.filter((f) => isVegetableCategory(f.category));
    // Fats: oils
    const fatFoods = foods.filter(
      (f) =>
        isFatCategory(f.category) &&
        (f.name.toLowerCase().includes("aceite") ||
          f.name.toLowerCase().includes("oil") ||
          f.category === "oils"),
    );

    if (dietaryPreference === "keto") {
      selectedFoods = [
        ...getSafeFoods(proteinFoods, 1),
        ...getSafeFoods(vegFoods, 2),
        ...getSafeFoods(fatFoods, 1),
      ].filter((food): food is Food => food !== undefined && food !== null);

      // Fallback
      if (selectedFoods.length === 0) {
        const anyProtein = foods.filter((f) => isProteinCategory(f.category));
        const anyVeg = foods.filter((f) => isVegetableCategory(f.category));
        const anyFat = foods.filter((f) => isFatCategory(f.category));
        selectedFoods = [
          ...getSafeFoods(anyProtein, 1),
          ...getSafeFoods(anyVeg, 2),
          ...getSafeFoods(anyFat, 1),
        ];
      }
    } else {
      selectedFoods = [
        ...getSafeFoods(proteinFoods, 1),
        ...getSafeFoods(carbFoods, 1),
        ...getSafeFoods(vegFoods, 2),
        ...getSafeFoods(fatFoods, 1),
      ].filter((food): food is Food => food !== undefined && food !== null);

      // Fallback
      if (selectedFoods.length === 0) {
        const anyProtein = foods.filter((f) => isProteinCategory(f.category));
        const anyCarb = foods.filter((f) => isCarbCategory(f.category));
        const anyVeg = foods.filter((f) => isVegetableCategory(f.category));
        const anyFat = foods.filter((f) => isFatCategory(f.category));
        selectedFoods = [
          ...getSafeFoods(anyProtein, 1),
          ...getSafeFoods(anyCarb, 1),
          ...getSafeFoods(anyVeg, 2),
          ...getSafeFoods(anyFat, 1),
        ];
      }
    }
  } else if (mealType === "dinner") {
    // Protein: meat, fish, legumes
    const proteinFoods = foods.filter((f) => isProteinCategory(f.category));
    // Vegetables
    const vegFoods = foods.filter((f) => isVegetableCategory(f.category));
    // Fats: oils
    const fatFoods = foods.filter((f) => isFatCategory(f.category));
    // Carbs (only if not keto)
    const carbFoods =
      dietaryPreference === "keto"
        ? []
        : foods.filter(
            (f) =>
              isCarbCategory(f.category) &&
              !f.name.toLowerCase().includes("avena") &&
              !f.name.toLowerCase().includes("oat"),
          );

    selectedFoods = [
      ...getSafeFoods(proteinFoods, 1, 1), // Skip first protein (use different from lunch)
      ...getSafeFoods(carbFoods, 1),
      ...getSafeFoods(vegFoods, 2),
      ...getSafeFoods(fatFoods, 1),
    ].filter((food): food is Food => food !== undefined && food !== null);

    // Fallback
    if (selectedFoods.length === 0) {
      const anyProtein = foods.filter((f) => isProteinCategory(f.category));
      const anyCarb = foods.filter((f) => isCarbCategory(f.category));
      const anyVeg = foods.filter((f) => isVegetableCategory(f.category));
      const anyFat = foods.filter((f) => isFatCategory(f.category));
      selectedFoods = [
        ...getSafeFoods(anyProtein, 1, 1),
        ...getSafeFoods(anyCarb, 1),
        ...getSafeFoods(anyVeg, 2),
        ...getSafeFoods(anyFat, 1),
      ];
    }
  } else if (mealType === "snack") {
    // Protein: dairy (yogurt), eggs
    const proteinFoods = foods.filter(
      (f) =>
        isProteinCategory(f.category) &&
        (f.category === "eggs" ||
          f.category === "dairy" ||
          f.name.toLowerCase().includes("yogur") ||
          f.name.toLowerCase().includes("yogurt") ||
          f.name.toLowerCase().includes("huevo") ||
          f.name.toLowerCase().includes("egg")),
    );
    // Fruits (not for keto)
    const fruitFoods =
      dietaryPreference === "keto"
        ? []
        : foods.filter((f) => isFruitCategory(f.category));
    // Nuts and seeds
    const nutFoods = foods.filter(
      (f) =>
        isFatCategory(f.category) &&
        (f.name.toLowerCase().includes("almendra") ||
          f.name.toLowerCase().includes("almond") ||
          f.name.toLowerCase().includes("chía") ||
          f.name.toLowerCase().includes("chia") ||
          f.category === "nuts" ||
          f.category === "seeds"),
    );

    selectedFoods = [
      ...getSafeFoods(proteinFoods, 1),
      ...getSafeFoods(fruitFoods, 1),
      ...getSafeFoods(nutFoods, 1),
    ].filter((food): food is Food => food !== undefined && food !== null);

    // Fallback
    if (selectedFoods.length === 0) {
      const anyProtein = foods.filter((f) => isProteinCategory(f.category));
      const anyFruit = foods.filter((f) => isFruitCategory(f.category));
      const anyNuts = foods.filter((f) => isFatCategory(f.category));
      selectedFoods = [
        ...getSafeFoods(anyProtein, 1),
        ...getSafeFoods(anyFruit, 1),
        ...getSafeFoods(anyNuts, 1),
      ];
    }
  }

  // Calculate macros and create meal entries
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  const mealEntries: { foodId: string; quantity: number }[] = [];

  // If no foods selected, return empty meal log
  if (selectedFoods.length === 0) {
    console.warn(`No foods found for meal type: ${mealType}`);
    return {
      userId,
      date: new Date(),
      mealType,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      entries: [],
    };
  }

  for (const food of selectedFoods) {
    // Base quantity in servings (not grams)
    let baseQuantity = 1.0;

    // Adjust quantity based on food category and goal
    if (isProteinCategory(food.category)) {
      baseQuantity = goal === "gain-muscle" ? 1.2 : 1.0;
    } else if (isCarbCategory(food.category)) {
      baseQuantity = goal === "lose-weight" ? 0.8 : 1.0;
    } else if (isVegetableCategory(food.category)) {
      baseQuantity = 1.5;
    } else if (isFatCategory(food.category)) {
      baseQuantity = goal === "lose-weight" ? 0.7 : 1.0;
    }

    // Reduce quantity for snacks
    if (mealType === "snack") {
      baseQuantity *= 0.5;
    }

    // Convert to grams based on serving size
    // quantity is in servings, we need to convert to ratio for calculation
    // servings are typically per 100g, so we use baseQuantity as multiplier
    const quantityInGrams = (food.serving || 100) * baseQuantity;
    const quantityRatio = quantityInGrams / 100; // Ratio for macro calculations

    totalCalories += food.calories * quantityRatio;
    totalProtein += food.protein * quantityRatio;
    totalCarbs += food.carbs * quantityRatio;
    totalFat += food.fat * quantityRatio;

    mealEntries.push({
      foodId: food.id.toString(),
      quantity: quantityRatio, // Store as ratio (1.0 = 100g serving)
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
