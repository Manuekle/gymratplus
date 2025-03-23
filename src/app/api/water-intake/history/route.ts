/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWaterIntakeHistory } from "@/lib/redis";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Try to get from Redis first
    let history: string | any[] = [];
    try {
      history = await getWaterIntakeHistory(session.user.id);
    } catch (redisError) {
      console.error("Redis error fetching history:", redisError);
      // Continue to database if Redis fails
    }

    // If Redis returned data, use it
    if (history && history.length > 0) {
      return NextResponse.json(history);
    }

    // If not in Redis or Redis failed, get from database
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dbHistory = await prisma.dailyWaterIntake.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    const formattedHistory = dbHistory.map((entry) => ({
      date: entry.date.toISOString().split("T")[0],
      liters: entry.intake,
    }));

    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error("Error fetching water intake history:", error);
    return NextResponse.json(
      { error: "Error al obtener el historial de consumo de agua" },
      { status: 500 }
    );
  }
}
