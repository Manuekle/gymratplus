import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { allRecipes } from "@/lib/nutrition/recipe-generator";
import { auth } from "../../../../../../../../../auth";

const prisma = new PrismaClient();

// GET all recipes (system recipes and user's custom recipes)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchQuery = req.nextUrl.searchParams.get("search");
    const mealType = req.nextUrl.searchParams.get("mealType");
    const dietaryPreference = req.nextUrl.searchParams.get("dietaryPreference");
    const onlyFavorites = req.nextUrl.searchParams.get("favorites") === "true";
    const onlyCustom = req.nextUrl.searchParams.get("custom") === "true";

    // Build the where clause
    const where: Record<string, unknown> = {};

    // Include system recipes (userId is null) and user's custom recipes
    if (onlyCustom) {
      where.userId = userId;
    } else {
      where.OR = [{ userId: null }, { userId: userId }];
    }

    // Add search filter if provided
    if (searchQuery) {
      where.name = {
        contains: searchQuery,
        mode: "insensitive",
      };
    }

    // Add meal type filter if provided
    if (mealType) {
      where.mealType = {
        has: mealType,
      };
    }

    // Add favorites filter if requested
    if (onlyFavorites) {
      where.isFavorite = true;
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        ingredients: {
          include: {
            food: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Filter by dietary preference if provided
    let filteredRecipes = recipes;
    if (dietaryPreference) {
      // This is a simplified approach. In a real app, you would need to check the ingredients
      // and their properties to determine if a recipe matches a dietary preference.
      filteredRecipes = recipes.filter((recipe) => {
        // For demo purposes, we'll just check if any ingredient's food has the category that matches the preference
        if (dietaryPreference === "vegetarian") {
          return !recipe.ingredients.some(
            (ing) =>
              ing.food.category === "proteína" &&
              ![
                "Tofu",
                "Tempeh",
                "Seitán",
                "Lentejas",
                "Garbanzos",
                "Frijoles negros",
                "Edamame",
              ].includes(ing.food.name),
          );
        }
        if (dietaryPreference === "vegan") {
          return !recipe.ingredients.some(
            (ing) =>
              (ing.food.category === "proteína" &&
                ![
                  "Tofu",
                  "Tempeh",
                  "Seitán",
                  "Lentejas",
                  "Garbanzos",
                  "Frijoles negros",
                  "Edamame",
                ].includes(ing.food.name)) ||
              [
                "Yogur griego",
                "Leche desnatada",
                "Queso cottage",
                "Mantequilla",
                "Ghee (mantequilla clarificada)",
                "Huevos",
              ].includes(ing.food.name),
          );
        }
        // Add more dietary preferences as needed
        return true;
      });
    }

    return NextResponse.json(filteredRecipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 },
    );
  }
}

// POST create a custom recipe
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.json();

    // Validate required fields
    if (
      !data.name ||
      !data.servings ||
      !data.ingredients ||
      !data.ingredients.length
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Calculate nutrition values based on ingredients
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;

    // Get all foods for the ingredients
    const foodIds = data.ingredients.map(
      (ing: { foodId: string }) => ing.foodId,
    );
    const foods = await prisma.food.findMany({
      where: {
        id: {
          in: foodIds,
        },
      },
    });

    // Calculate nutrition values
    for (const ingredient of data.ingredients) {
      const food = foods.find((f) => f.id === ingredient.foodId);
      if (food) {
        const ratio = ingredient.quantity / food.serving;
        totalCalories += food.calories * ratio;
        totalProtein += food.protein * ratio;
        totalCarbs += food.carbs * ratio;
        totalFat += food.fat * ratio;
        if (food.fiber) totalFiber += food.fiber * ratio;
        if (food.sugar) totalSugar += food.sugar * ratio;
      }
    }

    // Create the recipe
    const recipe = await prisma.recipe.create({
      data: {
        name: data.name,
        description: data.description || null,
        instructions: data.instructions || null,
        preparationTime: data.preparationTime || null,
        servings: data.servings,
        imageUrl: data.imageUrl || null,
        mealType: data.mealType || [],
        calories: Math.round(totalCalories),
        protein: Number.parseFloat(totalProtein.toFixed(1)),
        carbs: Number.parseFloat(totalCarbs.toFixed(1)),
        fat: Number.parseFloat(totalFat.toFixed(1)),
        fiber: Number.parseFloat(totalFiber.toFixed(1)),
        sugar: Number.parseFloat(totalSugar.toFixed(1)),
        isFavorite: data.isFavorite || false,
        userId: userId,
        ingredients: {
          create: data.ingredients.map(
            (ing: { foodId: string; quantity: number; unit?: string }) => ({
              foodId: ing.foodId,
              quantity: ing.quantity,
              unit: ing.unit || null,
            }),
          ),
        },
      },
      include: {
        ingredients: {
          include: {
            food: true,
          },
        },
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 },
    );
  }
}

// PUT seed the database with initial recipes
export async function PUT() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if recipes already exist
    const existingRecipesCount = await prisma.recipe.count({
      where: {
        userId: null,
      },
    });

    if (existingRecipesCount > 0) {
      return NextResponse.json({ message: "Recipes already seeded" });
    }

    // Get all foods
    const foods = await prisma.food.findMany();

    // Seed the recipes
    const recipes = [];

    for (const recipeData of allRecipes) {
      // Create the recipe
      const recipe = await prisma.recipe.create({
        data: {
          name: recipeData.name,
          description: recipeData.description,
          instructions: recipeData.instructions,
          preparationTime: recipeData.preparationTime,
          servings: recipeData.servings,
          mealType: recipeData.mealType,
          calories: recipeData.calories,
          protein: recipeData.protein,
          carbs: recipeData.carbs,
          fat: recipeData.fat,
          fiber: recipeData.fiber,
          sugar: recipeData.sugar,
          isFavorite: false,
        },
      });

      // Create the ingredients
      for (const ingredient of recipeData.ingredients) {
        // Find the food in the database
        const food = foods.find((f) => f.id === ingredient.foodId);

        if (food) {
          await prisma.recipeIngredient.create({
            data: {
              recipeId: recipe.id,
              foodId: food.id,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
            },
          });
        }
      }

      recipes.push(recipe);
    }

    return NextResponse.json({ message: `Seeded ${recipes.length} recipes` });
  } catch (error) {
    console.error("Error seeding recipes:", error);
    return NextResponse.json(
      { error: "Failed to seed recipes" },
      { status: 500 },
    );
  }
}
