import { prisma } from "@/lib/prisma";

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

  // If they don't exist, create basic foods
  const foodsToCreate = [
    // Proteins
    {
      name: "Pechuga de pollo",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      serving: 100,
      category: "proteína",
    },
    {
      name: "Huevos",
      calories: 155,
      protein: 13,
      carbs: 1.1,
      fat: 11,
      fiber: 0,
      sugar: 1.1,
      serving: 100,
      category: "proteína",
    },
    {
      name: "Atún en agua",
      calories: 116,
      protein: 25.5,
      carbs: 0,
      fat: 1,
      fiber: 0,
      sugar: 0,
      serving: 100,
      category: "proteína",
    },
    {
      name: "Yogur griego",
      calories: 97,
      protein: 10,
      carbs: 3.6,
      fat: 5,
      fiber: 0,
      sugar: 3.6,
      serving: 100,
      category: "proteína",
    },
    {
      name: "Salmón",
      calories: 208,
      protein: 20,
      carbs: 0,
      fat: 13,
      fiber: 0,
      sugar: 0,
      serving: 100,
      category: "proteína",
    },

    // Carbs
    {
      name: "Arroz integral",
      calories: 112,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      fiber: 1.8,
      sugar: 0.4,
      serving: 100,
      category: "carbohidrato",
    },
    {
      name: "Avena",
      calories: 389,
      protein: 16.9,
      carbs: 66.3,
      fat: 6.9,
      fiber: 10.6,
      sugar: 0,
      serving: 100,
      category: "carbohidrato",
    },
    {
      name: "Batata",
      calories: 86,
      protein: 1.6,
      carbs: 20.1,
      fat: 0.1,
      fiber: 3,
      sugar: 4.2,
      serving: 100,
      category: "carbohidrato",
    },
    {
      name: "Pan integral",
      calories: 247,
      protein: 13,
      carbs: 41,
      fat: 3.5,
      fiber: 7,
      sugar: 5.7,
      serving: 100,
      category: "carbohidrato",
    },
    {
      name: "Quinoa",
      calories: 120,
      protein: 4.4,
      carbs: 21.3,
      fat: 1.9,
      fiber: 2.8,
      sugar: 0.9,
      serving: 100,
      category: "carbohidrato",
    },

    // Vegetables
    {
      name: "Brócoli",
      calories: 34,
      protein: 2.8,
      carbs: 6.6,
      fat: 0.4,
      fiber: 2.6,
      sugar: 1.7,
      serving: 100,
      category: "verdura",
    },
    {
      name: "Espinaca",
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2,
      sugar: 0.4,
      serving: 100,
      category: "verdura",
    },
    {
      name: "Zanahoria",
      calories: 41,
      protein: 0.9,
      carbs: 9.6,
      fat: 0.2,
      fiber: 2.8,
      sugar: 4.7,
      serving: 100,
      category: "verdura",
    },
    {
      name: "Pimiento",
      calories: 20,
      protein: 0.9,
      carbs: 4.6,
      fat: 0.2,
      fiber: 1.7,
      sugar: 2.4,
      serving: 100,
      category: "verdura",
    },

    // Fruits
    {
      name: "Plátano",
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3,
      fiber: 2.6,
      sugar: 12.2,
      serving: 100,
      category: "fruta",
    },
    {
      name: "Manzana",
      calories: 52,
      protein: 0.3,
      carbs: 13.8,
      fat: 0.2,
      fiber: 2.4,
      sugar: 10.4,
      serving: 100,
      category: "fruta",
    },
    {
      name: "Fresas",
      calories: 32,
      protein: 0.7,
      carbs: 7.7,
      fat: 0.3,
      fiber: 2,
      sugar: 4.9,
      serving: 100,
      category: "fruta",
    },
    {
      name: "Arándanos",
      calories: 57,
      protein: 0.7,
      carbs: 14.5,
      fat: 0.3,
      fiber: 2.4,
      sugar: 10,
      serving: 100,
      category: "fruta",
    },

    // Fats
    {
      name: "Aguacate",
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      fiber: 6.7,
      sugar: 0.7,
      serving: 100,
      category: "grasa",
    },
    {
      name: "Aceite de oliva",
      calories: 884,
      protein: 0,
      carbs: 0,
      fat: 100,
      fiber: 0,
      sugar: 0,
      serving: 100,
      category: "grasa",
    },
    {
      name: "Almendras",
      calories: 579,
      protein: 21.2,
      carbs: 21.7,
      fat: 49.9,
      fiber: 12.5,
      sugar: 4.4,
      serving: 100,
      category: "grasa",
    },
    {
      name: "Semillas de chía",
      calories: 486,
      protein: 16.5,
      carbs: 42.1,
      fat: 30.7,
      fiber: 34.4,
      sugar: 0,
      serving: 100,
      category: "grasa",
    },
  ];

  // Create all foods in the database
  const createdFoods = await prisma.$transaction(
    foodsToCreate.map((food) => prisma.food.create({ data: food }))
  );

  // Filter foods based on dietary preference
  if (dietaryPreference === "vegetarian") {
    return createdFoods.filter(
      (food) =>
        !food.name.toLowerCase().includes("pollo") &&
        !food.name.toLowerCase().includes("carne") &&
        !food.name.toLowerCase().includes("pescado") &&
        !food.name.toLowerCase().includes("salmón")
    );
  } else if (dietaryPreference === "keto") {
    return createdFoods.filter(
      (food) =>
        food.carbs < 10 ||
        food.category === "proteína" ||
        food.category === "grasa"
    );
  }

  return createdFoods;
}

