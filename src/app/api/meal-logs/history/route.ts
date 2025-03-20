import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authRoute } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authRoute);
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
    const where: {
      userId: string;
      date: {
        gte: Date;
        lte?: Date;
      };
      mealType?: string | null;
    } = {
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

    // Procesar los registros para añadir información adicional a las recetas
    const processedMealLogs = mealLogs.map((mealLog) => {
      const processedEntries = mealLog.entries.map((entry) => {
        // Si el alimento es una receta, añadir los ingredientes
        if (entry.food.isRecipe && entry.food.ingredients) {
          return {
            ...entry,
            food: {
              ...entry.food,
              ingredients: entry.food.ingredients, // Asegurarse de que los ingredientes estén incluidos
            },
          };
        }
        return entry;
      });

      return {
        ...mealLog,
        entries: processedEntries,
      };
    });

    return NextResponse.json(processedMealLogs);
  } catch (error) {
    console.error("Error fetching meal logs:", error);
    return NextResponse.json(
      { error: "Error fetching meal logs" },
      { status: 500 }
    );
  }
}
