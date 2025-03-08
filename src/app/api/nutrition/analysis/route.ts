import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Get weekly nutrition analysis
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    // Obtener el inicio de la semana (lunes)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(
      today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
    );
    startOfWeek.setHours(0, 0, 0, 0);

    // Obtener el final de la semana (domingo)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Obtener registros de comidas de la semana
    const weekLogs = await prisma.mealLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Inicializar estructura para almacenar calorías por día de la semana
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const weeklyCaloriesBreakdown: Record<string, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    // Calorías totales de la semana
    let weeklyCalories = 0;

    // Calcular calorías por día de la semana
    weekLogs.forEach((log) => {
      const dayName = daysOfWeek[new Date(log.date).getDay() - 1] || "Sunday"; // Ajustar índice
      weeklyCaloriesBreakdown[dayName] += log.calories;
      weeklyCalories += log.calories;
    });

    return NextResponse.json({
      weeklyCalories,
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
