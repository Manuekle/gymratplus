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
2. Genera ENTRE 6 y 8 EJERCICIOS por sesión de entrenamiento. ¡ES MUY IMPORTANTE EL VOLUMEN DE TRABAJO!
3. Usa SOLO ejercicios de la lista (IDs exactos).
4. Para el campo "day", usa el NOMBRE DEL GRUPO MUSCULAR principal (ej: "Pecho", "Espalda", "Piernas", "Hombros", "Brazos", "Full Body").
5. Para "notes", da un consejo breve sobre la técnica.
6. Incluye el NOMBRE del ejercicio en el campo "name".
7. Si el ID no coincide, busca un ejercicio similar en la lista y usa ese ID.
8. Responde SOLO con un JSON válido.`,
    prompt: `Genera un plan de entrenamiento con este contexto:
${userContext}

FORMATO JSON:
{
  "name": "${params.planName}",
  "description": "Descripción corta",
  "focus": "${params.focus}",
  "daysPerWeek": ${params.daysPerWeek},
  "durationMinutes": ${params.durationMinutes},
  "difficulty": "${params.difficulty}",
  "days": [
    {
      "day": "Pecho",
      "exercises": [
        { "id": "ID_EXACTO", "name": "Press de Banca", "sets": 4, "reps": 10, "restTime": 90, "notes": "Controla el arco" },
        { "id": "ID_EXACTO", "name": "Aperturas", "sets": 3, "reps": 12, "restTime": 60, "notes": "Estira bien" },
        { "id": "ID_EXACTO", "name": "Fondos ", "sets": 3, "reps": 10, "restTime": 60, "notes": "Codos cerrados" },
        { "id": "ID_EXACTO", "name": "Cruce poleas", "sets": 3, "reps": 15, "restTime": 45, "notes": "Contracción pico" }
      ]
    }
  ]
}`,
  });

  const cleanedText = text
    .trim()
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "");

  let workoutPlan;
  try {
    workoutPlan = JSON.parse(cleanedText);
  } catch (e) {
    console.error("Error parsing workout plan JSON", e);
    // Fallback basic plan if parsing fails
    workoutPlan = {
      name: params.planName,
      description: "Error al generar plan",
      focus: params.focus,
      daysPerWeek: params.daysPerWeek,
      durationMinutes: params.durationMinutes,
      difficulty: params.difficulty,
      days: [],
    };
  }

  // Enrich
  return {
    ...workoutPlan,
    ...params, // Include input params for UI context
    days: (workoutPlan.days || []).map((day: any) => ({
      ...day,
      exercises: (day.exercises || []).map((ex: any) => {
        // Try to find by ID first
        let exercise = exercises.find((e) => e.id === ex.id);

        // If not found by ID, try to find by name (fuzzy match)
        if (!exercise) {
          exercise = exercises.find(
            (e) =>
              e.name.toLowerCase().includes(ex.name.toLowerCase()) ||
              ex.name.toLowerCase().includes(e.name.toLowerCase()),
          );
        }

        return {
          ...ex,
          name: exercise?.name || ex.name || "Ejercicio",
          muscleGroup: exercise?.muscleGroup || "General",
          id: exercise?.id || ex.id, // Ensure we use a valid ID if found
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
