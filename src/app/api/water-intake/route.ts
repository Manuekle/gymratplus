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

  if (!session.user.id) {
    return NextResponse.json({ error: "ID de usuario no encontrado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const today = new Date();
    // Get local date in YYYY-MM-DD format for the default value
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const { intake, date = localDate } = body as { intake: number; date?: string };
    
    // Enhanced validation
    if (intake === undefined || intake === null) {
      return NextResponse.json(
        { error: "Valor de consumo requerido" },
        { status: 400 },
      );
    }

    const numericIntake = Number(intake);

    if (isNaN(numericIntake)) {
      return NextResponse.json(
        { error: "Valor de consumo debe ser un número" },
        { status: 400 },
      );
    }

    if (numericIntake < 0) {
      return NextResponse.json(
        { error: "Valor de consumo no puede ser negativo" },
        { status: 400 },
      );
    }

    // Create a date at start of day in local timezone
    const intakeDate = startOfDay(new Date(`${date}T00:00:00`));

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

    // Update in Redis with the same date we used for the database
    // We know date is either a valid string or undefined, and localDate is always defined
    const dateToUse = date || localDate;
    
    // Create a date object at midnight UTC and format as YYYY-MM-DD
    // This ensures consistent date handling regardless of timezone
    const dateObj = new Date(dateToUse + 'T00:00:00Z');
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date format');
    }
    
    // Format as YYYY-MM-DD for Redis
    const formattedDate = dateObj.toISOString().split('T')[0];
    if (!formattedDate) {
      throw new Error('Failed to format date');
    }
    await storeWaterIntake(session.user.id, formattedDate, numericIntake);

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
        userProfile.waterIntake,
      );
    }

    return NextResponse.json(updatedIntake);
  } catch (error: unknown) {
    console.error("Error updating water intake:", error);
    return NextResponse.json(
      { error: "Error al actualizar el consumo de agua" },
      { status: 500 },
    );
  }
}

// GET current water intake
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "ID de usuario no encontrado" }, { status: 401 });
  }

  const url = new URL(req.url);
  // Get local date in YYYY-MM-DD format
  const today = new Date();
  const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  // Ensure we have a valid date string (localDate is always defined)
  const dateParam = url.searchParams.get("date") || localDate;
  if (typeof dateParam !== 'string') {
    return NextResponse.json({ error: "Invalid date parameter" }, { status: 400 });
  }

  try {
    // Parse the date parameter into a Date object at midnight UTC
    const dateParts = dateParam.split('-');
    if (dateParts.length !== 3) {
      throw new Error('Invalid date format');
    }
    
    // Ensure all parts are defined before parsing
    const [yearStr, monthStr, dayStr] = dateParts;
    if (!yearStr || !monthStr || !dayStr) {
      throw new Error('Invalid date format');
    }
    
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error('Invalid date format');
    }
    
    const intakeDate = new Date(Date.UTC(year, month - 1, day));
    
    if (isNaN(intakeDate.getTime())) {
      throw new Error('Invalid date');
    }

    // Format as YYYY-MM-DD for Redis
    const dateString = intakeDate.toISOString().split('T')[0];
    if (!dateString) {
      throw new Error('Failed to format date');
    }

    // Query the database using the same date format
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
      storeWaterIntake(session.user.id, dateString, dbIntake.intake).catch(
        (error) => {
          console.error("Error actualizando cache Redis:", error);
        },
      );
      return NextResponse.json({ intake: dbIntake.intake });
    }

    // Si no existe en la base de datos, intentar obtener de Redis como fallback
    const redisIntake = await getWaterIntake(session.user.id, dateString);
    return NextResponse.json({ intake: redisIntake });
  } catch (error: unknown) {
    console.error("Error fetching water intake:", error);
    return NextResponse.json(
      { error: "Error al obtener el consumo de agua" },
      { status: 500 },
    );
  }
}
