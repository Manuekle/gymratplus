import type { Profile } from "@prisma/client";

// Calculate nutrition totals for a meal
export function calculateMealNutrition(
  entries: { foodId: string; quantity: number }[],
  foodsMap: Record<string, any>
) {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  entries.forEach((entry) => {
    const food = foodsMap[entry.foodId];
    if (food) {
      calories += Math.round(food.calories * entry.quantity);
      protein += Number.parseFloat((food.protein * entry.quantity).toFixed(1));
      carbs += Number.parseFloat((food.carbs * entry.quantity).toFixed(1));
      fat += Number.parseFloat((food.fat * entry.quantity).toFixed(1));
    }
  });

  return { calories, protein, carbs, fat };
}

// Calculate macro targets based on profile data
export function calculateMacroTargets(profile: Profile) {
  // Default values if calculation isn't possible
  let calories = 2000;
  let protein = 150;
  let carbs = 200;
  let fat = 65;

  if (profile) {
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr = 0;

    if (
      profile.gender &&
      profile.birthdate &&
      profile.height &&
      profile.currentWeight
    ) {
      const age = calculateAge(profile.birthdate);
      const height = Number.parseFloat(profile.height);
      const weight = Number.parseFloat(profile.currentWeight);

      if (profile.gender.toLowerCase() === "male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
    } else if (profile.metabolicRate) {
      // Use provided metabolic rate if available
      bmr = profile.metabolicRate;
    }

    // Apply activity multiplier
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      ligero: 1.375,
      moderado: 1.55,
      activo: 1.725,
      "muy activo": 1.9,
    };

    const activityLevel = profile.activityLevel?.toLowerCase() || "moderado";
    const multiplier = activityMultipliers[activityLevel] || 1.55;

    // Calculate TDEE (Total Daily Energy Expenditure)
    let tdee = bmr * multiplier;

    // Adjust based on goal
    if (profile.goal) {
      if (profile.goal.toLowerCase().includes("perder")) {
        tdee -= 500; // Caloric deficit for weight loss
      } else if (profile.goal.toLowerCase().includes("ganar")) {
        tdee += 500; // Caloric surplus for muscle gain
      }
    }

    calories = Math.round(tdee);

    // Calculate macros based on goal
    if (profile.goal?.toLowerCase().includes("ganar")) {
      // Higher protein and carbs for muscle gain
      const weight = Number.parseFloat(profile.currentWeight || "0");
      protein = Math.round(weight * 2.2); // 2.2g per kg of bodyweight
      fat = Math.round((calories * 0.25) / 9); // 25% of calories from fat
      carbs = Math.round((calories - protein * 4 - fat * 9) / 4); // Remaining calories from carbs
    } else if (profile.goal?.toLowerCase().includes("perder")) {
      // Higher protein, moderate carbs for weight loss
      const weight = Number.parseFloat(profile.currentWeight || "0");
      protein = Math.round(weight * 2); // 2g per kg of bodyweight
      fat = Math.round((calories * 0.3) / 9); // 30% of calories from fat
      carbs = Math.round((calories - protein * 4 - fat * 9) / 4); // Remaining calories from carbs
    } else {
      // Balanced macros for maintenance
      const weight = Number.parseFloat(profile.currentWeight || "0");
      protein = Math.round(weight * 1.8); // 1.8g per kg of bodyweight
      fat = Math.round((calories * 0.3) / 9); // 30% of calories from fat
      carbs = Math.round((calories - protein * 4 - fat * 9) / 4); // Remaining calories from carbs
    }
  }

  return { calories, protein, carbs, fat };
}

// Helper function to calculate age from birthdate
function calculateAge(birthdate: Date): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

// Calculate water intake recommendation based on weight and activity level
export function calculateWaterIntake(
  weight: number,
  activityLevel: string
): number {
  // Base recommendation: 30-35ml per kg of body weight
  const baseIntake = (weight * 33) / 1000; // Convert to liters

  // Adjust for activity level
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.0,
    ligero: 1.1,
    moderado: 1.2,
    activo: 1.3,
    "muy activo": 1.5,
  };

  const multiplier = activityMultipliers[activityLevel.toLowerCase()] || 1.2;

  return Number.parseFloat((baseIntake * multiplier).toFixed(1));
}
