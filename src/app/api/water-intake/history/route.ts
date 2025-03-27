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
    // Obtener datos de la base de datos primero
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

    // Actualizar Redis en segundo plano
    if (formattedHistory.length > 0) {
      const historyKey = `water:history:${session.user.id}`;
      const promises = formattedHistory.map((entry) =>
        redis.zadd(historyKey, {
          score: new Date(entry.date).getTime(),
          member: `${entry.date}:${entry.liters}`,
        })
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
      { status: 500 }
    );
  }
}
