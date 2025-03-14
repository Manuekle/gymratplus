import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { foodsToCreate } from "@/data/food";

const prisma = new PrismaClient();

// GET all foods (system foods and user's custom foods)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchQuery = req.nextUrl.searchParams.get("search");
    const category = req.nextUrl.searchParams.get("category");
    const mealType = req.nextUrl.searchParams.get("mealType");
    const onlyFavorites = req.nextUrl.searchParams.get("favorites") === "true";
    const onlyCustom = req.nextUrl.searchParams.get("custom") === "true";

    // Build the where clause
    const where: any = {};

    // Include system foods (userId is null) and user's custom foods
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

    // Add category filter if provided
    if (category) {
      where.category = category;
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

    const foods = await prisma.food.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(foods);
  } catch (error) {
    console.error("Error fetching foods:", error);
    return NextResponse.json(
      { error: "Failed to fetch foods" },
      { status: 500 }
    );
  }
}

// POST create a custom food
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.json();

    // Validate required fields
    if (
      !data.name ||
      !data.calories ||
      !data.protein ||
      !data.carbs ||
      !data.fat ||
      !data.serving ||
      !data.category
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the custom food
    const food = await prisma.food.create({
      data: {
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber || null,
        sugar: data.sugar || null,
        serving: data.serving,
        category: data.category,
        mealType: data.mealType || [],
        imageUrl: data.imageUrl || null,
        isFavorite: data.isFavorite || false,
        userId: userId,
      },
    });

    return NextResponse.json(food);
  } catch (error) {
    console.error("Error creating food:", error);
    return NextResponse.json(
      { error: "Failed to create food" },
      { status: 500 }
    );
  }
}

// PUT seed the database with initial foods
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if foods already exist
    const existingFoodsCount = await prisma.food.count({
      where: {
        userId: null,
      },
    });

    if (existingFoodsCount > 0) {
      return NextResponse.json({ message: "Foods already seeded" });
    }

    // Seed the foods
    const foods = await Promise.all(
      foodsToCreate.map((food) =>
        prisma.food.create({
          data: {
            ...food,
            mealType:
              food.category === "proteína" || food.category === "carbohidrato"
                ? ["desayuno", "almuerzo", "cena"]
                : food.category === "fruta"
                ? ["desayuno", "snack"]
                : food.category === "verdura"
                ? ["almuerzo", "cena"]
                : ["desayuno", "almuerzo", "cena", "snack"],
          },
        })
      )
    );

    return NextResponse.json({ message: `Seeded ${foods.length} foods` });
  } catch (error) {
    console.error("Error seeding foods:", error);
    return NextResponse.json(
      { error: "Failed to seed foods" },
      { status: 500 }
    );
  }
}
