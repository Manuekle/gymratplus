import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfDay, endOfDay, parseISO } from "date-fns";

const prisma = new PrismaClient();

// GET all meal logs for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const userId = session.user.id;
    const date = req.nextUrl.searchParams.get("date");
    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");
    const planId = req.nextUrl.searchParams.get("planId");

    // Build the where clause
    const where: {
      userId: string;
      planId?: string;
      consumedAt?: {
        gte: Date;
        lte: Date;
      };
    } = {
      userId: userId,
    };

    // Filter by plan if provided
    if (planId) {
      where.planId = planId;
    }

    // Filter by specific date
    if (date) {
      // Parse date and create day boundaries in local timezone
      const parsedDate = parseISO(date);
      const start = startOfDay(parsedDate);
      const end = endOfDay(parsedDate);

      // Debug logging
      if (process.env.NODE_ENV === "development") {
        console.debug("Filtering logs between:", {
          start: start.toISOString(),
          end: end.toISOString(),
          originalDate: date,
        });
      }

      where.consumedAt = {
        gte: start,
        lte: end,
      };
    }
    // Filter by date range
    else if (startDate && endDate) {
      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(parseISO(endDate));

      where.consumedAt = {
        gte: start,
        lte: end,
      };
    }

    const mealLogs = await prisma.mealLog.findMany({
      where,
      include: {
        food: true,
        recipe: true,
      },
      orderBy: {
        consumedAt: "asc", // Cambiar a orden ascendente para mostrar las comidas en orden cronológico
      },
    });

    return NextResponse.json(mealLogs);
  } catch (error) {
    console.error("Error fetching meal logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal logs" },
      { status: 500 },
    );
  }
}

// POST create a new meal log
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.id) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.json();

    console.log("Datos recibidos:", data);

    // Validate required fields
    if (!data.mealType) {
      return NextResponse.json(
        { error: "Meal type is required" },
        { status: 400 },
      );
    }

    if (!data.foodId && !data.recipeId) {
      return NextResponse.json(
        { error: "Either food or recipe is required" },
        { status: 400 },
      );
    }

    if (!data.quantity) {
      return NextResponse.json(
        { error: "Quantity is required" },
        { status: 400 },
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
          { status: 404 },
        );
      }

      // Calculate nutrition values based on servings
      const ratio = data.quantity / recipe.servings;
      calories = Math.round(recipe.calories * ratio);
      protein = Number.parseFloat((recipe.protein * ratio).toFixed(1));
      carbs = Number.parseFloat((recipe.carbs * ratio).toFixed(1));
      fat = Number.parseFloat((recipe.fat * ratio).toFixed(1));
    }

    try {
      // Handle date parsing
      let consumedAt: Date;
      if (data.consumedAt) {
        // Parse ISO date and ensure proper timezone handling
        consumedAt = new Date(data.consumedAt);

        // Validate date
        if (Number.isNaN(consumedAt.getTime())) {
          console.error("Invalid date:", data.consumedAt);
          return NextResponse.json(
            { error: "Invalid date format" },
            { status: 400 },
          );
        }

        if (process.env.NODE_ENV === "development") {
          console.debug("Received date:", data.consumedAt);
          console.debug("Date to save:", consumedAt.toISOString());
        }
      } else {
        consumedAt = new Date();
      }

      // Preparar los datos para crear el MealLog
      const mealLogData: {
        mealType: string;
        consumedAt: Date;
        quantity: number;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        User: {
          connect: {
            id: string;
          };
        };
        food?: {
          connect: {
            id: string;
          };
        };
        recipe?: {
          connect: {
            id: string;
          };
        };
      } = {
        mealType: data.mealType,
        consumedAt: consumedAt,
        quantity: data.quantity,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
        User: {
          connect: {
            id: userId,
          },
        },
      };

      // Conectar con food o recipe según corresponda
      if (data.foodId) {
        mealLogData.food = {
          connect: {
            id: data.foodId,
          },
        };
      }

      if (data.recipeId) {
        mealLogData.recipe = {
          connect: {
            id: data.recipeId,
          },
        };
      }

      // Crear el registro en MealLog
      const mealLog = await prisma.mealLog.create({
        data: mealLogData,
        include: {
          food: true,
          recipe: true,
        },
      });

      return NextResponse.json({ mealLog });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          error: "Database error",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error creating meal log:", error);
    return NextResponse.json(
      {
        error: "Failed to create meal log",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
