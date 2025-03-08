import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Get nutrition analysis for the last 7 days
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // Últimos 7 días

    // Obtener registros de los últimos 7 días
    const mealLogs = await prisma.mealLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
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

    // Obtener el perfil del usuario para sus objetivos
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    let weeklyCalories = 0;
    const weeklyCaloriesBreakdown: Record<string, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    const todayMacros = { carbs: 0, protein: 0, fats: 0 };

    mealLogs.forEach((log) => {
      const dayOfWeek = new Date(log.date).toLocaleDateString("en-US", {
        weekday: "long",
      });

      weeklyCalories += log.calories;
      weeklyCaloriesBreakdown[dayOfWeek] += log.calories;

      // Si el registro es del día actual, guardar los macros
      if (log.date.toDateString() === today.toDateString()) {
        todayMacros.carbs += log.carbs;
        todayMacros.protein += log.protein;
        todayMacros.fats += log.fat;
      }
    });

    return NextResponse.json({
      weeklyCalories,
      todayMacros,
      weeklyCaloriesBreakdown,
    });
  } catch (error) {
    console.error("Error generating nutrition analysis:", error);
    return NextResponse.json(
      { error: "Error generating nutrition analysis" },
      { status: 500 }
    );
  }
}
