import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { calculateMealNutrition } from "@/lib/nutrition";

// GET - Get meal logs for a specific date range
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const mealType = searchParams.get("mealType");

    if (!startDate) {
      return NextResponse.json(
        { error: "Start date is required" },
        { status: 400 }
      );
    }

    // Build the where clause
    const where: any = {
      userId: session.user.id,
      date: {
        gte: new Date(startDate),
      },
    };

    if (endDate) {
      where.date.lte = new Date(endDate);
    } else {
      // If no end date, use the start date as the end date (single day)
      where.date.lte = new Date(new Date(startDate).setHours(23, 59, 59, 999));
    }

    if (mealType) {
      where.mealType = mealType;
    }

    // Get meal logs with entries and food details
    const mealLogs = await prisma.mealLog.findMany({
      where,
      include: {
        entries: {
          include: {
            food: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(mealLogs);
  } catch (error) {
    console.error("Error fetching meal logs:", error);
    return NextResponse.json(
      { error: "Error fetching meal logs" },
      { status: 500 }
    );
  }
}

// POST - Create a new meal log
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    if (
      !data.date ||
      !data.mealType ||
      !data.entries ||
      !Array.isArray(data.entries)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate entries
    for (const entry of data.entries) {
      if (!entry.foodId || !entry.quantity) {
        return NextResponse.json(
          { error: "Each entry must have foodId and quantity" },
          { status: 400 }
        );
      }
    }

    // Get food details for all entries to calculate nutrition
    const foodIds = data.entries.map((entry: any) => entry.foodId);
    const foods = await prisma.food.findMany({
      where: {
        id: { in: foodIds },
      },
    });

    // Map foods by ID for easy lookup
    const foodsMap = foods.reduce((map: any, food) => {
      map[food.id] = food;
      return map;
    }, {});

    // Calculate nutrition totals
    const { calories, protein, carbs, fat } = calculateMealNutrition(
      data.entries,
      foodsMap
    );

    // Create the meal log with entries
    const mealLog = await prisma.mealLog.create({
      data: {
        userId: session.user.id,
        date: new Date(data.date),
        mealType: data.mealType,
        calories,
        protein,
        carbs,
        fat,
        entries: {
          create: data.entries.map((entry: any) => ({
            foodId: entry.foodId,
            quantity: entry.quantity,
          })),
        },
      },
      include: {
        entries: {
          include: {
            food: true,
          },
        },
      },
    });

    return NextResponse.json(mealLog);
  } catch (error) {
    console.error("Error creating meal log:", error);
    return NextResponse.json(
      { error: "Error creating meal log" },
      { status: 500 }
    );
  }
}
