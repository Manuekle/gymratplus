// @/lib/nutrition.ts

/**
 * Calcula los valores nutricionales según la cantidad de porción
 */
export function calculateNutritionByQuantity(
  food: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number | null;
    sugar?: number | null;
    serving: number;
  },
  quantity: number
) {
  return {
    calories: Math.round(food.calories * quantity),
    protein: parseFloat((food.protein * quantity).toFixed(1)),
    carbs: parseFloat((food.carbs * quantity).toFixed(1)),
    fat: parseFloat((food.fat * quantity).toFixed(1)),
    fiber: food.fiber ? parseFloat((food.fiber * quantity).toFixed(1)) : null,
    sugar: food.sugar ? parseFloat((food.sugar * quantity).toFixed(1)) : null,
  };
}

/**
 * Calcula los valores nutricionales totales de múltiples entradas de comida
 */
export function calculateTotalNutrition(
  entries: Array<{
    food: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    quantity: number;
  }>
) {
  return entries.reduce(
    (total, entry) => {
      const { food, quantity } = entry;
      return {
        calories: total.calories + Math.round(food.calories * quantity),
        protein: parseFloat(
          (total.protein + food.protein * quantity).toFixed(1)
        ),
        carbs: parseFloat((total.carbs + food.carbs * quantity).toFixed(1)),
        fat: parseFloat((total.fat + food.fat * quantity).toFixed(1)),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Calcula el porcentaje de calorías aportado por cada macronutriente
 */
export function calculateMacroPercentages(
  protein: number,
  carbs: number,
  fat: number
) {
  const proteinCalories = protein * 4;
  const carbsCalories = carbs * 4;
  const fatCalories = fat * 9;
  const totalCalories = proteinCalories + carbsCalories + fatCalories;

  if (totalCalories === 0) return { protein: 0, carbs: 0, fat: 0 };

  return {
    protein: Math.round((proteinCalories / totalCalories) * 100),
    carbs: Math.round((carbsCalories / totalCalories) * 100),
    fat: Math.round((fatCalories / totalCalories) * 100),
  };
}

/**
 * Compara valores con objetivos y calcula adherencia
 */
export function calculateAdherence(actual: number, target: number): number {
  if (target === 0) return 100;
  const adherence = Math.round((actual / target) * 100);
  return Math.min(adherence, 100); // Máximo 100%
}

/**
 * Calcula valores por defecto según perfil
 */
export function calculateDefaultTargets(profile: {
  gender?: string | null;
  weight?: string | null;
  activityLevel?: string | null;
  goal?: string | null;
}) {
  // Implementar cálculos basados en datos del perfil
  const weight = profile.weight ? parseFloat(profile.weight) : 70;
  const isMale = profile.gender === "male";
  const activityMultiplier = getActivityMultiplier(profile.activityLevel);
  const goalMultiplier = getGoalMultiplier(profile.goal);

  // Cálculo base de calorías (fórmula simplificada)
  const baseCals = isMale
    ? 10 * weight + 6.25 * 175 - 5 * 30 + 5
    : 10 * weight + 6.25 * 165 - 5 * 30 - 161;

  // Ajustar por actividad y objetivo
  const totalCals = Math.round(baseCals * activityMultiplier * goalMultiplier);

  // Calcular macros
  let protein = 0,
    carbs = 0,
    fat = 0;

  if (profile.goal === "gain-muscle") {
    protein = Math.round(weight * 2); // 2g por kg
    fat = Math.round(weight * 1); // 1g por kg
    // Carbos con las calorías restantes
    const remainingCals = totalCals - (protein * 4 + fat * 9);
    carbs = Math.round(remainingCals / 4);
  } else if (profile.goal === "lose-weight") {
    protein = Math.round(weight * 2.2); // 2.2g por kg
    fat = Math.round(weight * 0.8); // 0.8g por kg
    // Carbos con las calorías restantes
    const remainingCals = totalCals - (protein * 4 + fat * 9);
    carbs = Math.round(remainingCals / 4);
  } else {
    // mantener
    protein = Math.round(weight * 1.8); // 1.8g por kg
    fat = Math.round(weight * 1); // 1g por kg
    // Carbos con las calorías restantes
    const remainingCals = totalCals - (protein * 4 + fat * 9);
    carbs = Math.round(remainingCals / 4);
  }

  return {
    calories: totalCals,
    protein,
    carbs,
    fat,
  };
}

// Funciones auxiliares
function getActivityMultiplier(level?: string | null): number {
  switch (level) {
    case "sedentary":
      return 1.2;
    case "lightly-active":
      return 1.375;
    case "moderately-active":
      return 1.55;
    case "very-active":
      return 1.725;
    case "extra-active":
      return 1.9;
    default:
      return 1.375; // Por defecto
  }
}

function getGoalMultiplier(goal?: string | null): number {
  switch (goal) {
    case "lose-weight":
      return 0.8;
    case "gain-muscle":
      return 1.1;
    default:
      return 1.0; // mantener peso
  }
}
