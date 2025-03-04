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

    // Eliminar alimentos de origen animal para veganos
    if (dietaryPreference === "vegan") {
      foodsToCreate = foodsToCreate.filter(
        (food) =>
          ![
            "Pechuga de pollo",
            "Salmón",
            "Huevos",
            "Yogur griego",
            "Leche",
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

// Función para crear un registro de comida
export async function createMealLog(
  userId,
  mealType,
  foods,
  goal,
  dietaryPreference,
  dailyCalorieTarget = 2000
) {
  // Seleccionar alimentos apropiados según el tipo de comida y preferencia dietética
  let selectedFoods = [];

  // El resto de la lógica de selección de alimentos permanece igual
  if (mealType === "breakfast") {
    const proteinFoods = foods.filter(
      (f) =>
        f.category === "proteína" &&
        f.name !== "Pechuga de pollo" &&
        f.name !== "Salmón"
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

    selectedFoods = [
      proteinFoods[0],
      carbFoods[0],
      fruitFoods[0],
      fatFoods[0],
    ].filter(Boolean);
  } else if (mealType === "lunch") {
    const proteinFoods = foods.filter((f) => f.category === "proteína");
    const carbFoods = foods.filter(
      (f) => f.category === "carbohidrato" && f.name !== "Avena"
    );
    const vegFoods = foods.filter((f) => f.category === "verdura");
    const fatFoods = foods.filter(
      (f) => f.category === "grasa" && f.name === "Aceite de oliva"
    );

    selectedFoods = [
      proteinFoods[0],
      carbFoods[0],
      vegFoods[0],
      vegFoods[1],
      fatFoods[0],
    ].filter(Boolean);
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
      proteinFoods[1] || proteinFoods[0],
      ...carbFoods.slice(0, 1),
      vegFoods[0],
      vegFoods[1],
      fatFoods[0],
    ].filter(Boolean);
  } else if (mealType === "snack") {
    const proteinFoods = foods.filter(
      (f) =>
        f.category === "proteína" &&
        (f.name === "Yogur griego" || f.name === "Huevos")
    );
    const fruitFoods = foods.filter((f) => f.category === "fruta");
    const nutFoods = foods.filter(
      (f) => f.category === "grasa" && f.name === "Almendras"
    );

    selectedFoods = [proteinFoods[0], fruitFoods[0], nutFoods[0]].filter(
      Boolean
    );
  }

  // Ajustar cantidades según el objetivo y las calorías diarias objetivo
  const multiplier = 1;

  // Distribuir las calorías según el tipo de comida
  const mealCaloriePercentage = {
    breakfast: 0.25, // 25% de las calorías diarias
    lunch: 0.35, // 35% de las calorías diarias
    dinner: 0.3, // 30% de las calorías diarias
    snack: 0.1, // 10% de las calorías diarias
  };

  // Ajustar el multiplicador según las calorías objetivo para este tipo de comida
  const targetMealCalories =
    dailyCalorieTarget * mealCaloriePercentage[mealType];

  // Calcular macros totales
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  // Crear entradas de comida
  const mealEntries = [];

  for (const food of selectedFoods) {
    // Ajustar la cantidad según la categoría y las calorías objetivo
    const baseQuantity =
      food.category === "proteína"
        ? 1
        : food.category === "carbohidrato"
        ? 1
        : 0.5;

    // Ajustar según el objetivo
    let quantity = baseQuantity;
    if (goal === "lose-weight") quantity *= 0.8;
    if (goal === "gain-muscle") quantity *= 1.2;

    totalCalories += food.calories * quantity;
    totalProtein += food.protein * quantity;
    totalCarbs += food.carbs * quantity;
    totalFat += food.fat * quantity;

    mealEntries.push({
      foodId: food.id,
      quantity,
    });
  }

  // Crear el registro de comida
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
