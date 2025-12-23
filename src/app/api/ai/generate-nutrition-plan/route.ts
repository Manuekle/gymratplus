import { streamText } from "ai";
import { auth } from "@auth";
import { prisma } from "@/lib/database/prisma";

export const maxDuration = 30;

export async function POST() {
  const session = await auth();

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Fetch user with complete profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Fetch available foods from database
    const foods = await prisma.food.findMany({
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
      take: 200, // Limit to avoid token overflow
    });

    const profile = (user as any).profile;
    const calorieTarget = profile?.dailyCalorieTarget || 2000;
    const proteinTarget = profile?.dailyProteinTarget || 150;
    const carbTarget = profile?.dailyCarbTarget || 200;
    const fatTarget = profile?.dailyFatTarget || 60;
    const dietaryPreference = profile?.dietaryPreference || "Ninguna";

    // Build context for AI
    const userContext = `
INFORMACIÓN DEL USUARIO:
- Objetivo: ${profile?.goal || "Estar en forma"}
- Calorías diarias objetivo: ${calorieTarget} kcal
- Proteína objetivo: ${proteinTarget}g
- Carbohidratos objetivo: ${carbTarget}g
- Grasas objetivo: ${fatTarget}g
- Preferencia dietética: ${dietaryPreference}

ALIMENTOS DISPONIBLES (muestra):
${foods
  .slice(0, 100)
  .map(
    (f) =>
      `- ${f.id}: ${f.name} (${f.category}) - ${f.calories}kcal, P:${f.protein}g, C:${f.carbs}g, F:${f.fat}g por ${f.serving}g`,
  )
  .join("\n")}
    `.trim();

    const result = await streamText({
      model: "openai/gpt-4o-mini",
      prompt: `Eres Rocco, un nutricionista experto. Genera un plan de alimentación personalizado basado en:

${userContext}

INSTRUCCIONES:
1. Crea 4 comidas: desayuno, almuerzo, cena y snacks
2. Usa SOLO alimentos de la lista proporcionada con sus IDs exactos
3. Ajusta las cantidades (quantity) para alcanzar los macros objetivo
4. Respeta la preferencia dietética del usuario
5. Distribuye las calorías: 25% desayuno, 35% almuerzo, 30% cena, 10% snacks
6. Responde SOLO con un JSON válido en este formato exacto:

{
  "macros": {
    "protein": "150g",
    "carbs": "200g", 
    "fat": "60g",
    "description": "Plan equilibrado para tu objetivo"
  },
  "meals": {
    "breakfast": {
      "mealType": "breakfast",
      "entries": [
        {
          "foodId": "ID_DEL_ALIMENTO",
          "quantity": 100
        }
      ]
    },
    "lunch": {
      "mealType": "lunch",
      "entries": [
        {
          "foodId": "ID_DEL_ALIMENTO",
          "quantity": 150
        }
      ]
    },
    "dinner": {
      "mealType": "dinner",
      "entries": [
        {
          "foodId": "ID_DEL_ALIMENTO",
          "quantity": 120
        }
      ]
    },
    "snacks": {
      "mealType": "snack",
      "entries": [
        {
          "foodId": "ID_DEL_ALIMENTO",
          "quantity": 50
        }
      ]
    }
  }
}

NO incluyas texto adicional, solo el JSON.`,
    });

    // Get the generated text
    let generatedText = "";
    for await (const textPart of result.textStream) {
      generatedText += textPart;
    }

    // Parse the JSON response
    const cleanedText = generatedText
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");
    const nutritionPlan = JSON.parse(cleanedText);

    // Enrich with food details and calculate totals
    const enrichedMeals: any = {};

    for (const [mealKey, meal] of Object.entries(nutritionPlan.meals)) {
      const mealData = meal as any;
      let totalCals = 0,
        totalProtein = 0,
        totalCarbs = 0,
        totalFat = 0;

      const enrichedEntries = mealData.entries
        .map((entry: any) => {
          const food = foods.find((f) => f.id === entry.foodId);
          if (!food) return null;

          const multiplier = entry.quantity / food.serving;
          const cals = food.calories * multiplier;
          const protein = food.protein * multiplier;
          const carbs = food.carbs * multiplier;
          const fat = food.fat * multiplier;

          totalCals += cals;
          totalProtein += protein;
          totalCarbs += carbs;
          totalFat += fat;

          return {
            id: `temp-${Math.random()}`,
            foodId: food.id,
            quantity: entry.quantity,
            food: {
              id: food.id,
              name: food.name,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fat,
              serving: food.serving,
              category: food.category,
            },
          };
        })
        .filter(Boolean);

      enrichedMeals[mealKey] = {
        id: `temp-${mealKey}`,
        mealType: mealData.mealType,
        calories: Math.round(totalCals),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
        entries: enrichedEntries,
      };
    }

    const enrichedPlan = {
      macros: nutritionPlan.macros,
      meals: enrichedMeals,
    };

    return Response.json(enrichedPlan);
  } catch (error) {
    console.error("Error generating nutrition plan:", error);
    return Response.json(
      { error: "Error generando plan nutricional" },
      { status: 500 },
    );
  }
}
