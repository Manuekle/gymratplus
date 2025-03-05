import { prisma } from "@/lib/prisma";

// Función para obtener o crear alimentos en la base de datos
export async function getOrCreateFoods(dietaryPreference) {
  // Verificar si ya existen alimentos en la base de datos
  const count = await prisma.food.count();

  if (count > 0) {
    // Si ya existen, devolver todos los alimentos
    return prisma.food.findMany();
  }

  // Lista base de alimentos
  const baseFoods = [
    // Proteins
    {
      name: "Pechuga de pollo",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      category: "proteína",
      serving: 100,
    },
    {
      name: "Salmón",
      calories: 208,
      protein: 20,
      carbs: 0,
      fat: 13,
      category: "proteína",
      serving: 100,
    },
    {
      name: "Huevos",
      calories: 155,
      protein: 13,
      carbs: 1.1,
      fat: 11,
      category: "proteína",
      serving: 100,
    },
    {
      name: "Atún enlatado",
      calories: 132,
      protein: 28,
      carbs: 0,
      fat: 1.7,
      category: "proteína",
      serving: 100,
    },
    {
      name: "Pavo magro",
      calories: 104,
      protein: 21,
      carbs: 0,
      fat: 2.1,
      category: "proteína",
      serving: 100,
    },

    // Carbohydrates
    {
      name: "Arroz integral",
      calories: 112,
      protein: 2.6,
      carbs: 23,
      fat: 0.9,
      category: "carbohidrato",
      serving: 100,
    },
    {
      name: "Avena",
      calories: 389,
      protein: 16.9,
      carbs: 66.3,
      fat: 6.9,
      category: "carbohidrato",
      serving: 100,
    },
    {
      name: "Batata",
      calories: 86,
      protein: 1.6,
      carbs: 20.1,
      fat: 0.1,
      category: "carbohidrato",
      serving: 100,
    },
    {
      name: "Quinoa",
      calories: 120,
      protein: 4.4,
      carbs: 21.3,
      fat: 1.9,
      category: "carbohidrato",
      serving: 100,
    },
    {
      name: "Pan integral",
      calories: 247,
      protein: 13,
      carbs: 43,
      fat: 3.5,
      category: "carbohidrato",
      serving: 100,
    },

    // Vegetables
    {
      name: "Brócoli",
      calories: 34,
      protein: 2.8,
      carbs: 6.6,
      fat: 0.4,
      category: "verdura",
      serving: 100,
    },
    {
      name: "Espinacas",
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      category: "verdura",
      serving: 100,
    },
    {
      name: "Zanahoria",
      calories: 41,
      protein: 0.9,
      carbs: 9.6,
      fat: 0.2,
      category: "verdura",
      serving: 100,
    },
    {
      name: "Coliflor",
      calories: 25,
      protein: 1.9,
      carbs: 5,
      fat: 0.3,
      category: "verdura",
      serving: 100,
    },

    // Fruits
    {
      name: "Plátano",
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3,
      category: "fruta",
      serving: 100,
    },
    {
      name: "Frutos rojos",
      calories: 57,
      protein: 0.7,
      carbs: 14.5,
      fat: 0.3,
      category: "fruta",
      serving: 100,
    },
    {
      name: "Manzana",
      calories: 52,
      protein: 0.3,
      carbs: 14,
      fat: 0.2,
      category: "fruta",
      serving: 100,
    },

    // Fats
    {
      name: "Aguacate",
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      category: "grasa",
      serving: 100,
    },
    {
      name: "Aceite de oliva",
      calories: 884,
      protein: 0,
      carbs: 0,
      fat: 100,
      category: "grasa",
      serving: 100,
    },
    {
      name: "Almendras",
      calories: 579,
      protein: 21.2,
      carbs: 21.7,
      fat: 49.9,
      category: "grasa",
      serving: 100,
    },
    {
      name: "Semillas de chía",
      calories: 486,
      protein: 16.5,
      carbs: 42.1,
      fat: 30.7,
      category: "grasa",
      serving: 100,
    },

    // Dairy and Alternatives
    {
      name: "Yogur griego",
      calories: 97,
      protein: 9,
      carbs: 3.6,
      fat: 5,
      category: "lácteo",
      serving: 100,
    },
    {
      name: "Leche",
      calories: 42,
      protein: 3.4,
      carbs: 5,
      fat: 1,
      category: "lácteo",
      serving: 100,
    },
    {
      name: "Leche de almendra",
      calories: 13,
      protein: 0.4,
      carbs: 0.4,
      fat: 1.1,
      category: "lácteo",
      serving: 100,
    },
  ];

  // Alimentos vegetarianos/veganos
  const vegetarianFoods = [
    {
      name: "Tofu",
      calories: 144,
      protein: 17,
      carbs: 2.8,
      fat: 8.7,
      category: "proteína",
      serving: 100,
    },
    {
      name: "Tempeh",
      calories: 193,
      protein: 19,
      carbs: 9.4,
      fat: 11,
      category: "proteína",
      serving: 100,
    },
    {
      name: "Lentejas",
      calories: 116,
      protein: 9,
      carbs: 20,
      fat: 0.4,
      category: "proteína",
      serving: 100,
    },
    {
      name: "Garbanzos",
      calories: 164,
      protein: 8.9,
      carbs: 27.4,
      fat: 2.6,
      category: "proteína",
      serving: 100,
    },
    {
      name: "Quinoa",
      calories: 120,
      protein: 4.4,
      carbs: 21.3,
      fat: 1.9,
      category: "carbohidrato",
      serving: 100,
    },
  ];

  // Alimentos para dieta keto
  const ketoFoods = [
    {
      name: "Aguacate",
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      category: "grasa",
      serving: 100,
    },
    {
      name: "Aceite de coco",
      calories: 862,
      protein: 0,
      carbs: 0,
      fat: 100,
      category: "grasa",
      serving: 100,
    },
    {
      name: "Queso cheddar",
      calories: 402,
      protein: 25,
      carbs: 1.3,
      fat: 33,
      category: "grasa",
      serving: 100,
    },
    {
      name: "Tocino",
      calories: 541,
      protein: 37,
      carbs: 1.4,
      fat: 42,
      category: "proteína",
      serving: 100,
    },
    {
      name: "Mantequilla",
      calories: 717,
      protein: 0.9,
      carbs: 0.1,
      fat: 81,
      category: "grasa",
      serving: 100,
    },
  ];

  // Seleccionar los alimentos según la preferencia dietética
  let foodsToCreate = [...baseFoods];

  if (dietaryPreference === "vegetarian" || dietaryPreference === "vegan") {
    foodsToCreate = [...foodsToCreate, ...vegetarianFoods];

    if (dietaryPreference === "vegan") {
      foodsToCreate = foodsToCreate.filter(
        (food) =>
          ![
            "Pechuga de pollo",
            "Salmón",
            "Huevos",
            "Yogur griego",
            "Leche",
            "Queso cheddar",
            "Tocino",
            "Mantequilla",
          ].includes(food.name)
      );
    }
  } else if (dietaryPreference === "keto") {
    foodsToCreate = [...foodsToCreate, ...ketoFoods];
  }

  // Crear todos los alimentos en la base de datos
  return prisma.$transaction(
    foodsToCreate.map((food) => prisma.food.create({ data: food }))
  );
}

