import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  storeWaterIntake,
  getWaterIntake,
  publishNotification,
  publishWaterIntake,
} from "@/lib/redis";
import { createWaterGoalCompletedNotification } from "@/lib/create-system-notifications";
import { startOfDay } from "date-fns";

// POST update water intake
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const today = new Date();
    const defaultDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const { intake, date = defaultDate } = body;

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

    // Create a date at start of day in local timezone
    const intakeDate = startOfDay(new Date(date));

    // Update in database
    const updatedIntake = await prisma.dailyWaterIntake.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: intakeDate,
        },
      },
      update: {
        intake: numericIntake,
      },
      create: {
        userId: session.user.id,
        date: intakeDate,
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

      // Also add to water intake list for polling
      await publishWaterIntake(
        session.user.id,
        numericIntake,
        userProfile.waterIntake
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

// GET current water intake
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const date = url.searchParams.get("date") || defaultDate;

  try {
    const intakeDate = startOfDay(new Date(date));

    // Consultar primero en la base de datos
    const dbIntake = await prisma.dailyWaterIntake.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: intakeDate,
        },
      },
    });

    // Si existe en la base de datos, actualizar Redis en segundo plano
    if (dbIntake) {
      storeWaterIntake(session.user.id, date, dbIntake.intake).catch(
        (error) => {
          console.error("Error actualizando cache Redis:", error);
        }
      );
      return NextResponse.json({ intake: dbIntake.intake });
    }

    // Si no existe en la base de datos, intentar obtener de Redis como fallback
    const redisIntake = await getWaterIntake(session.user.id, date);
    return NextResponse.json({ intake: redisIntake });
  } catch (error) {
    console.error("Error fetching water intake:", error);
    return NextResponse.json(
      { error: "Error al obtener el consumo de agua" },
      { status: 500 }
    );
  }
}