// Create a nutrition plan based on user profile
export async function createNutritionPlan(profile) {
  const { userId, goal, dietaryPreference, gender, dailyCalorieTarget } =
    profile;

  // Get foods from database or create new ones if they don't exist
  const foods = await getOrCreateFoods(dietaryPreference);

  // Generate meal plans for each meal type
  const breakfast = await createMealLog(
    userId,
    "breakfast",
    foods,
    goal,
    dietaryPreference,
    dailyCalorieTarget
  );

  const lunch = await createMealLog(
    userId,
    "lunch",
    foods,
    goal,
    dietaryPreference,
    dailyCalorieTarget
  );

  const dinner = await createMealLog(
    userId,
    "dinner",
    foods,
    goal,
    dietaryPreference,
    dailyCalorieTarget
  );

  const snacks = await createMealLog(
    userId,
    "snack",
    foods,
    goal,
    dietaryPreference,
    dailyCalorieTarget
  );

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
      description: `Based on your ${getGoalText(
        goal
      )} goal and a daily target of ${
        profile.dailyCalorieTarget ?? 2000
      } calories`,
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

// Create a meal log for a specific meal type
async function createMealLog(
  userId,
  mealType,
  foods,
  goal,
  dietaryPreference = "no-preference",
  dailyCalorieTarget = 2000
) {
  // Select appropriate foods based on meal type and dietary preference
  let selectedFoods = [];

  // Meal-specific food selection logic
  if (mealType === "breakfast") {
    // Filter appropriate breakfast foods
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

    // Select foods based on dietary preference
    if (dietaryPreference === "keto") {
      selectedFoods = [
        proteinFoods[0],
        fatFoods[0],
        fatFoods[1] || fatFoods[0],
      ].filter(Boolean);
    } else {
      selectedFoods = [
        proteinFoods[0],
        carbFoods[0],
        fruitFoods[0],
        fatFoods[0],
      ].filter(Boolean);
    }
  } else if (mealType === "lunch") {
    // Filter appropriate lunch foods
    const proteinFoods = foods.filter((f) => f.category === "proteína");

    const carbFoods = foods.filter(
      (f) => f.category === "carbohidrato" && f.name !== "Avena"
    );

    const vegFoods = foods.filter((f) => f.category === "verdura");

    const fatFoods = foods.filter(
      (f) => f.category === "grasa" && f.name === "Aceite de oliva"
    );

    // Select foods based on dietary preference
    if (dietaryPreference === "keto") {
      selectedFoods = [
        proteinFoods[0],
        vegFoods[0],
        vegFoods[1] || vegFoods[0],
        fatFoods[0],
      ].filter(Boolean);
    } else {
      selectedFoods = [
        proteinFoods[0],
        carbFoods[0],
        vegFoods[0],
        vegFoods[1] || vegFoods[0],
        fatFoods[0],
      ].filter(Boolean);
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
            (f) => f.category === "carbohidrato" && f.name !== "Avena"
          );

    // Select foods based on dietary preference
    selectedFoods = [
      proteinFoods[1] || proteinFoods[0],
      ...carbFoods.slice(0, 1),
      vegFoods[0],
      vegFoods[1] || vegFoods[0],
      fatFoods[0],
    ].filter(Boolean);
  } else if (mealType === "snack") {
    // Filter appropriate snack foods
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

    // Select foods based on dietary preference
    selectedFoods = [
      proteinFoods[0],
      ...fruitFoods.slice(0, 1),
      nutFoods[0],
    ].filter(Boolean);
  }

  // Distribute calories according to meal type
  const mealCaloriePercentage = {
    breakfast: 0.25, // 25% of daily calories
    lunch: 0.35, // 35% of daily calories
    dinner: 0.3, // 30% of daily calories
    snack: 0.1, // 10% of daily calories
  };

  // Target calories for this meal
  const targetMealCalories =
    dailyCalorieTarget * mealCaloriePercentage[mealType];

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
  const mealLog = await prisma.mealLog.create({
    data: {
      userId,
      date: new Date(),
      mealType,
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      entries: {
        create: mealEntries,
      },
    },
    include: {
      entries: {
        include: {
          food: true,
        },
      },
    },
  });

  return mealLog;
}

// Helper function to get text representation of goal
function getGoalText(goal) {
  switch (goal) {
    case "lose-weight":
      return "weight loss";
    case "maintain":
      return "maintenance";
    case "gain-muscle":
      return "muscle gain";
    default:
      return goal;
  }
}
