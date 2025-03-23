import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  storeWaterIntake,
  getWaterIntake,
  publishNotification,
  redis,
  WATER_INTAKE_CHANNEL,
} from "@/lib/redis";
import { createWaterGoalCompletedNotification } from "@/lib/create-system-notifications";

// GET current water intake
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

  const date = url.searchParams.get("date") || localDate;
  console.log(date);

  try {
    // Get from Redis first (faster)
    const intake = await getWaterIntake(session.user.id, date);

    // If not in Redis, check database
    if (intake === 0) {
      const dbIntake = await prisma.dailyWaterIntake.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: new Date(date),
          },
        },
      });

      if (dbIntake) {
        // Store in Redis for future requests
        await storeWaterIntake(session.user.id, date, dbIntake.intake);
        return NextResponse.json({ intake: dbIntake.intake });
      }
    }

    return NextResponse.json({ intake });
  } catch (error) {
    console.error("Error fetching water intake:", error);
    return NextResponse.json(
      { error: "Error al obtener el consumo de agua" },
      { status: 500 }
    );
  }
}

// POST update water intake
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];

    const { intake, date = localDate } = body;

    // Enhanced validation
    if (intake === undefined || intake === null) {
      return NextResponse.json(
        { error: "Valor de consumo requerido" },
        { status: 400 }
      );
    }

    const numericIntake = Number(intake);

    if (isNaN(numericIntake)) {
      return NextResponse.json(
        { error: "Valor de consumo debe ser un número" },
        { status: 400 }
      );
    }

    if (numericIntake < 0) {
      return NextResponse.json(
        { error: "Valor de consumo no puede ser negativo" },
        { status: 400 }
      );
    }

    // Update in database
    const updatedIntake = await prisma.dailyWaterIntake.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: new Date(date),
        },
      },
      update: {
        intake: numericIntake,
      },
      create: {
        userId: session.user.id,
        date: new Date(date),
        intake: numericIntake,
      },
    });

    // Update in Redis
    await storeWaterIntake(session.user.id, date, numericIntake);

    // Check if user reached their water goal
    const userProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { waterIntake: true, notificationsActive: true },
    });

    if (
      userProfile?.notificationsActive &&
      userProfile?.waterIntake &&
      numericIntake >= userProfile.waterIntake
    ) {
      // Create notification in database
      await createWaterGoalCompletedNotification(session.user.id);

      // Publish notification to Redis for real-time updates
      await publishNotification(session.user.id, {
        type: "water",
        title: "Meta de agua alcanzada",
        message:
          "¡Felicidades! Has alcanzado tu meta diaria de consumo de agua.",
      });

      // Also publish to water intake channel
      await redis.publish(
        WATER_INTAKE_CHANNEL,
        JSON.stringify({
          userId: session.user.id,
          intake: numericIntake,
          targetIntake: userProfile.waterIntake,
        })
      );
    }

    return NextResponse.json(updatedIntake);
  } catch (error) {
    console.error("Error updating water intake:", error);
    return NextResponse.json(
      { error: "Error al actualizar el consumo de agua" },
      { status: 500 }
    );
  }
}
