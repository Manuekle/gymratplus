import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Get data from the database for the last 30 days
    // Create dates in UTC to avoid timezone issues
    const now = new Date();
    // Get current date at midnight UTC
    const today = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );
    // Calculate 29 days ago (30 days including today)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setUTCDate(today.getUTCDate() - 29);

    // Set end date to the end of today (inclusive)
    const endDate = new Date(today);
    endDate.setUTCDate(today.getUTCDate() + 1); // Next day at 00:00:00

    // For debugging - log the date range being queried
    console.log(
      "Querying water intake from",
      thirtyDaysAgo.toISOString(),
      "to",
      endDate.toISOString(),
    );

    const dbHistory = await prisma.dailyWaterIntake.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: thirtyDaysAgo,
          lt: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Log raw database history for debugging
    console.log("Raw database history:", JSON.stringify(dbHistory, null, 2));

    // Format dates to YYYY-MM-DD in local timezone
    const formattedHistory = dbHistory.map((entry) => {
      // Get the date parts in UTC to avoid timezone issues
      const date = new Date(entry.date);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      console.log("Processing date:", {
        original: entry.date,
        utc: date.toISOString(),
        local: date.toString(),
        formatted: dateString,
        utcParts: { year, month, day },
      });

      return {
        date: dateString,
        liters: entry.intake,
      };
    });

    console.log(
      "Final formatted history:",
      JSON.stringify(formattedHistory, null, 2),
    );

    // Actualizar Redis en segundo plano
    if (formattedHistory.length > 0) {
      const historyKey = `water:history:${session.user.id}`;
      const promises = formattedHistory.map((entry) =>
        redis.zadd(historyKey, {
          score: new Date(`${entry.date}T12:00:00`).getTime(),
          member: `${entry.date}:${entry.liters}`,
        }),
      );

      Promise.all(promises).catch((error) => {
        console.error("Error actualizando cache Redis:", error);
      });

      // Establecer expiración para mantener solo los últimos 30 días
      redis.expire(historyKey, 60 * 60 * 24 * 30).catch((error) => {
        console.error("Error estableciendo expiración en Redis:", error);
      });
    }

    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error("Error fetching water intake history:", error);
    return NextResponse.json(
      { error: "Error al obtener el historial de consumo de agua" },
      { status: 500 },
    );
  }
}
