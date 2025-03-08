import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Search or list foods
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const category = searchParams.get("category");
    const favoritesOnly = searchParams.get("favorites") === "true";
    const limit = Number.parseInt(searchParams.get("limit") || "50");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    // Build the where clause based on search parameters
    const where: any = {};

    if (query) {
      where.name = {
        contains: query,
        mode: "insensitive",
      };
    }

    if (category) {
      where.category = category;
    }

    if (favoritesOnly) {
      where.OR = [{ isFavorite: true }, { userId: session.user.id }];
    }

    // Get global foods and user's custom foods
    const foods = await prisma.food.findMany({
      where: {
        OR: [
          { userId: null }, // Global foods
          { userId: session.user.id }, // User's custom foods
        ],
        ...where,
      },
      orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
      take: limit,
      skip: offset,
    });

    const total = await prisma.food.count({
      where: {
        OR: [{ userId: null }, { userId: session.user.id }],
        ...where,
      },
    });

    return NextResponse.json({
      foods,
      pagination: {
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error fetching foods:", error);
    return NextResponse.json(
      { error: "Error fetching foods" },
      { status: 500 }
    );
  }
}

// POST - Create a custom food
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "calories",
      "protein",
      "carbs",
      "fat",
      "serving",
      "category",
    ];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create the custom food
    const food = await prisma.food.create({
      data: {
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber,
        sugar: data.sugar,
        serving: data.serving,
        category: data.category,
        imageUrl: data.imageUrl,
        isFavorite: data.isFavorite || false,
        userId: session.user.id, // Associate with the current user
      },
    });

    return NextResponse.json(food);
  } catch (error) {
    console.error("Error creating custom food:", error);
    return NextResponse.json(
      { error: "Error creating custom food" },
      { status: 500 }
    );
  }
}
