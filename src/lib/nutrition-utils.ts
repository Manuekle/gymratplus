import { prisma } from "@/lib/prisma";
import type { Food } from "@prisma/client";
import { foodsToCreate } from "@/data/food";
// Get or create foods in the database
export async function getOrCreateFoods(dietaryPreference = "no-preference") {
  // Check if foods already exist
  const count = await prisma.food.count();

  if (count > 0) {
    // If they exist, return all foods filtered by dietary preference
    const foods = await prisma.food.findMany();

    if (dietaryPreference === "vegetarian") {
      return foods.filter(
        (food) =>
          !food.name.toLowerCase().includes("pollo") &&
          !food.name.toLowerCase().includes("carne") &&
          !food.name.toLowerCase().includes("pescado") &&
          !food.name.toLowerCase().includes("salmón"),
      );
    } else if (dietaryPreference === "keto") {
      return foods.filter(
        (food) =>
          food.carbs < 10 ||
          food.category === "proteína" ||
          food.category === "grasa",
      );
    }

    return foods;
  }

  // Verificar si la tabla food está vacía
  const foodCount = await prisma.food.count();

  if (foodCount === 0) {
    const createdFoods = await prisma.$transaction(
      foodsToCreate.map((food) => prisma.food.create({ data: food })),
    );

    // Filtrar alimentos según la preferencia dietética
    if (dietaryPreference === "vegetarian") {
      return createdFoods.filter(
        (food) =>
          !food.name.toLowerCase().includes("pollo") &&
          !food.name.toLowerCase().includes("carne") &&
          !food.name.toLowerCase().includes("pescado") &&
          !food.name.toLowerCase().includes("salmón"),
      );
    } else if (dietaryPreference === "keto") {
      return createdFoods.filter(
        (food) =>
          food.carbs < 10 ||
          food.category === "proteína" ||
          food.category === "grasa",
      );
    }

    return createdFoods;
  } else {
    console.log(
      "La tabla food ya tiene registros. No se creó ningún nuevo alimento.",
    );
    return []; // O manejarlo según la lógica que necesites
  }
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
  entries: { foodId: number | string; quantity: number; food?: Food }[];
}

interface NutritionPlan {
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
  const { userId, goal, dietaryPreference } = profile; // Removed dailyCalorieTarget

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
    description: "Descripción",
    goal: "Objetivo",
    "lose-weight": "Perder peso",
    maintain: "Mantener",
    "gain-muscle": "Ganar músculo",
    dietaryPreference: "Preferencia alimentaria",
    vegetarian: "Vegetariano",
    keto: "Keto",
    "no-preference": "Sin preferencia",
    dailyCalorieTarget: "Objetivo diario de calorías",
    dailyProteinTarget: "Objetivo diario de proteínas",
    dailyCarbTarget: "Objetivo diario de carbohidratos",
    dailyFatTarget: "Objetivo diario de grasas",
    macros: "Macronutrientes",
    protein: "Proteína",
    carbs: "Carbohidratos",
    fat: "Grasas",
    mealType: "Tipo de comida",
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
    snacks: "Meriendas",
    calories: "Calorías",
    entries: "Entradas",
    quantity: "Cantidad",
    food: "Alimento",
    userId: "ID de usuario",
    date: "Fecha",
    mealLog: "Registro de comidas",
    nutritionPlan: "Plan de nutrición",
    calorieTarget: "Objetivo calórico",
  };

  const translate = (key: string) => {
    return translationDictionary[key] ?? key;
  };

  // const foodRecommendation = await prisma.foodRecommendation.create({
  //   data: {
  //     userId: session.user.id,
  //     macros,
  //     meals,
  //     calorieTarget,
  //   },
  // });Tu plan

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