// Enhanced createMealLog function with more intelligent food selection
export async function createMealLog(
  userId,
  mealType,
  foods,
  goal,
  dietaryPreference,
  dailyCalorieTarget = 2000
) {
  let selectedFoods = [];

  // Advanced food selection with more intelligent categorization
  const foodCategories = {
    protein: foods.filter(
      (f) => f.category === "proteína" && f.protein / (f.calories / 100) > 0.25
    ),
    carbs: foods.filter(
      (f) => f.category === "carbohidrato" && f.carbs / (f.calories / 100) > 0.5
    ),
    vegetables: foods.filter(
      (f) => f.category === "verdura" && f.calories < 50
    ),
    fruits: foods.filter((f) => f.category === "fruta"),
    fats: foods.filter(
      (f) => f.category === "grasa" && f.fat / (f.calories / 100) > 0.6
    ),
    dairy: foods.filter((f) => f.category === "lácteo"),
  };

  // Meal type specific selection with more nuanced approach
  switch (mealType) {
    case "breakfast":
      selectedFoods = [
        foodCategories.protein[0],
        foodCategories.carbs[0],
        foodCategories.fruits[0],
        foodCategories.fats[0],
      ].filter(Boolean);
      break;

    case "lunch":
      selectedFoods = [
        foodCategories.protein[1] || foodCategories.protein[0],
        foodCategories.carbs[1] || foodCategories.carbs[0],
        foodCategories.vegetables[0],
        foodCategories.vegetables[1],
        foodCategories.fats[1] || foodCategories.fats[0],
      ].filter(Boolean);
      break;

    case "dinner":
      selectedFoods = [
        foodCategories.protein[2] || foodCategories.protein[0],
        ...(dietaryPreference !== "keto"
          ? [foodCategories.carbs[2] || foodCategories.carbs[0]]
          : []),
        foodCategories.vegetables[2] || foodCategories.vegetables[0],
        foodCategories.vegetables[3] || foodCategories.vegetables[1],
        foodCategories.fats[2] || foodCategories.fats[0],
      ].filter(Boolean);
      break;

    case "snack":
      selectedFoods = [
        foodCategories.dairy[0],
        foodCategories.fruits[1],
        foodCategories.fats.find((f) => f.name === "Almendras"),
      ].filter(Boolean);
      break;
  }

  // Calorie and macro distribution logic
  const mealCaloriePercentage = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.3,
    snack: 0.1,
  };

  const targetMealCalories =
    dailyCalorieTarget * mealCaloriePercentage[mealType];

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  const mealEntries = [];

  // Dynamic portion sizing based on goal and target calories
  for (const food of selectedFoods) {
    let quantity = 1; // Base quantity

    // Goal-based quantity adjustment
    if (goal === "lose-weight") quantity *= 0.8;
    if (goal === "gain-muscle") quantity *= 1.2;

    // Dynamic scaling to hit target calories
    const foodCalories = food.calories * quantity;
    const calorieRatio = targetMealCalories / (totalCalories + foodCalories);

    if (calorieRatio > 1.2 || totalCalories === 0) {
      quantity *= calorieRatio > 1.2 ? 1.2 : 1;

      totalCalories += food.calories * quantity;
      totalProtein += food.protein * quantity;
      totalCarbs += food.carbs * quantity;
      totalFat += food.fat * quantity;

      mealEntries.push({
        foodId: food.id,
        quantity,
      });
    }
  }

  // Create meal log with precise macro tracking
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
