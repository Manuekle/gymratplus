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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const { isFavorite, ...foodData } of foodsToCreate) {
      const mealType = getMealTypesForCategory(foodData.category);
      await prisma.food.create({
        data: {
          ...foodData,
          mealType,
          userId: null, // Base foods from the system
        },
      });
    }
  }

  // Get all foods
  let foods = await prisma.food.findMany({
    where: { userId: null },
  });

  // Filter by dietary preference if needed
  if (dietaryPreference === "vegetarian") {
    foods = foods.filter(
      (f) =>
        !["meat", "fish"].includes(f.category) &&
        f.name !== "Gelatina" &&
        f.name !== "Caldo de pollo",
    );
  } else if (dietaryPreference === "vegan") {
    foods = foods.filter(
      (f) =>
        !["meat", "fish", "eggs", "dairy"].includes(f.category) &&
        f.name !== "Gelatina" &&
        f.name !== "Caldo de pollo" &&
        f.name !== "Mantequilla" &&
        f.name !== "Ghee (mantequilla clarificada)" &&
        f.name !== "Yema de huevo",
    );
  } else if (dietaryPreference === "keto") {
    foods = foods.filter((f) => f.carbs <= 5);
  }

  return foods;
}

function getMealTypesForCategory(category: string): string[] {
  const mealTypeMap: Record<string, string[]> = {
    meat: ["lunch", "dinner"],
    fish: ["lunch", "dinner"],
    eggs: ["breakfast", "lunch", "dinner"],
    dairy: ["breakfast", "snack"],
    legumes: ["lunch", "dinner"],
    plant_protein: ["lunch", "dinner"],
    cereals: ["breakfast"],
    pasta: ["lunch", "dinner"],
    rice: ["lunch", "dinner"],
    bars: ["snack"],
    vegetables: ["lunch", "dinner"],
    fruits: ["breakfast", "snack"],
    nuts: ["snack"],
    seeds: ["snack", "breakfast"],
    oils: ["lunch", "dinner"],
    beverages: ["breakfast", "snack"],
    supplements: ["breakfast", "snack"],
    other: ["breakfast", "lunch", "dinner", "snack"],
  };

  return mealTypeMap[category] || ["breakfast", "lunch", "dinner", "snack"];
}

export interface NutritionProfile {
  userId: string;
  goal: string;
  dietaryPreference: string;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbTarget: number;
  dailyFatTarget: number;
}

