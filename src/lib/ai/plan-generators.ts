import { generateText } from "ai";
import { prisma } from "@/lib/database/prisma";

export async function generateWorkoutPlan(user: any, params: any) {
  // Fetch exercises
  const exercises = await prisma.exercise.findMany({
    select: {
      id: true,
      name: true,
      muscleGroup: true,
      description: true,
    },
  });

  const userContext = `
INFORMACIÓN DEL USUARIO:
- Nombre: ${user.name}
- Nivel de experiencia: ${params.difficulty || user.experienceLevel || "Principiante"}
- Objetivo principal: ${params.focus || (user.profile?.goal as string) || "Estar en forma"}
- Frecuencia: ${params.daysPerWeek} días/semana
- Duración sesión: ${params.durationMinutes} minutos
${user.Goal && user.Goal.length > 0 ? `- Objetivos activos: ${user.Goal.map((g: any) => g.title).join(", ")}` : ""}

EJERCICIOS DISPONIBLES:
${exercises.map((e) => `- ${e.id}: ${e.name} (${e.muscleGroup})`).join("\n")}
  `.trim();

  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    system: `Eres Rocco, un entrenador experto. Genera un plan de entrenamiento completo.
INSTRUCCIONES:
1. Crea un plan de ${params.daysPerWeek} días.
2. Usa SOLO ejercicios de la lista (IDs exactos).
3. Responde SOLO con un JSON válido.`,
    prompt: `Genera un plan de entrenamiento con este contexto:
${userContext}

FORMATO JSON:
{
  "name": "Nombre del plan",
  "description": "Descripción corta",
  "focus": "${params.focus}",
  "daysPerWeek": ${params.daysPerWeek},
  "durationMinutes": ${params.durationMinutes},
  "difficulty": "${params.difficulty}",
  "days": [
    {
      "day": "Día 1 - ...",
      "exercises": [
        { "id": "ID_EXACTO", "sets": 3, "reps": 12, "restTime": 60, "notes": "..." }
      ]
    }
  ]
}`,
  });

  const cleanedText = text
    .trim()
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "");
  const workoutPlan = JSON.parse(cleanedText);

  // Enrich
  return {
    ...workoutPlan,
    ...params, // Include input params for UI context
    days: workoutPlan.days.map((day: any) => ({
      ...day,
      exercises: day.exercises.map((ex: any) => {
        const exercise = exercises.find((e) => e.id === ex.id);
        return {
          ...ex,
          name: exercise?.name || "Ejercicio",
          muscleGroup: exercise?.muscleGroup || "General",
        };
      }),
    })),
  };
}

export async function generateNutritionPlan(user: any, params: any) {
  const foods = await prisma.food.findMany({
    take: 200,
    select: {
      id: true,
      name: true,
      calories: true,
      protein: true,
      carbs: true,
      fat: true,
      serving: true,
      category: true,
    },
  });

  const userContext = `
INFORMACIÓN DEL USUARIO:
- Objetivo: ${params.goal || "Estar en forma"}
- Calorías: ${params.calories} kcal
- Diet: ${params.dietaryType}
- Comidas: ${params.mealsPerDay} al día
  `.trim();

  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    system: `Eres Rocco, nutricionista. Genera dieta.
INSTRUCCIONES:
1. Ajusta cantidades para llegar a ${params.calories}kcal.
2. Usa SOLO alimentos de la lista.
3. Responde SOLO con un JSON válido.`,
    prompt: `Genera dieta con este contexto:
${userContext}
ALIMENTOS:
${foods
        .slice(0, 100)
        .map((f) => `${f.id}:${f.name} (${f.calories}kcal/100g)`)
        .join("\n")}

FORMATO JSON:
{
  "macros": { "protein": "...", "carbs": "...", "fat": "...", "description": "..." },
  "meals": {
    "breakfast": { "mealType": "breakfast", "entries": [{ "foodId": "...", "quantity": 100 }] },
    "lunch": { "mealType": "lunch", "entries": [] },
    "dinner": { "mealType": "dinner", "entries": [] },
    "snacks": { "mealType": "snack", "entries": [] }
  }
}`,
  });

  const cleanedText = text
    .trim()
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "");
  const nutritionPlan = JSON.parse(cleanedText);

  // Enrich
  const enrichedMeals: any = {};
  for (const [mealKey, meal] of Object.entries(nutritionPlan.meals)) {
    const mealData = meal as any;
    let totalCals = 0;
    const enrichedEntries = mealData.entries
      .map((entry: any) => {
        const food = foods.find((f) => f.id === entry.foodId);
        if (!food) return null;
        const multiple = entry.quantity / food.serving;
        totalCals += food.calories * multiple;
        return { ...entry, food };
      })
      .filter(Boolean);

    enrichedMeals[mealKey] = {
      ...mealData,
      calories: Math.round(totalCals),
      entries: enrichedEntries,
    };
  }

  return {
    ...nutritionPlan,
    ...params, // Include input params (goal, calories, dietaryType, mealsPerDay) for UI context
    description: nutritionPlan.macros.description, // Map description to top level
    meals: enrichedMeals,
  };
}
