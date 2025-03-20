import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
const prisma = new PrismaClient();

// GET a specific recipe
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const recipeId = id;

    const recipe = await prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
      include: {
        ingredients: {
          include: {
            food: true,
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Check if the recipe is a system recipe or belongs to the user
    if (recipe.userId !== null && recipe.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}

// PUT update a recipe
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const recipeId = id;
    const data = await request.json();

    // Define the type for ingredients
    type Ingredient = {
      foodId: string;
      quantity: number;
      unit?: string;
    };

    // Get the recipe
    const recipe = await prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
      include: {
        ingredients: true,
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Check if the recipe is a system recipe or belongs to the user
    if (recipe.userId !== null && recipe.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If it's a system recipe, only allow updating isFavorite
    if (recipe.userId === null) {
      const updatedRecipe = await prisma.recipe.update({
        where: {
          id: recipeId,
        },
        data: {
          isFavorite:
            data.isFavorite !== undefined ? data.isFavorite : recipe.isFavorite,
        },
      });

      return NextResponse.json(updatedRecipe);
    }

    // If ingredients are provided, recalculate nutrition values
    let nutritionData = {};

    if (data.ingredients) {
      const ingredients: Ingredient[] = data.ingredients;
      // Get all foods for the ingredients
      const foodIds = ingredients.map((ing) => ing.foodId);
      const foods = await prisma.food.findMany({
        where: {
          id: {
            in: foodIds,
          },
        },
      });

      // Calculate nutrition values
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalFiber = 0;
      let totalSugar = 0;

      for (const ingredient of ingredients) {
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

      nutritionData = {
        calories: Math.round(totalCalories),
        protein: Number.parseFloat(totalProtein.toFixed(1)),
        carbs: Number.parseFloat(totalCarbs.toFixed(1)),
        fat: Number.parseFloat(totalFat.toFixed(1)),
        fiber: Number.parseFloat(totalFiber.toFixed(1)),
        sugar: Number.parseFloat(totalSugar.toFixed(1)),
      };

      // Delete existing ingredients
      await prisma.recipeIngredient.deleteMany({
        where: {
          recipeId: recipeId,
        },
      });

      // Create new ingredients
      if (recipeId) {
        for (const ingredient of ingredients) {
          await prisma.recipeIngredient.create({
            data: {
              recipeId: recipeId,
              foodId: ingredient.foodId,
              quantity: ingredient.quantity,
              unit: ingredient.unit || null,
            },
          });
        }
      }
    }

    // Update the recipe
    const updatedRecipe = await prisma.recipe.update({
      where: {
        id: recipeId,
      },
      data: {
        name: data.name || recipe.name,
        description:
          data.description !== undefined
            ? data.description
            : recipe.description,
        instructions:
          data.instructions !== undefined
            ? data.instructions
            : recipe.instructions,
        preparationTime:
          data.preparationTime !== undefined
            ? data.preparationTime
            : recipe.preparationTime,
        servings: data.servings || recipe.servings,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : recipe.imageUrl,
        mealType: data.mealType || recipe.mealType,
        isFavorite:
          data.isFavorite !== undefined ? data.isFavorite : recipe.isFavorite,
        ...nutritionData,
      },
      include: {
        ingredients: {
          include: {
            food: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

// DELETE a recipe
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const recipeId = id;

    // Get the recipe
    const recipe = await prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Check if the recipe is a custom recipe and belongs to the user
    if (recipe.userId === null) {
      return NextResponse.json(
        { error: "Cannot delete system recipes" },
        { status: 403 }
      );
    }

    if (recipe.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the recipe (cascade will delete related ingredients)
    await prisma.recipe.delete({
      where: {
        id: recipeId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
