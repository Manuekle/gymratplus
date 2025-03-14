import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET a specific food
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const foodId = params.id;

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
  } catch (error) {
    console.error("Error fetching food:", error);
    return NextResponse.json(
      { error: "Failed to fetch food" },
      { status: 500 }
    );
  }
}

// PUT update a food
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const foodId = params.id;
    const data = await req.json();

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

    // If it's a system food, only allow updating isFavorite
    if (food.userId === null) {
      const updatedFood = await prisma.food.update({
        where: {
          id: foodId,
        },
        data: {
          isFavorite:
            data.isFavorite !== undefined ? data.isFavorite : food.isFavorite,
        },
      });

      return NextResponse.json(updatedFood);
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
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : food.imageUrl,
        isFavorite:
          data.isFavorite !== undefined ? data.isFavorite : food.isFavorite,
      },
    });

    return NextResponse.json(updatedFood);
  } catch (error) {
    console.error("Error updating food:", error);
    return NextResponse.json(
      { error: "Failed to update food" },
      { status: 500 }
    );
  }
}

// DELETE a food
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const foodId = params.id;

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
        { status: 403 }
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
  } catch (error) {
    console.error("Error deleting food:", error);
    return NextResponse.json(
      { error: "Failed to delete food" },
      { status: 500 }
    );
  }
}
