import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET all meals for a specific day in a nutrition plan
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; dayNumber: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = params.id;
    const dayNumber = Number.parseInt(params.dayNumber);

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

    // Check if the day exists
    const existingDay = await prisma.nutritionDay.findUnique({
      where: {
        nutritionPlanId_dayNumber: {
          nutritionPlanId: planId,
          dayNumber: dayNumber,
        },
      },
    });

    if (!existingDay) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    // Get all meals for the day
    const meals = await prisma.mealPlanItem.findMany({
      where: {
        nutritionDayId: existingDay.id,
      },
      include: {
        food: true,
        recipe: true,
      },
      orderBy: {
        time: "asc",
      },
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error("Error fetching meals:", error);
    return NextResponse.json(
      { error: "Failed to fetch meals" },
      { status: 500 }
    );
  }
}

// POST create a new meal for a specific day in a nutrition plan
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; dayNumber: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = params.id;
    const dayNumber = Number.parseInt(params.dayNumber);
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

    // Check if the day exists
    const existingDay = await prisma.nutritionDay.findUnique({
      where: {
        nutritionPlanId_dayNumber: {
          nutritionPlanId: planId,
          dayNumber: dayNumber,
        },
      },
    });

    if (!existingDay) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    // Validate required fields
    if (!data.mealType) {
      return NextResponse.json(
        { error: "Meal type is required" },
        { status: 400 }
      );
    }

    if (!data.foodId && !data.recipeId) {
      return NextResponse.json(
        { error: "Either food or recipe is required" },
        { status: 400 }
      );
    }

    if (!data.quantity) {
      return NextResponse.json(
        { error: "Quantity is required" },
        { status: 400 }
      );
    }

    // Calculate nutrition values based on food or recipe
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    if (data.foodId) {
      const food = await prisma.food.findUnique({
        where: {
          id: data.foodId,
        },
      });

      if (!food) {
        return NextResponse.json({ error: "Food not found" }, { status: 404 });
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

    // Create the meal
    const meal = await prisma.mealPlanItem.create({
      data: {
        nutritionDayId: existingDay.id,
        mealType: data.mealType,
        time: data.time || null,
        foodId: data.foodId || null,
        recipeId: data.recipeId || null,
        quantity: data.quantity,
        notes: data.notes || null,
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

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Error creating meal:", error);
    return NextResponse.json(
      { error: "Failed to create meal" },
      { status: 500 }
    );
  }
}
