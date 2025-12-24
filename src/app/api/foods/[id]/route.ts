import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@auth";
const prisma = new PrismaClient();

// GET a specific food
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Food ID is required" },
        { status: 400 },
      );
    }

    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const foodId = id;

    const food = await prisma.food.findUnique({
      where: {
        id: foodId,
      },
    });

    if (!food) {
      return NextResponse.json({ error: "Food not found" }, { status: 404 });
    }

    // Check if the food is a system food or belongs to the user
    if (food.userId !== null && food.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(food);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch food" },
      { status: 500 },
    );
  }
}

// PUT update a food
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Food ID is required" },
        { status: 400 },
      );
    }

    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const foodId = id;
    const data = await request.json();

    // Get the food
    const food = await prisma.food.findUnique({
      where: {
        id: foodId,
      },
    });

    if (!food) {
      return NextResponse.json({ error: "Food not found" }, { status: 404 });
    }

    // Check if the food is a system food or belongs to the user
    if (food.userId !== null && food.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // System foods cannot be updated
    if (food.userId === null) {
      return NextResponse.json(
        { error: "System foods cannot be updated" },
        { status: 403 },
      );
    }

    // If it's a custom food, allow updating all fields
    const updatedFood = await prisma.food.update({
      where: {
        id: foodId,
      },
      data: {
        name: data.name || food.name,
        calories: data.calories !== undefined ? data.calories : food.calories,
        protein: data.protein !== undefined ? data.protein : food.protein,
        carbs: data.carbs !== undefined ? data.carbs : food.carbs,
        fat: data.fat !== undefined ? data.fat : food.fat,
        fiber: data.fiber !== undefined ? data.fiber : food.fiber,
        sugar: data.sugar !== undefined ? data.sugar : food.sugar,
        serving: data.serving !== undefined ? data.serving : food.serving,
        category: data.category || food.category,
        mealType: data.mealType || food.mealType,
      },
    });

    return NextResponse.json(updatedFood);
  } catch {
    return NextResponse.json(
      { error: "Failed to update food" },
      { status: 500 },
    );
  }
}

// DELETE a food
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Food ID is required" },
        { status: 400 },
      );
    }

    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const foodId = id;

    // Get the food
    const food = await prisma.food.findUnique({
      where: {
        id: foodId,
      },
    });

    if (!food) {
      return NextResponse.json({ error: "Food not found" }, { status: 404 });
    }

    // Check if the food is a custom food and belongs to the user
    if (food.userId === null) {
      return NextResponse.json(
        { error: "Cannot delete system foods" },
        { status: 403 },
      );
    }

    if (food.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the food
    await prisma.food.delete({
      where: {
        id: foodId,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete food" },
      { status: 500 },
    );
  }
}