async function createMealLog(
  userId: string,
  mealType: string,
  foods: Food[],
  goal: string,
  dietaryPreference: string = "no-preference",
) {
  // Select appropriate foods based on meal type and dietary preference
  let selectedFoods: Food[] = [];
  
  // Helper function to safely get food items with explicit type guard
  const getSafeFoods = (foods: Food[] | undefined, index: number = 0): Food[] => {
    if (!foods || !Array.isArray(foods) || foods.length <= index) {
      return [];
    }
    const food = foods[index];
    // Explicit type guard to ensure we only return valid Food objects
    if (food && 
        typeof food === 'object' && 
        'id' in food && 
        'name' in food && 
        'calories' in food && 
        'protein' in food && 
        'carbs' in food && 
        'fat' in food) {
      return [food as Food];
    }
    return [];
  };

  // Meal-specific food selection logic
  if (mealType === "breakfast") {
    // Filter appropriate breakfast foods
    const proteinFoods = foods.filter(
      (f) =>
        f.category === "proteína" &&
        (f.name === "Huevos" || f.name === "Yogur griego"),
    );

    const carbFoods = foods.filter(
      (f) =>
        f.category === "carbohidrato" &&
        (f.name === "Avena" || f.name === "Pan integral"),
    );

    const fruitFoods = foods.filter((f) => f.category === "fruta");

    const fatFoods = foods.filter(
      (f) =>
        f.category === "grasa" &&
        (f.name === "Aguacate" || f.name === "Almendras"),
    );

      // Select foods based on dietary preference
    if (dietaryPreference === "keto") {
      const safeProteinFoods = getSafeFoods(proteinFoods);
      const safeFatFoods = getSafeFoods(fatFoods);
      const additionalFat = fatFoods.length > 1 ? getSafeFoods(fatFoods, 1) : [];
      
      selectedFoods = [
        ...safeProteinFoods,
        ...safeFatFoods,
        ...additionalFat
      ].filter((food): food is Food => food !== undefined && food !== null) as Food[];
    } else {
      const safeProteinFoods = getSafeFoods(proteinFoods);
      const safeCarbFoods = getSafeFoods(carbFoods);
      const safeFruitFoods = getSafeFoods(fruitFoods);
      const safeFatFoods = getSafeFoods(fatFoods);
      
      selectedFoods = [
        ...safeProteinFoods,
        ...safeCarbFoods,
        ...safeFruitFoods,
        ...safeFatFoods
      ].filter((food): food is Food => food !== undefined && food !== null) as Food[];
    }
  } else if (mealType === "lunch") {
    // Filter appropriate lunch foods
    const proteinFoods = foods.filter((f) => f.category === "proteína");

    const carbFoods = foods.filter(
      (f) => f.category === "carbohidrato" && f.name !== "Avena",
    );

    const vegFoods = foods.filter((f) => f.category === "verdura");

    const fatFoods = foods.filter(
      (f) => f.category === "grasa" && f.name === "Aceite de oliva",
    );

    // Select foods based on dietary preference
    if (dietaryPreference === "keto") {
      const safeProteinFoods = getSafeFoods(proteinFoods);
      const safeVegFoods = getSafeFoods(vegFoods);
      const safeFatFoods = getSafeFoods(fatFoods);
      const additionalVeg = vegFoods.length > 1 ? getSafeFoods(vegFoods, 1) : [];
      
      selectedFoods = [
        ...safeProteinFoods,
        ...safeVegFoods,
        ...additionalVeg,
        ...safeFatFoods
      ].filter((food): food is Food => food !== undefined && food !== null) as Food[];
    } else {
      const safeProteinFoods = getSafeFoods(proteinFoods);
      const safeCarbFoods = getSafeFoods(carbFoods);
      const safeVegFoods = getSafeFoods(vegFoods);
      const additionalVeg = vegFoods.length > 1 ? getSafeFoods(vegFoods, 1) : [];
      const safeFatFoods = getSafeFoods(fatFoods);
      
      selectedFoods = [
        ...safeProteinFoods,
        ...safeCarbFoods,
        ...safeVegFoods,
        ...additionalVeg,
        ...safeFatFoods
      ].filter((food): food is Food => food !== undefined && food !== null) as Food[];
    }
  } else if (mealType === "dinner") {
    // Filter appropriate dinner foods
    const proteinFoods = foods.filter((f) => f.category === "proteína");
    const vegFoods = foods.filter((f) => f.category === "verdura");
    const fatFoods = foods.filter((f) => f.category === "grasa");

    // Only include carbs if not on keto diet
    const carbFoods =
      dietaryPreference === "keto"
        ? []
        : foods.filter(
            (f) => f.category === "carbohidrato" && f.name !== "Avena",
          );

    // Select foods based on dietary preference
    const safeProteinFoods = proteinFoods.length > 1 ? getSafeFoods(proteinFoods, 1) : getSafeFoods(proteinFoods);
    const safeCarbFoods = getSafeFoods(carbFoods);
    const safeVegFoods = getSafeFoods(vegFoods);
    const additionalVeg = vegFoods.length > 1 ? getSafeFoods(vegFoods, 1) : [];
    const safeFatFoods = getSafeFoods(fatFoods);
    
    selectedFoods = [
      ...safeProteinFoods,
      ...safeCarbFoods,
      ...safeVegFoods,
      ...additionalVeg,
      ...safeFatFoods
    ].filter((food): food is Food => food !== undefined && food !== null) as Food[];
  } else if (mealType === "snack") {
    // Filter appropriate snack foods
    const proteinFoods = foods.filter(
      (f) =>
        f.category === "proteína" &&
        (f.name === "Yogur griego" || f.name === "Huevos"),
    );

    const fruitFoods =
      dietaryPreference === "keto"
        ? []
        : foods.filter((f) => f.category === "fruta");

    const nutFoods = foods.filter(
      (f) =>
        f.category === "grasa" &&
        (f.name === "Almendras" || f.name === "Semillas de chía"),
    );

    // Select foods based on dietary preference
    const safeProteinFoods = getSafeFoods(proteinFoods);
    const safeFruitFoods = getSafeFoods(fruitFoods);
    const safeNutFoods = getSafeFoods(nutFoods);
    
    selectedFoods = [
      ...safeProteinFoods,
      ...safeFruitFoods,
      ...safeNutFoods
    ].filter((food): food is Food => food !== undefined && food !== null) as Food[];
  }

  // Calculate macros and create meal entries
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  const mealEntries = [];

  for (const food of selectedFoods) {
    // Adjust quantity based on food category and goal
    let baseQuantity = 1.0;

    if (food.category === "proteína") {
      baseQuantity = goal === "gain-muscle" ? 1.2 : 1.0;
    } else if (food.category === "carbohidrato") {
      baseQuantity = goal === "lose-weight" ? 0.8 : 1.0;
    } else if (food.category === "verdura") {
      baseQuantity = 1.5; // Always encourage vegetables
    } else if (food.category === "grasa") {
      baseQuantity = goal === "lose-weight" ? 0.7 : 1.0;
    }

    // Adjust for meal type
    if (mealType === "snack") {
      baseQuantity *= 0.5; // Smaller portions for snacks
    }

    // Calculate nutrition values for this food
    const quantity = baseQuantity;
    totalCalories += food.calories * quantity;
    totalProtein += food.protein * quantity;
    totalCarbs += food.carbs * quantity;
    totalFat += food.fat * quantity;

    // Add to meal entries
    mealEntries.push({
      foodId: food.id,
      quantity,
    });
  }

  // Create the meal log in the database
  // const mealLog = await prisma.mealLog.create({
  //   data: {
  //     userId,
  //     date: new Date(),
  //     mealType,
  //     calories: Math.round(totalCalories),
  //     protein: Math.round(totalProtein * 10) / 10,
  //     carbs: Math.round(totalCarbs * 10) / 10,
  //     fat: Math.round(totalFat * 10) / 10,
  //     entries: {
  //       create: mealEntries,
  //     },
  //   },
  //   include: {
  //     entries: {
  //       include: {
  //         food: true,
  //       },
  //     },
  //   },
  // });

  const mealLog = {
    userId,
    date: new Date(),
    mealType,
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    entries: mealEntries,
  };

  return mealLog;
}
