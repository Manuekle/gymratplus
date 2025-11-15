import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { startOfWeek, startOfDay, endOfDay, addDays, format } from "date-fns";

const prisma = new PrismaClient();

// GET nutrition analytics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    // Get query parameters
    const type = req.nextUrl.searchParams.get("type") || "week";

    // Get today's date (at the start of the day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize response data
    let responseData = {};

    if (type === "week") {
      // Get start and end of current week (starting on Monday)
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });

      // Create an array of dates for the week
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        weekDates.push(addDays(weekStart, i));
      }

      // Get meal logs for each day of the week
      const weekData = await Promise.all(
        weekDates.map(async (date) => {
          const nextDay = new Date(date);
          nextDay.setDate(date.getDate() + 1);

          const dayLogs = await prisma.mealLog.findMany({
            where: {
              userId: userId,
              consumedAt: {
                gte: date,
                lt: nextDay,
              },
            },
          });

          // Calculate totals
          const totals = dayLogs.reduce(
            (acc, log) => {
              return {
                calories: acc.calories + log.calories,
                protein: acc.protein + log.protein,
                carbs: acc.carbs + log.carbs,
                fat: acc.fat + log.fat,
              };
            },
            { calories: 0, protein: 0, carbs: 0, fat: 0 },
          );

          return {
            date: format(date, "yyyy-MM-dd"),
            dayOfWeek: format(date, "EEEE"),
            isToday: format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd"),
            ...totals,
          };
        }),
      );

      responseData = {
        weekData,
        weekTotals: weekData.reduce(
          (acc, day) => {
            return {
              calories: acc.calories + day.calories,
              protein: acc.protein + day.protein,
              carbs: acc.carbs + day.carbs,
              fat: acc.fat + day.fat,
            };
          },
          { calories: 0, protein: 0, carbs: 0, fat: 0 },
        ),
      };
    } else if (type === "today") {
      // Get start and end of today
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);

      // Get meal logs for today
      const todayLogs = await prisma.mealLog.findMany({
        where: {
          userId: userId,
          consumedAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        include: {
          food: true,
          recipe: true,
        },
        orderBy: {
          consumedAt: "asc",
        },
      });

      // Calculate totals
      const todayTotals = todayLogs.reduce(
        (acc, log) => {
          return {
            calories: acc.calories + log.calories,
            protein: acc.protein + log.protein,
            carbs: acc.carbs + log.carbs,
            fat: acc.fat + log.fat,
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );

      // Group by meal type
      const mealTypeGroups: Record<string, typeof todayTotals> = {};

      todayLogs.forEach((log) => {
        if (!mealTypeGroups[log.mealType]) {
          mealTypeGroups[log.mealType] = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
          };
        }

        const mealGroup = mealTypeGroups[log.mealType];
        if (mealGroup) {
          mealGroup.calories += log.calories;
          mealGroup.protein += log.protein;
          mealGroup.carbs += log.carbs;
          mealGroup.fat += log.fat;
        }
      });

      responseData = {
        todayLogs,
        todayTotals,
        mealTypeGroups,
      };
    }

    return NextResponse.json(responseData);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch nutrition analytics" },
      { status: 500 },
    );
  }
}
