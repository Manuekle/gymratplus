import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { foodsToCreate } from "@/data/food";

const prisma = new PrismaClient();

// GET all foods (system foods and user's custom foods)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = session.user as {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    const searchQuery = req.nextUrl.searchParams.get("search");
    const category = req.nextUrl.searchParams.get("category");
    const mealType = req.nextUrl.searchParams.get("mealType");
    const onlyFavorites = req.nextUrl.searchParams.get("favorites") === "true";
    const onlyCustom = req.nextUrl.searchParams.get("custom") === "true";

    // Build the where clause with proper Prisma types
    const where: Prisma.FoodWhereInput = {};
    
    // Handle custom vs system foods
    if (onlyCustom) {
      where.userId = userId;
    } else {
      where.OR = [
        { userId: null },
        { userId: userId }
      ];
    }

    // Apply search filter if provided
    if (searchQuery) {
      where.name = { contains: searchQuery, mode: 'insensitive' };
    }

    // Apply category filter if provided
    if (category) {
      where.category = category;
    }

    // Apply meal type filter if provided
    if (mealType) {
      where.mealType = { has: mealType };
    }

    // Apply favorites filter if needed
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
export async function PUT() {
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