export interface MealMacroTargets {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface MealLog {
  userId: string;
  date: Date;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: { foodId: string; quantity: number }[];
}

export interface NutritionPlan {
  userId: string;
  breakfast: MealLog;
  lunch: MealLog;
  dinner: MealLog;
  snack: MealLog;
}

export async function createNutritionPlan(
  profile: NutritionProfile,
): Promise<NutritionPlan> {
  const { userId, goal, dietaryPreference } = profile;

  // Get foods from database or create new ones if they don't exist
  const foods = await getOrCreateFoods(dietaryPreference);

  // Distribuir los macros objetivo entre las comidas
  // Breakfast: 25%, Lunch: 35%, Dinner: 30%, Snacks: 10%
  const mealDistribution = {
    breakfast: { protein: 0.25, carbs: 0.25, fat: 0.25, calories: 0.25 },
    lunch: { protein: 0.35, carbs: 0.35, fat: 0.35, calories: 0.35 },
    dinner: { protein: 0.3, carbs: 0.3, fat: 0.3, calories: 0.3 },
    snack: { protein: 0.1, carbs: 0.1, fat: 0.1, calories: 0.1 },
  };

  const dailyProteinTarget = profile.dailyProteinTarget ?? 150;
  const dailyCarbTarget = profile.dailyCarbTarget ?? 250;
  const dailyFatTarget = profile.dailyFatTarget ?? 65;
  const dailyCalorieTarget = profile.dailyCalorieTarget ?? 2000;

  // Generate meal plans for each meal type with macro targets
  const breakfast: MealLog = await createMealLog(
    userId,
    "breakfast",
    foods,
    goal,
    dietaryPreference,
    {
      protein: dailyProteinTarget * mealDistribution.breakfast.protein,
      carbs: dailyCarbTarget * mealDistribution.breakfast.carbs,
      fat: dailyFatTarget * mealDistribution.breakfast.fat,
      calories: dailyCalorieTarget * mealDistribution.breakfast.calories,
    },
  );

  const lunch: MealLog = await createMealLog(
    userId,
    "lunch",
    foods,
    goal,
    dietaryPreference,
    {
      protein: dailyProteinTarget * mealDistribution.lunch.protein,
      carbs: dailyCarbTarget * mealDistribution.lunch.carbs,
      fat: dailyFatTarget * mealDistribution.lunch.fat,
      calories: dailyCalorieTarget * mealDistribution.lunch.calories,
    },
  );

  const dinner: MealLog = await createMealLog(
    userId,
    "dinner",
    foods,
    goal,
    dietaryPreference,
    {
      protein: dailyProteinTarget * mealDistribution.dinner.protein,
      carbs: dailyCarbTarget * mealDistribution.dinner.carbs,
      fat: dailyFatTarget * mealDistribution.dinner.fat,
      calories: dailyCalorieTarget * mealDistribution.dinner.calories,
    },
  );

  const snack: MealLog = await createMealLog(
    userId,
    "snack",
    foods,
    goal,
    dietaryPreference,
    {
      protein: dailyProteinTarget * mealDistribution.snack.protein,
      carbs: dailyCarbTarget * mealDistribution.snack.carbs,
      fat: dailyFatTarget * mealDistribution.snack.fat,
      calories: dailyCalorieTarget * mealDistribution.snack.calories,
    },
  );

  // ============================================
  // RESUMEN DIARIO: TOTALES DE TODAS LAS COMIDAS
  // ============================================
  const dailyTotals = {
    protein: breakfast.protein + lunch.protein + dinner.protein + snack.protein,
    carbs: breakfast.carbs + lunch.carbs + dinner.carbs + snack.carbs,
    fat: breakfast.fat + lunch.fat + dinner.fat + snack.fat,
    calories:
      breakfast.calories + lunch.calories + dinner.calories + snack.calories,
  };

  const dailyProteinDiff = dailyTotals.protein - dailyProteinTarget;
  const dailyCarbsDiff = dailyTotals.carbs - dailyCarbTarget;
  const dailyFatDiff = dailyTotals.fat - dailyFatTarget;
  const dailyCaloriesDiff = dailyTotals.calories - dailyCalorieTarget;

  const dailyProteinPercent = (dailyTotals.protein / dailyProteinTarget) * 100;
  const dailyCarbsPercent = (dailyTotals.carbs / dailyCarbTarget) * 100;
  const dailyFatPercent = (dailyTotals.fat / dailyFatTarget) * 100;
  const dailyCaloriesPercent =
    (dailyTotals.calories / dailyCalorieTarget) * 100;

  // Verificar cumplimiento diario
  const MACRO_TOLERANCE_DAILY = 0.05; // 5%
  const dailyProteinMet =
    Math.abs(dailyProteinDiff) <= dailyProteinTarget * MACRO_TOLERANCE_DAILY ||
    dailyTotals.protein >= dailyProteinTarget;
  const dailyCarbsMet =
    Math.abs(dailyCarbsDiff) <= dailyCarbTarget * MACRO_TOLERANCE_DAILY ||
    dailyTotals.carbs >= dailyCarbTarget;
  const dailyFatMet =
    Math.abs(dailyFatDiff) <= dailyFatTarget * MACRO_TOLERANCE_DAILY ||
    dailyTotals.fat >= dailyFatTarget;
  const dailyCaloriesMet =
    dailyTotals.calories >= dailyCalorieTarget &&
    dailyTotals.calories <= dailyCalorieTarget * 1.05;

  console.log(`\n${"=".repeat(80)}`);
  console.log(`📊 RESUMEN DIARIO: TOTALES DE TODAS LAS COMIDAS`);
  console.log(`${"=".repeat(80)}`);
  console.log(`\n   🎯 OBJETIVOS DIARIOS DEL USUARIO:`);
  console.log(`      └─ Proteína:     ${dailyProteinTarget.toFixed(1)}g`);
  console.log(`      └─ Carbohidratos: ${dailyCarbTarget.toFixed(1)}g`);
  console.log(`      └─ Grasas:        ${dailyFatTarget.toFixed(1)}g`);
  console.log(`      └─ Calorías:      ${dailyCalorieTarget.toFixed(0)}kcal`);

  console.log(
    `\n   📈 TOTALES GENERADOS POR EL ALGORITMO (SUMA DE TODAS LAS COMIDAS):`,
  );
  console.log(
    `      └─ Proteína:     ${dailyTotals.protein.toFixed(1)}g (Breakfast: ${breakfast.protein.toFixed(1)}g + Lunch: ${lunch.protein.toFixed(1)}g + Dinner: ${dinner.protein.toFixed(1)}g + Snack: ${snack.protein.toFixed(1)}g)`,
  );
  console.log(
    `      └─ Carbohidratos: ${dailyTotals.carbs.toFixed(1)}g (Breakfast: ${breakfast.carbs.toFixed(1)}g + Lunch: ${lunch.carbs.toFixed(1)}g + Dinner: ${dinner.carbs.toFixed(1)}g + Snack: ${snack.carbs.toFixed(1)}g)`,
  );
  console.log(
    `      └─ Grasas:        ${dailyTotals.fat.toFixed(1)}g (Breakfast: ${breakfast.fat.toFixed(1)}g + Lunch: ${lunch.fat.toFixed(1)}g + Dinner: ${dinner.fat.toFixed(1)}g + Snack: ${snack.fat.toFixed(1)}g)`,
  );
  console.log(
    `      └─ Calorías:      ${dailyTotals.calories.toFixed(0)}kcal (Breakfast: ${breakfast.calories.toFixed(0)}kcal + Lunch: ${lunch.calories.toFixed(0)}kcal + Dinner: ${dinner.calories.toFixed(0)}kcal + Snack: ${snack.calories.toFixed(0)}kcal)`,
  );

  console.log(
    `\n   📊 COMPARATIVA DIARIA: OBJETIVOS vs RESULTADOS DEL ALGORITMO`,
  );
  console.log(`   ${"=".repeat(80)}`);
  console.log(
    `   ${"Macro".padEnd(20)} │ ${"Objetivo Diario".padEnd(18)} │ ${"Total Generado".padEnd(18)} │ ${"Diferencia".padEnd(12)} │ ${"Estado"}`,
  );
  console.log(`   ${"-".repeat(80)}`);

  const dailyProteinStatus = dailyProteinMet ? "✅" : "❌";
  const dailyProteinDiffStr =
    dailyProteinDiff > 0
      ? `+${dailyProteinDiff.toFixed(1)}g`
      : `${dailyProteinDiff.toFixed(1)}g`;
  console.log(
    `   ${"Proteína".padEnd(20)} │ ${`${dailyProteinTarget.toFixed(1)}g`.padEnd(18)} │ ${`${dailyTotals.protein.toFixed(1)}g`.padEnd(18)} │ ${dailyProteinDiffStr.padEnd(12)} │ ${dailyProteinStatus}`,
  );

  const dailyCarbsStatus = dailyCarbsMet ? "✅" : "❌";
  const dailyCarbsDiffStr =
    dailyCarbsDiff > 0
      ? `+${dailyCarbsDiff.toFixed(1)}g`
      : `${dailyCarbsDiff.toFixed(1)}g`;
  console.log(
    `   ${"Carbohidratos".padEnd(20)} │ ${`${dailyCarbTarget.toFixed(1)}g`.padEnd(18)} │ ${`${dailyTotals.carbs.toFixed(1)}g`.padEnd(18)} │ ${dailyCarbsDiffStr.padEnd(12)} │ ${dailyCarbsStatus}`,
  );

  const dailyFatStatus = dailyFatMet ? "✅" : "❌";
  const dailyFatDiffStr =
    dailyFatDiff > 0
      ? `+${dailyFatDiff.toFixed(1)}g`
      : `${dailyFatDiff.toFixed(1)}g`;
  console.log(
    `   ${"Grasas".padEnd(20)} │ ${`${dailyFatTarget.toFixed(1)}g`.padEnd(18)} │ ${`${dailyTotals.fat.toFixed(1)}g`.padEnd(18)} │ ${dailyFatDiffStr.padEnd(12)} │ ${dailyFatStatus}`,
  );

  const dailyCaloriesStatus = dailyCaloriesMet ? "✅" : "❌";
  const dailyCaloriesDiffStr =
    dailyCaloriesDiff > 0
      ? `+${dailyCaloriesDiff.toFixed(0)}kcal`
      : `${dailyCaloriesDiff.toFixed(0)}kcal`;
  console.log(
    `   ${"Calorías".padEnd(20)} │ ${`${dailyCalorieTarget.toFixed(0)}kcal`.padEnd(18)} │ ${`${dailyTotals.calories.toFixed(0)}kcal`.padEnd(18)} │ ${dailyCaloriesDiffStr.padEnd(12)} │ ${dailyCaloriesStatus}`,
  );

  console.log(`   ${"=".repeat(80)}`);

  console.log(`\n   📊 RESUMEN PORCENTUAL DIARIO:`);
  console.log(
    `      └─ Proteína:     ${dailyProteinPercent.toFixed(1)}% ${dailyProteinPercent >= 100 ? "✅" : "⚠️"}`,
  );
  console.log(
    `      └─ Carbohidratos: ${dailyCarbsPercent.toFixed(1)}% ${dailyCarbsPercent >= 100 ? "✅" : "⚠️"}`,
  );
  console.log(
    `      └─ Grasas:        ${dailyFatPercent.toFixed(1)}% ${dailyFatPercent >= 100 ? "✅" : "⚠️"}`,
  );
  console.log(
    `      └─ Calorías:      ${dailyCaloriesPercent.toFixed(1)}% ${dailyCaloriesMet ? "✅" : "⚠️"}`,
  );

  const allDailyRequirementsMet =
    dailyProteinMet && dailyCarbsMet && dailyFatMet && dailyCaloriesMet;
  console.log(
    `\n   🎯 ESTADO GENERAL DIARIO: ${allDailyRequirementsMet ? "✅ PLAN DIARIO VÁLIDO - Todos los requisitos cumplidos" : "⚠️  PLAN DIARIO INCOMPLETO - Algunos requisitos no cumplidos"}`,
  );
  console.log(`${"=".repeat(80)}\n`);

  return {
    userId,
    breakfast,
    lunch,
    dinner,
    snack,
  };
}

async function createMealLog(
  userId: string,
  mealType: string,
  foods: Food[],
  goal: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _dietaryPreference: string = "no-preference",
  macroTargets?: MealMacroTargets,
): Promise<MealLog> {
  console.log(
    `\n🍽️  [${mealType.toUpperCase()}] createMealLog llamado con ${foods.length} alimentos totales`,
  );

  // Filter foods by meal type
  const selectedFoods = foods.filter((food) => {
    if (!food.mealType || food.mealType.length === 0) {
      return true; // Include foods without mealType
    }
    return food.mealType.includes(mealType);
  });

  console.log(
    `   └─ Alimentos filtrados para ${mealType}: ${selectedFoods.length}`,
  );

  // Si hay objetivos de macros, SIEMPRE intentar generar el plan, incluso si selectedFoods está vacío
  // En ese caso, usar todos los alimentos disponibles
  if (macroTargets) {
    const foodsToUse = selectedFoods.length > 0 ? selectedFoods : foods;
    console.log(
      `   └─ Usando ${foodsToUse.length} alimentos para generar plan (selectedFoods: ${selectedFoods.length}, foods: ${foods.length})`,
    );

    if (foodsToUse.length === 0) {
      console.error(
        `   ❌ ERROR: No hay alimentos disponibles para ${mealType}`,
      );
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

    return await createMealLogWithTargets(
      userId,
      mealType,
      foodsToUse,
      macroTargets,
    );
  }

  // Si no hay objetivos y no hay alimentos seleccionados, retornar vacío
  if (selectedFoods.length === 0) {
    console.log(
      `   ⚠️  No hay alimentos seleccionados y no hay macroTargets, retornando vacío`,
    );
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

  // Si no hay objetivos, usar el método anterior (fallback)
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  const mealEntries: { foodId: string; quantity: number }[] = [];

  for (const food of selectedFoods) {
    if (!food || !food.id) continue; // Saltar alimentos inválidos

    let baseQuantity = 1.0;
    if (food.category && isProteinCategory(food.category)) {
      baseQuantity = goal === "gain-muscle" ? 1.2 : 1.0;
    } else if (food.category && isCarbCategory(food.category)) {
      baseQuantity = goal === "lose-weight" ? 0.8 : 1.0;
    } else if (food.category && isVegetableCategory(food.category)) {
      baseQuantity = 1.5;
    } else if (food.category && isFatCategory(food.category)) {
      baseQuantity = goal === "lose-weight" ? 0.7 : 1.0;
    }

    if (mealType === "snack") {
      baseQuantity *= 0.5;
    }

    // Calcular cantidad en gramos basada en el serving del alimento
    const quantityInGrams = (food.serving || 100) * baseQuantity;

    totalCalories += (food.calories || 0) * (quantityInGrams / 100);
    totalProtein += (food.protein || 0) * (quantityInGrams / 100);
    totalCarbs += (food.carbs || 0) * (quantityInGrams / 100);
    totalFat += (food.fat || 0) * (quantityInGrams / 100);

    // Guardar quantity en gramos (no como ratio)
    mealEntries.push({
      foodId: food.id.toString(),
      quantity: quantityInGrams,
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

// Algoritmo Genético: Optimización L1 para minimizar error de macros
// Minimiza: |Σ(x_i * p_i) - proteina_obj| + |Σ(x_i * c_i) - carbos_obj| + |Σ(x_i * f_i) - grasas_obj|
// Sujeto a: calorías_obj <= Σ(x_i * cal_i) <= calorías_obj * 1.05
async function createMealLogWithTargets(
  userId: string,
  mealType: string,
  selectedFoods: Food[],
  targets: MealMacroTargets,
): Promise<MealLog> {
  // ============================================
  // ALGORITMO GENÉTICO
  // ============================================

  // Límites de alimentos por comida
  const MIN_FOODS = 5;
  const MAX_FOODS = mealType === "snack" ? 5 : 10;

  // Alimentos recomendados por tipo de comida (basado en objetivos nutricionales)
  const getRecommendedFoods = (meal: string): string[] => {
    const recommendations: Record<string, string[]> = {
      breakfast: [
        // Proteínas
        "Huevo entero",
        "Clara de huevo",
        "Yogur griego natural",
        "Queso cottage bajo en grasa",
        "Requesón",
        "Pechuga de pollo",
        "Pavo",
        "Tofu firme",
        "Tempeh",
        "Proteína de suero de leche",
        "Proteína de soya",
        // Carbohidratos
        "Avena",
        "Pan integral",
        "Quinoa",
        "Plátano",
        "Banana",
        "Fresas",
        "Arándanos",
        "Manzana",
        "Mango",
        "Papas",
        "Batata",
        "camote",
        // Grasas
        "Aguacate",
        "Almendras",
        "Nueces",
        "Cacahuetes",
        "maní",
        "Semillas de chía",
        "Semillas de linaza",
        "Semillas de sésamo",
        "Mantequilla de cacahuete",
        "Aceite de oliva",
      ],
      lunch: [
        // Proteínas
        "Pechuga de pollo",
        "Pavo",
        "Carne de res magra",
        "Atún",
        "Salmón",
        "Sardina",
        "Huevo entero",
        "Lentejas",
        "Garbanzos",
        // Carbohidratos
        "Arroz blanco",
        "Arroz integral",
        "Pasta",
        "Papas",
        "Yuca",
        "Plátano",
        "Frijoles",
        "Quinoa",
        // Grasas
        "Aceite de oliva",
        "Aceite de aguacate",
        "Semillas de calabaza",
        "Semillas de girasol",
        "Nueces",
        "Almendras",
        "Salmón",
        "Sardina",
      ],
      dinner: [
        // Proteínas
        "Merluza",
        "Tilapia",
        "Salmón",
        "Atún",
        "Pechuga de pollo",
        "Clara de huevo",
        "Tofu firme",
        "Lentejas",
        // Carbohidratos
        "Brócoli",
        "Espinaca",
        "Lechuga",
        "Calabacín",
        "Zucchini",
        "Zanahoria",
        "Papas",
        "Batata",
        "camote",
        "Arroz",
        "Fresas",
        "Kiwi",
        "Arándanos",
        // Grasas
        "Aceite de oliva",
        "Aguacate",
        "Semillas de chía",
        "Semillas de linaza",
        "Almendras",
      ],
      snack: [
        // Proteínas
        "Yogur griego natural",
        "Queso cottage",
        "Huevo entero",
        "Proteína de suero",
        // Carbohidratos
        "Plátano",
        "Manzana",
        "Fresas",
        "Arándanos",
        // Grasas
        "Almendras",
        "Nueces",
        "Cacahuetes",
        "maní",
        "Mantequilla de cacahuete",
      ],
    };

    return recommendations[meal] || [];
  };

  const recommendedFoodNames = getRecommendedFoods(mealType);

  // Función para verificar si un alimento es recomendado
  const isRecommendedFood = (foodName: string): boolean => {
    return recommendedFoodNames.some(
      (rec) =>
        foodName.toLowerCase().includes(rec.toLowerCase()) ||
        rec.toLowerCase().includes(foodName.toLowerCase()),
    );
  };

  // Representación: Un individuo es un vector de cantidades (x_i) para cada alimento
  // x_i >= 0 (cantidad de porciones, puede ser decimal)
  type Individual = number[]; // [x_0, x_1, ..., x_n-1] donde n = selectedFoods.length

  console.log(`\n🔍 [${mealType.toUpperCase()}] Iniciando algoritmo genético`);
  console.log(
    `   └─ Alimentos recomendados para ${mealType}: ${recommendedFoodNames.length} tipos`,
  );
  console.log(
    `📊 Objetivos: P=${targets.protein.toFixed(1)}g, C=${targets.carbs.toFixed(1)}g, F=${targets.fat.toFixed(1)}g, Cal=${targets.calories.toFixed(0)}kcal`,
  );
  console.log(`🍽️  Alimentos disponibles: ${selectedFoods.length}`);
  console.log(
    `📋 Límites de alimentos: Mínimo ${MIN_FOODS}, Máximo ${MAX_FOODS} (${mealType === "snack" ? "snack" : "comida principal"})`,
  );

  // Verificar valores nutricionales de ejemplo (para debugging)
  if (selectedFoods.length > 0) {
    const sampleFood = selectedFoods[0];
    if (sampleFood) {
      console.log(`   └─ Ejemplo alimento: ${sampleFood.name || "Sin nombre"}`);
      console.log(
        `      └─ Valores nutricionales (por 100g): P=${sampleFood.protein || 0}g, C=${sampleFood.carbs || 0}g, F=${sampleFood.fat || 0}g, Cal=${sampleFood.calories || 0}kcal`,
      );
      console.log(`      └─ Serving size: ${sampleFood.serving || 100}g`);
      console.log(
        `      └─ Para alcanzar ${targets.protein.toFixed(1)}g proteína, necesitaríamos ~${(targets.protein / (sampleFood.protein || 1)).toFixed(1)}x (${((targets.protein / (sampleFood.protein || 1)) * 100).toFixed(0)}g)`,
      );
    }
  }

  // Función de fitness: Minimiza error L1
  // Error = |Σ(x_i * p_i) - proteina_obj| + |Σ(x_i * c_i) - carbos_obj| + |Σ(x_i * f_i) - grasas_obj|
  // Penaliza si calorías están fuera del rango: calorías_obj <= Σ(x_i * cal_i) <= calorías_obj * 1.05
  // IMPORTANTE: quantityRatio representa cantidad relativa a 100g (1.0 = 100g)
  // Los valores nutricionales (food.protein, etc.) están en "por 100g"
  // Para calcular macros: macro = food.macro * quantityRatio (donde quantityRatio es múltiplo de 100g)
  const calculateFitness = (individual: Individual): number => {
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCalories = 0;
    let foodCount = 0; // Contar alimentos con cantidad > 0.01

    for (let i = 0; i < individual.length && i < selectedFoods.length; i++) {
      const food = selectedFoods[i];
      if (!food) continue;

      const quantityRatio = individual[i] || 0;
      if (quantityRatio < 0.01) continue; // Ignorar valores muy pequeños

      foodCount++;

      // quantityRatio representa cantidad relativa a 100g
      // Si quantityRatio = 1.0, significa 100g
      // Los valores nutricionales están en "por 100g", así que multiplicamos directamente
      totalProtein += (food.protein || 0) * quantityRatio;
      totalCarbs += (food.carbs || 0) * quantityRatio;
      totalFat += (food.fat || 0) * quantityRatio;
      totalCalories += (food.calories || 0) * quantityRatio;
    }

    // Error L1 (suma de errores absolutos)
    // Penalizar más los déficits que los excesos (es mejor tener un poco más que menos)
    const proteinError =
      totalProtein < targets.protein
        ? (targets.protein - totalProtein) * 2 // Penalización doble por déficit
        : Math.abs(totalProtein - targets.protein) * 0.5; // Penalización menor por exceso
    const carbsError =
      totalCarbs < targets.carbs
        ? (targets.carbs - totalCarbs) * 2 // Penalización doble por déficit
        : Math.abs(totalCarbs - targets.carbs) * 0.5; // Penalización menor por exceso
    const fatError =
      totalFat < targets.fat
        ? (targets.fat - totalFat) * 2 // Penalización doble por déficit
        : Math.abs(totalFat - targets.fat) * 0.5; // Penalización menor por exceso moderado
    const macroError = proteinError + carbsError + fatError;

    // Penalización por calorías fuera del rango
    const minCalories = targets.calories;
    const maxCalories = targets.calories * 1.05;
    let caloriePenalty = 0;

    if (totalCalories < minCalories) {
      caloriePenalty = (minCalories - totalCalories) * 10; // Penalización fuerte
    } else if (totalCalories > maxCalories) {
      caloriePenalty = (totalCalories - maxCalories) * 10; // Penalización fuerte
    }

    // Penalización por número de alimentos fuera del rango
    let foodCountPenalty = 0;
    if (foodCount < MIN_FOODS) {
      foodCountPenalty = (MIN_FOODS - foodCount) * 50; // Penalización fuerte por muy pocos alimentos
    } else if (foodCount > MAX_FOODS) {
      foodCountPenalty = (foodCount - MAX_FOODS) * 50; // Penalización fuerte por demasiados alimentos
    }

    // Bonus por usar alimentos recomendados (reduce el fitness)
    let recommendedBonus = 0;
    let recommendedCount = 0;
    for (let i = 0; i < individual.length && i < selectedFoods.length; i++) {
      const food = selectedFoods[i];
      if (!food) continue;

      const quantityRatio = individual[i] || 0;
      if (quantityRatio < 0.01) continue;

      if (isRecommendedFood(food.name)) {
        recommendedCount++;
        // Bonus proporcional a la cantidad usada (más cantidad = más bonus)
        recommendedBonus += quantityRatio * 0.5; // Bonus pequeño pero acumulativo
      }
    }

    // Penalización si hay muy pocos alimentos recomendados (al menos 50% deberían ser recomendados)
    const recommendedRatio = foodCount > 0 ? recommendedCount / foodCount : 0;
    const recommendedPenalty =
      recommendedRatio < 0.5 ? (0.5 - recommendedRatio) * 10 : 0;

    // Fitness = error total - bonus + penalizaciones (menor es mejor)
    return (
      macroError +
      caloriePenalty +
      foodCountPenalty +
      recommendedPenalty -
      recommendedBonus
    );
  };

  // Generar individuo aleatorio inicial
  // quantityRatio representa cantidad relativa a 100g (1.0 = 100g)
  // Mejorar la inicialización para que sea más inteligente y balanceada
  const createRandomIndividual = (): Individual => {
    const individual: Individual = new Array(selectedFoods.length).fill(0);

    // Calcular cuánto de cada macro necesitamos
    const proteinNeeded = targets.protein;
    const carbsNeeded = targets.carbs;
    const fatNeeded = targets.fat;

    // Inicializar con número de alimentos dentro del rango permitido
    const numFoods = Math.min(
      MIN_FOODS + Math.floor(Math.random() * (MAX_FOODS - MIN_FOODS + 1)),
      selectedFoods.length,
    );

    // Seleccionar índices únicos de alimentos, priorizando alimentos recomendados
    const selectedIndices = new Set<number>();

    // Primero, intentar seleccionar alimentos recomendados (al menos 50% del total)
    const recommendedIndices: number[] = [];
    const nonRecommendedIndices: number[] = [];

    for (let i = 0; i < selectedFoods.length; i++) {
      const food = selectedFoods[i];
      if (!food) continue;

      if (isRecommendedFood(food.name)) {
        recommendedIndices.push(i);
      } else {
        nonRecommendedIndices.push(i);
      }
    }

    // Seleccionar al menos 50% de alimentos recomendados
    const minRecommended = Math.ceil(numFoods * 0.5);
    const recommendedToSelect = Math.min(
      minRecommended,
      recommendedIndices.length,
      numFoods,
    );
    const nonRecommendedToSelect = numFoods - recommendedToSelect;

    // Seleccionar alimentos recomendados aleatoriamente
    const shuffledRecommended = [...recommendedIndices].sort(
      () => Math.random() - 0.5,
    );
    for (let i = 0; i < recommendedToSelect; i++) {
      selectedIndices.add(shuffledRecommended[i]!);
    }

    // Completar con alimentos no recomendados si es necesario
    const shuffledNonRecommended = [...nonRecommendedIndices].sort(
      () => Math.random() - 0.5,
    );
    for (
      let i = 0;
      i < nonRecommendedToSelect && selectedIndices.size < numFoods;
      i++
    ) {
      selectedIndices.add(shuffledNonRecommended[i]!);
    }

    // Si aún no tenemos suficientes, completar aleatoriamente
    while (selectedIndices.size < numFoods) {
      const randomIndex = Math.floor(Math.random() * selectedFoods.length);
      selectedIndices.add(randomIndex);
    }

    // Distribuir los macros de manera más inteligente
    // Intentar balancear proteína, carbohidratos y grasas
    const selectedIndicesArray = Array.from(selectedIndices);

    // Calcular qué alimentos son mejores para cada macro
    const proteinFoods: number[] = [];
    const carbsFoods: number[] = [];
    const fatFoods: number[] = [];

    for (const index of selectedIndicesArray) {
      const food = selectedFoods[index];
      if (!food) continue;

      // Calcular densidad de cada macro (macro por 100g)
      const proteinDensity = food.protein || 0;
      const carbsDensity = food.carbs || 0;
      const fatDensity = food.fat || 0;

      // Clasificar según qué macro es más prominente
      if (proteinDensity >= carbsDensity && proteinDensity >= fatDensity) {
        proteinFoods.push(index);
      } else if (carbsDensity >= fatDensity) {
        carbsFoods.push(index);
      } else {
        fatFoods.push(index);
      }
    }

    // Límite máximo razonable: 10 = 1000g (1kg) por alimento
    const MAX_QUANTITY_RATIO = 10;

    // Distribuir proteína entre alimentos proteicos
    if (proteinFoods.length > 0) {
      const proteinPerFood = proteinNeeded / proteinFoods.length;
      for (const index of proteinFoods) {
        const food = selectedFoods[index];
        if (!food || !food.protein || food.protein === 0) continue;
        // quantityRatio = cantidad de macro necesaria / macro por 100g
        const ratio = proteinPerFood / food.protein;
        individual[index] = Math.min(
          MAX_QUANTITY_RATIO,
          Math.max(0.1, ratio * (0.8 + Math.random() * 0.4)),
        ); // Variación 0.8x-1.2x, máximo 10
      }
    }

    // Distribuir carbohidratos entre alimentos de carbohidratos
    if (carbsFoods.length > 0) {
      const carbsPerFood = carbsNeeded / carbsFoods.length;
      for (const index of carbsFoods) {
        const food = selectedFoods[index];
        if (!food || !food.carbs || food.carbs === 0) continue;
        const ratio = carbsPerFood / food.carbs;
        // Si ya tiene cantidad, promediar; si no, asignar
        individual[index] = Math.min(
          MAX_QUANTITY_RATIO,
          Math.max(
            individual[index] || 0.1,
            ratio * (0.8 + Math.random() * 0.4),
          ),
        );
      }
    }

    // Distribuir grasas entre alimentos grasos
    if (fatFoods.length > 0) {
      const fatPerFood = fatNeeded / fatFoods.length;
      for (const index of fatFoods) {
        const food = selectedFoods[index];
        if (!food || !food.fat || food.fat === 0) continue;
        const ratio = fatPerFood / food.fat;
        individual[index] = Math.min(
          MAX_QUANTITY_RATIO,
          Math.max(
            individual[index] || 0.1,
            ratio * (0.8 + Math.random() * 0.4),
          ),
        );
      }
    }

    // Asegurar que todos los alimentos seleccionados tengan al menos una cantidad mínima
    // y que no excedan el máximo
    const MAX_QUANTITY_RATIO = 10;
    for (const index of selectedIndicesArray) {
      if (individual[index]! < 0.1) {
        individual[index] = 0.1 + Math.random() * 0.2; // Entre 0.1 y 0.3
      }
      // Limitar el máximo
      if (individual[index]! > MAX_QUANTITY_RATIO) {
        individual[index] = MAX_QUANTITY_RATIO;
      }
    }

    return individual;
  };

  // Mutación: Cambiar cantidad de un alimento aleatorio
  // Usar un rango de mutación adaptativo basado en los objetivos
  const MAX_QUANTITY_RATIO = 10; // Límite máximo: 10 = 1000g
  const mutate = (
    individual: Individual,
    mutationRate: number = 0.3,
  ): Individual => {
    const mutated = [...individual];
    const maxTarget = Math.max(targets.protein, targets.carbs, targets.fat);
    const mutationRange = Math.max(1.0, maxTarget / 20); // Rango de mutación adaptativo

    for (let i = 0; i < mutated.length; i++) {
      if (Math.random() < mutationRate) {
        const currentValue = mutated[i] || 0;
        if (Math.random() < 0.5) {
          // Agregar o modificar cantidad (mutación más grande para objetivos grandes)
          mutated[i] = Math.min(
            MAX_QUANTITY_RATIO,
            Math.max(0, currentValue + (Math.random() - 0.5) * mutationRange),
          );
        } else {
          // Eliminar o reducir cantidad
          mutated[i] = Math.max(0, currentValue * (0.5 + Math.random() * 0.5));
        }
      }
      // Asegurar que nunca exceda el máximo
      if (mutated[i]! > MAX_QUANTITY_RATIO) {
        mutated[i] = MAX_QUANTITY_RATIO;
      }
    }

    return mutated;
  };

  // Crossover: Combinar dos individuos
  const crossover = (parent1: Individual, parent2: Individual): Individual => {
    const child: Individual = new Array(selectedFoods.length).fill(0);
    const crossoverPoint = Math.floor(Math.random() * selectedFoods.length);

    for (let i = 0; i < selectedFoods.length; i++) {
      if (i < crossoverPoint) {
        child[i] = parent1[i] || 0;
      } else {
        child[i] = parent2[i] || 0;
      }
    }

    return child;
  };

  // Selección: Elegir los mejores individuos (tournament selection)
  const tournamentSelect = (
    population: Individual[],
    tournamentSize: number = 3,
  ): Individual => {
    const tournament: Individual[] = [];

    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]!);
    }

    tournament.sort((a, b) => calculateFitness(a) - calculateFitness(b));
    return tournament[0]!; // Retornar el mejor del torneo
  };

  // Parámetros del algoritmo genético
  const POPULATION_SIZE = 50;
  const MAX_GENERATIONS = 3000;
  const MUTATION_RATE = 0.3;
  const ELITISM_COUNT = 5; // Mantener los mejores N individuos
  // Umbral de convergencia relativo: 2% del objetivo promedio o mínimo 0.5g
  const avgTarget = (targets.protein + targets.carbs + targets.fat) / 3;
  const CONVERGENCE_THRESHOLD = Math.max(0.5, avgTarget * 0.02); // 2% del promedio o 0.5g mínimo

  console.log(
    `🧬 Configuración: Población=${POPULATION_SIZE}, Generaciones=${MAX_GENERATIONS}, Mutación=${MUTATION_RATE}`,
  );

  // Inicializar población
  let population: Individual[] = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    population.push(createRandomIndividual());
  }

  let bestIndividual: Individual | null = null;
  let bestFitness = Infinity;
  let generation = 0;
  let stagnationCount = 0;
  const STAGNATION_LIMIT = 200; // Si no mejora en 200 generaciones, terminar

  // Evolución
  for (generation = 0; generation < MAX_GENERATIONS; generation++) {
    // Evaluar fitness de toda la población
    const fitnessScores = population.map((ind) => ({
      individual: ind,
      fitness: calculateFitness(ind),
    }));

    // Ordenar por fitness (menor es mejor)
    fitnessScores.sort((a, b) => a.fitness - b.fitness);

    // Actualizar mejor individuo
    const currentBest = fitnessScores[0];
    if (currentBest && currentBest.fitness < bestFitness) {
      bestFitness = currentBest.fitness;
      bestIndividual = [...currentBest.individual];
      stagnationCount = 0;
    } else {
      stagnationCount++;
    }

    // Log cada 500 generaciones
    if (generation % 500 === 0 || generation === MAX_GENERATIONS - 1) {
      const currentBestInd = fitnessScores[0]!.individual;
      let totalP = 0,
        totalC = 0,
        totalF = 0,
        totalCal = 0;
      for (let i = 0; i < currentBestInd.length; i++) {
        const food = selectedFoods[i];
        if (food && currentBestInd[i]! > 0) {
          // quantityRatio representa cantidad relativa a 100g
          totalP += (food.protein || 0) * currentBestInd[i]!;
          totalC += (food.carbs || 0) * currentBestInd[i]!;
          totalF += (food.fat || 0) * currentBestInd[i]!;
          totalCal += (food.calories || 0) * currentBestInd[i]!;
        }
      }
      console.log(
        `   🧬 Gen ${generation}: Fitness=${currentBest!.fitness.toFixed(2)}, P=${totalP.toFixed(1)}g, C=${totalC.toFixed(1)}g, F=${totalF.toFixed(1)}g, Cal=${totalCal.toFixed(0)}kcal`,
      );
    }

    // Convergencia
    if (bestFitness < CONVERGENCE_THRESHOLD) {
      console.log(
        `   ✅ Convergencia alcanzada en generación ${generation} (fitness=${bestFitness.toFixed(2)})`,
      );
      break;
    }

    // Si no hay mejora en mucho tiempo, terminar
    if (stagnationCount >= STAGNATION_LIMIT) {
      console.log(
        `   ⚠️  Estancamiento detectado después de ${STAGNATION_LIMIT} generaciones, terminando...`,
      );
      break;
    }

    // Crear nueva generación
    const newPopulation: Individual[] = [];

    // Elitismo: Mantener los mejores individuos
    for (let i = 0; i < ELITISM_COUNT && i < fitnessScores.length; i++) {
      newPopulation.push([...fitnessScores[i]!.individual]);
    }

    // Generar resto de la población mediante crossover y mutación
    while (newPopulation.length < POPULATION_SIZE) {
      const parent1 = tournamentSelect(population);
      const parent2 = tournamentSelect(population);
      let child = crossover(parent1, parent2);
      child = mutate(child, MUTATION_RATE);
      newPopulation.push(child);
    }

    population = newPopulation;
  }

  // Usar el mejor individuo encontrado
  if (!bestIndividual) {
    bestIndividual = population[0] || new Array(selectedFoods.length).fill(0);
  }

  // Convertir el mejor individuo a mealEntries
  // IMPORTANTE: En el algoritmo genético, quantityRatio representa cantidad relativa a 100g
  // Para convertirlo a porciones (servings): servingRatio = quantityRatio * 100 / serving
  // El frontend espera quantity en porciones (servings)
  const mealEntries: { foodId: string; quantity: number }[] = [];
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalCalories = 0;

  // Recalcular totales usando la misma lógica que el frontend para verificar consistencia
  for (let i = 0; i < bestIndividual.length && i < selectedFoods.length; i++) {
    const food = selectedFoods[i];
    if (!food || !food.id) continue;

    const quantityRatio = bestIndividual[i] || 0;
    if (quantityRatio <= 0.01) continue; // Ignorar cantidades muy pequeñas

    // Convertir quantityRatio (relativo a 100g) a gramos
    // quantityRatio * 100g = gramos totales
    const quantityInGrams = quantityRatio * 100;

    mealEntries.push({
      foodId: food.id.toString(),
      quantity: quantityInGrams, // En gramos (estandarizado)
    });

    // Calcular macros: los valores nutricionales están por 100g
    // multiplier = quantityInGrams / 100
    const multiplier = quantityInGrams / 100;
    totalProtein += (food.protein || 0) * multiplier;
    totalCarbs += (food.carbs || 0) * multiplier;
    totalFat += (food.fat || 0) * multiplier;
    totalCalories += (food.calories || 0) * multiplier;
  }

  // ============================================
  // INFORME DETALLADO DE CUMPLIMIENTO
  // ============================================
  console.log(
    `\n📊 [${mealType.toUpperCase()}] Resultado final (Algoritmo Genético):`,
  );
  console.log(`   └─ Generaciones: ${generation + 1}`);
  console.log(`   └─ Fitness final: ${bestFitness.toFixed(2)}`);
  console.log(
    `   └─ Alimentos seleccionados: ${mealEntries.length} (${mealEntries.length >= MIN_FOODS && mealEntries.length <= MAX_FOODS ? "✅" : "❌"} rango: ${MIN_FOODS}-${MAX_FOODS})`,
  );

  // Verificar cumplimiento de macros
  const proteinDiff = totalProtein - targets.protein;
  const carbsDiff = totalCarbs - targets.carbs;
  const fatDiff = totalFat - targets.fat;
  const caloriesDiff = totalCalories - targets.calories;

  const proteinPercent = (totalProtein / targets.protein) * 100;
  const carbsPercent = (totalCarbs / targets.carbs) * 100;
  const fatPercent = (totalFat / targets.fat) * 100;
  const caloriesPercent = (totalCalories / targets.calories) * 100;

  // Tolerancia: ±5% para macros
  const MACRO_TOLERANCE = 0.05; // 5%

  const proteinMet =
    Math.abs(proteinDiff) <= targets.protein * MACRO_TOLERANCE ||
    totalProtein >= targets.protein;
  const carbsMet =
    Math.abs(carbsDiff) <= targets.carbs * MACRO_TOLERANCE ||
    totalCarbs >= targets.carbs;
  const fatMet =
    Math.abs(fatDiff) <= targets.fat * MACRO_TOLERANCE ||
    totalFat >= targets.fat;
  const caloriesMet =
    totalCalories >= targets.calories &&
    totalCalories <= targets.calories * 1.05;

  console.log(`\n   ✅ VERIFICACIÓN DE REQUISITOS:`);
  console.log(
    `   ${proteinMet ? "✅" : "❌"} Proteína: ${totalProtein.toFixed(1)}g / ${targets.protein.toFixed(1)}g (${proteinPercent.toFixed(1)}%)`,
  );
  if (!proteinMet) {
    console.log(
      `      └─ Diferencia: ${proteinDiff > 0 ? "+" : ""}${proteinDiff.toFixed(1)}g (${proteinDiff > 0 ? "exceso" : "déficit"})`,
    );
  }

  console.log(
    `   ${carbsMet ? "✅" : "❌"} Carbohidratos: ${totalCarbs.toFixed(1)}g / ${targets.carbs.toFixed(1)}g (${carbsPercent.toFixed(1)}%)`,
  );
  if (!carbsMet) {
    console.log(
      `      └─ Diferencia: ${carbsDiff > 0 ? "+" : ""}${carbsDiff.toFixed(1)}g (${carbsDiff > 0 ? "exceso" : "déficit"})`,
    );
  }

  console.log(
    `   ${fatMet ? "✅" : "❌"} Grasas: ${totalFat.toFixed(1)}g / ${targets.fat.toFixed(1)}g (${fatPercent.toFixed(1)}%)`,
  );
  if (!fatMet) {
    console.log(
      `      └─ Diferencia: ${fatDiff > 0 ? "+" : ""}${fatDiff.toFixed(1)}g (${fatDiff > 0 ? "exceso" : "déficit"})`,
    );
  }

  console.log(
    `   ${caloriesMet ? "✅" : "❌"} Calorías: ${totalCalories.toFixed(0)}kcal / ${targets.calories.toFixed(0)}kcal (${caloriesPercent.toFixed(1)}%)`,
  );
  if (!caloriesMet) {
    if (totalCalories < targets.calories) {
      console.log(
        `      └─ Diferencia: -${Math.abs(caloriesDiff).toFixed(0)}kcal (déficit, debe ser >= objetivo)`,
      );
    } else {
      console.log(
        `      └─ Diferencia: +${Math.abs(caloriesDiff).toFixed(0)}kcal (exceso, debe ser <= ${(targets.calories * 1.05).toFixed(0)}kcal)`,
      );
    }
  }

  const allRequirementsMet = proteinMet && carbsMet && fatMet && caloriesMet;
  console.log(
    `\n   ${allRequirementsMet ? "✅ TODOS LOS REQUISITOS CUMPLIDOS" : "⚠️  ALGUNOS REQUISITOS NO CUMPLIDOS"}`,
  );

  // Detalle de alimentos
  console.log(`\n   📋 DETALLE DE ALIMENTOS:`);
  mealEntries.forEach((entry, idx) => {
    if (!entry || !entry.foodId) return;

    const food = selectedFoods.find(
      (f) => f && f.id && f.id.toString() === entry.foodId,
    );
    if (food && food.name) {
      // quantity está en gramos (estandarizado)
      const multiplier = entry.quantity / 100;
      const proteinFromFood = (food.protein || 0) * multiplier;
      const carbsFromFood = (food.carbs || 0) * multiplier;
      const fatFromFood = (food.fat || 0) * multiplier;
      const caloriesFromFood = (food.calories || 0) * multiplier;

      console.log(`      ${idx + 1}. ${food.name}:`);
      console.log(
        `         └─ Cantidad: ${entry.quantity.toFixed(1)}g (serving=${food.serving || 100}g)`,
      );
      console.log(
        `         └─ Multiplicador: ${multiplier.toFixed(3)} (quantity / 100)`,
      );
      console.log(
        `         └─ Macros: P=${proteinFromFood.toFixed(1)}g, C=${carbsFromFood.toFixed(1)}g, F=${fatFromFood.toFixed(1)}g, Cal=${caloriesFromFood.toFixed(0)}kcal`,
      );
    } else {
      console.log(
        `      ${idx + 1}. [Alimento no encontrado: ${entry.foodId}]`,
      );
    }
  });

  // Verificación de consistencia
  console.log(`\n   🔍 VERIFICACIÓN DE CONSISTENCIA:`);
  console.log(`      └─ Suma de macros de alimentos individuales:`);
  let sumProtein = 0,
    sumCarbs = 0,
    sumFat = 0,
    sumCalories = 0;
  mealEntries.forEach((entry) => {
    const food = selectedFoods.find(
      (f) => f && f.id && f.id.toString() === entry.foodId,
    );
    if (food) {
      // quantity está en gramos (estandarizado)
      const multiplier = entry.quantity / 100;
      sumProtein += (food.protein || 0) * multiplier;
      sumCarbs += (food.carbs || 0) * multiplier;
      sumFat += (food.fat || 0) * multiplier;
      sumCalories += (food.calories || 0) * multiplier;
    }
  });
  console.log(
    `         P=${sumProtein.toFixed(1)}g, C=${sumCarbs.toFixed(1)}g, F=${sumFat.toFixed(1)}g, Cal=${sumCalories.toFixed(0)}kcal`,
  );
  console.log(
    `      └─ Totales calculados: P=${totalProtein.toFixed(1)}g, C=${totalCarbs.toFixed(1)}g, F=${totalFat.toFixed(1)}g, Cal=${totalCalories.toFixed(0)}kcal`,
  );
  const isConsistent =
    Math.abs(sumProtein - totalProtein) < 0.1 &&
    Math.abs(sumCarbs - totalCarbs) < 0.1 &&
    Math.abs(sumFat - totalFat) < 0.1 &&
    Math.abs(sumCalories - totalCalories) < 1;
  console.log(
    `      └─ ${isConsistent ? "✅ Consistente" : "❌ INCONSISTENCIA DETECTADA"}`,
  );

  // ============================================
  // COMPARATIVA FINAL: OBJETIVOS vs RESULTADOS
  // ============================================
  console.log(
    `\n   📈 COMPARATIVA FINAL: OBJETIVOS vs RESULTADOS DEL ALGORITMO`,
  );
  console.log(`   ${"=".repeat(70)}`);
  console.log(
    `   ${"Macro".padEnd(20)} │ ${"Objetivo Usuario".padEnd(18)} │ ${"Resultado Algoritmo".padEnd(20)} │ ${"Diferencia".padEnd(12)} │ ${"Estado"}`,
  );
  console.log(`   ${"-".repeat(70)}`);

  // Proteína
  const proteinStatus = proteinMet ? "✅" : "❌";
  const proteinDiffStr =
    proteinDiff > 0
      ? `+${proteinDiff.toFixed(1)}g`
      : `${proteinDiff.toFixed(1)}g`;
  console.log(
    `   ${"Proteína".padEnd(20)} │ ${`${targets.protein.toFixed(1)}g`.padEnd(18)} │ ${`${totalProtein.toFixed(1)}g`.padEnd(20)} │ ${proteinDiffStr.padEnd(12)} │ ${proteinStatus}`,
  );

  // Carbohidratos
  const carbsStatus = carbsMet ? "✅" : "❌";
  const carbsDiffStr =
    carbsDiff > 0 ? `+${carbsDiff.toFixed(1)}g` : `${carbsDiff.toFixed(1)}g`;
  console.log(
    `   ${"Carbohidratos".padEnd(20)} │ ${`${targets.carbs.toFixed(1)}g`.padEnd(18)} │ ${`${totalCarbs.toFixed(1)}g`.padEnd(20)} │ ${carbsDiffStr.padEnd(12)} │ ${carbsStatus}`,
  );

  // Grasas
  const fatStatus = fatMet ? "✅" : "❌";
  const fatDiffStr =
    fatDiff > 0 ? `+${fatDiff.toFixed(1)}g` : `${fatDiff.toFixed(1)}g`;
  console.log(
    `   ${"Grasas".padEnd(20)} │ ${`${targets.fat.toFixed(1)}g`.padEnd(18)} │ ${`${totalFat.toFixed(1)}g`.padEnd(20)} │ ${fatDiffStr.padEnd(12)} │ ${fatStatus}`,
  );

  // Calorías
  const caloriesStatus = caloriesMet ? "✅" : "❌";
  const caloriesDiffStr =
    caloriesDiff > 0
      ? `+${caloriesDiff.toFixed(0)}kcal`
      : `${caloriesDiff.toFixed(0)}kcal`;
  console.log(
    `   ${"Calorías".padEnd(20)} │ ${`${targets.calories.toFixed(0)}kcal`.padEnd(18)} │ ${`${totalCalories.toFixed(0)}kcal`.padEnd(20)} │ ${caloriesDiffStr.padEnd(12)} │ ${caloriesStatus}`,
  );

  console.log(`   ${"=".repeat(70)}`);

  // Resumen porcentual
  console.log(`\n   📊 RESUMEN PORCENTUAL:`);
  console.log(
    `      └─ Proteína:     ${proteinPercent.toFixed(1)}% ${proteinPercent >= 100 ? "✅" : "⚠️"}`,
  );
  console.log(
    `      └─ Carbohidratos: ${carbsPercent.toFixed(1)}% ${carbsPercent >= 100 ? "✅" : "⚠️"}`,
  );
  console.log(
    `      └─ Grasas:        ${fatPercent.toFixed(1)}% ${fatPercent >= 100 ? "✅" : "⚠️"}`,
  );
  console.log(
    `      └─ Calorías:      ${caloriesPercent.toFixed(1)}% ${caloriesMet ? "✅" : "⚠️"}`,
  );

  // Estado general
  console.log(
    `\n   🎯 ESTADO GENERAL: ${allRequirementsMet ? "✅ PLAN VÁLIDO - Todos los requisitos cumplidos" : "⚠️  PLAN INCOMPLETO - Algunos requisitos no cumplidos"}`,
  );

  // Verificar que los valores retornados coincidan con lo calculado desde entries
  // Recalcular desde entries para verificar consistencia
  let verificationProtein = 0;
  let verificationCarbs = 0;
  let verificationFat = 0;
  let verificationCalories = 0;

  for (const entry of mealEntries) {
    const food = selectedFoods.find(
      (f) => f && f.id && f.id.toString() === entry.foodId,
    );
    if (food) {
      // quantity está en gramos (estandarizado)
      const multiplier = entry.quantity / 100;
      verificationProtein += (food.protein || 0) * multiplier;
      verificationCarbs += (food.carbs || 0) * multiplier;
      verificationFat += (food.fat || 0) * multiplier;
      verificationCalories += (food.calories || 0) * multiplier;
    } else {
      console.log(
        `   ⚠️  [${mealType}] Alimento no encontrado en verificación: ${entry.foodId}`,
      );
    }
  }

  const verificationProteinDiff = Math.abs(totalProtein - verificationProtein);
  const verificationCarbsDiff = Math.abs(totalCarbs - verificationCarbs);
  const verificationFatDiff = Math.abs(totalFat - verificationFat);
  const verificationCaloriesDiff = Math.abs(
    totalCalories - verificationCalories,
  );

  if (
    verificationProteinDiff > 0.5 ||
    verificationCarbsDiff > 0.5 ||
    verificationFatDiff > 0.5 ||
    verificationCaloriesDiff > 1
  ) {
    console.log(
      `\n   ⚠️  [${mealType.toUpperCase()}] INCONSISTENCIA DETECTADA EN RETORNO:`,
    );
    console.log(
      `      └─ Totales calculados: P=${totalProtein.toFixed(1)}g, C=${totalCarbs.toFixed(1)}g, F=${totalFat.toFixed(1)}g, Cal=${totalCalories.toFixed(0)}kcal`,
    );
    console.log(
      `      └─ Verificación desde entries: P=${verificationProtein.toFixed(1)}g, C=${verificationCarbs.toFixed(1)}g, F=${verificationFat.toFixed(1)}g, Cal=${verificationCalories.toFixed(0)}kcal`,
    );
    console.log(
      `      └─ Diferencias: P=${verificationProteinDiff.toFixed(1)}g, C=${verificationCarbsDiff.toFixed(1)}g, F=${verificationFatDiff.toFixed(1)}g, Cal=${verificationCaloriesDiff.toFixed(0)}kcal`,
    );
    console.log(
      `      └─ Entries count: ${mealEntries.length}, selectedFoods count: ${selectedFoods.length}`,
    );
  } else {
    console.log(
      `   ✅ [${mealType.toUpperCase()}] Verificación exitosa: valores consistentes`,
    );
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
