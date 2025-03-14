import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET a specific meal in a nutrition plan day
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; dayNumber: string; mealId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = params.id;
    const mealId = params.mealId;

    // Check if the plan exists and belongs to the user
    const existingPlan = await prisma.nutritionPlan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Nutrition plan not found" },
        { status: 404 }
      );
    }

    if (existingPlan.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the meal
    const meal = await prisma.mealPlanItem.findUnique({
      where: {
        id: mealId,
      },
      include: {
        food: true,
        recipe: true,
        nutritionDay: true,
      },
    });

    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    // Check if the meal belongs to the specified day in the specified plan
    const day = await prisma.nutritionDay.findUnique({
      where: {
        id: meal.nutritionDayId,
      },
    });

    if (!day || day.nutritionPlanId !== planId) {
      return NextResponse.json(
        { error: "Meal not found in this plan/day" },
        { status: 404 }
      );
    }

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error fetching meal:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal" },
      { status: 500 }
    );
  }
}

// PUT update a specific meal in a nutrition plan day
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; dayNumber: string; mealId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = params.id;
    const mealId = params.mealId;
    const data = await req.json();

    // Check if the plan exists and belongs to the user
    const existingPlan = await prisma.nutritionPlan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Nutrition plan not found" },
        { status: 404 }
      );
    }

    if (existingPlan.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the meal
    const meal = await prisma.mealPlanItem.findUnique({
      where: {
        id: mealId,
      },
      include: {
        nutritionDay: true,
      },
    });

    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    // Check if the meal belongs to the specified day in the specified plan
    if (meal.nutritionDay.nutritionPlanId !== planId) {
      return NextResponse.json(
        { error: "Meal not found in this plan" },
        { status: 404 }
      );
    }

    // Calculate nutrition values based on food or recipe if they changed
    let calories = meal.calories;
    let protein = meal.protein;
    let carbs = meal.carbs;
    let fat = meal.fat;

    if (
      (data.foodId && data.foodId !== meal.foodId) ||
      (data.recipeId && data.recipeId !== meal.recipeId) ||
      (data.quantity && data.quantity !== meal.quantity)
    ) {
      if (data.foodId) {
        const food = await prisma.food.findUnique({
          where: {
            id: data.foodId,
          },
        });

        if (!food) {
          return NextResponse.json(
            { error: "Food not found" },
            { status: 404 }
          );
        }

        // Calculate nutrition values based on quantity
        const ratio = data.quantity / food.serving;
        calories = Math.round(food.calories * ratio);
        protein = Number.parseFloat((food.protein * ratio).toFixed(1));
        carbs = Number.parseFloat((food.carbs * ratio).toFixed(1));
        fat = Number.parseFloat((food.fat * ratio).toFixed(1));
      } else if (data.recipeId) {
        const recipe = await prisma.recipe.findUnique({
          where: {
            id: data.recipeId,
          },
        });

        if (!recipe) {
          return NextResponse.json(
            { error: "Recipe not found" },
            { status: 404 }
          );
        }

        // Calculate nutrition values based on servings
        const ratio = data.quantity / recipe.servings;
        calories = Math.round(recipe.calories * ratio);
        protein = Number.parseFloat((recipe.protein * ratio).toFixed(1));
        carbs = Number.parseFloat((recipe.carbs * ratio).toFixed(1));
        fat = Number.parseFloat((recipe.fat * ratio).toFixed(1));
      }
    }

    // Update the meal
    const updatedMeal = await prisma.mealPlanItem.update({
      where: {
        id: mealId,
      },
      data: {
        mealType: data.mealType || meal.mealType,
        time: data.time !== undefined ? data.time : meal.time,
        foodId: data.foodId !== undefined ? data.foodId : meal.foodId,
        recipeId: data.recipeId !== undefined ? data.recipeId : meal.recipeId,
        quantity: data.quantity || meal.quantity,
        notes: data.notes !== undefined ? data.notes : meal.notes,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
      },
      include: {
        food: true,
        recipe: true,
      },
    });

    return NextResponse.json(updatedMeal);
  } catch (error) {
    console.error("Error updating meal:", error);
    return NextResponse.json(
      { error: "Failed to update meal" },
      { status: 500 }
    );
  }
}

// DELETE a specific meal in a nutrition plan day
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; dayNumber: string; mealId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = params.id;
    const mealId = params.mealId;

    // Check if the plan exists and belongs to the user
    const existingPlan = await prisma.nutritionPlan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Nutrition plan not found" },
        { status: 404 }
      );
    }

    if (existingPlan.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the meal
    const meal = await prisma.mealPlanItem.findUnique({
      where: {
        id: mealId,
      },
      include: {
        nutritionDay: true,
      },
    });

    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    // Check if the meal belongs to the specified day in the specified plan
    if (meal.nutritionDay.nutritionPlanId !== planId) {
      return NextResponse.json(
        { error: "Meal not found in this plan" },
        { status: 404 }
      );
    }

    // Delete the meal
    await prisma.mealPlanItem.delete({
      where: {
        id: mealId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meal:", error);
    return NextResponse.json(
      { error: "Failed to delete meal" },
      { status: 500 }
    );
  }
}
