import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  createGoalCreatedNotification,
  publishGoalNotification,
} from "@/lib/goal-notifications";

// GET /api/goals - Obtener objetivos del usuario
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // Filtrar por tipo de objetivo
    const status = url.searchParams.get("status"); // Filtrar por estado

    // Typed query with Prisma types
    const query: Prisma.GoalFindManyArgs = {
      where: {
        userId: session.user.id,
        ...(type && { type }),
        ...(status && { status }),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        progressUpdates: {
          orderBy: {
            date: "asc",
          },
        },
      },
    };

    // TypeScript now understands that query.where is defined

    console.log("Executing goals query:", JSON.stringify(query, null, 2));
    const goals = await prisma.goal.findMany(query);
    console.log(`Found ${goals.length} goals`);

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error al obtener objetivos:", error);
    return NextResponse.json(
      { error: "Error al obtener objetivos" },
      { status: 500 }
    );
  }
}

// POST /api/goals - Crear un nuevo objetivo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      title,
      description,
      targetValue,
      initialValue,
      unit,
      exerciseType,
      measurementType,
      startDate,
      targetDate,
    } = body;

    // Validación de campos
    if (!type || !title) {
      return NextResponse.json(
        { error: "El tipo y título son obligatorios" },
        { status: 400 }
      );
    }

    // Obtener el valor actual del perfil para objetivos de peso
    let currentValue = initialValue;

    if (type === "weight" && !initialValue) {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
      });

      if (profile?.currentWeight) {
        currentValue = Number.parseFloat(profile.currentWeight);
      }
    }

    // Calcular progreso inicial
    let progress = 0;
    if (
      initialValue !== undefined &&
      targetValue !== undefined &&
      initialValue !== targetValue
    ) {
      const diff = Math.abs(currentValue - initialValue);
      const totalDiff = Math.abs(targetValue - initialValue);
      progress = Math.min(100, (diff / totalDiff) * 100);

      // Si el objetivo es reducir y el valor actual es menor que el inicial
      if (targetValue < initialValue && currentValue < initialValue) {
        progress = Math.min(100, (diff / totalDiff) * 100);
      }
      // Si el objetivo es aumentar y el valor actual es mayor que el inicial
      else if (targetValue > initialValue && currentValue > initialValue) {
        progress = Math.min(100, (diff / totalDiff) * 100);
      }
      // Si vamos en dirección contraria al objetivo
      else {
        progress = 0;
      }
    }

    // Crear nuevo objetivo
    const newGoal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        type,
        title,
        description,
        targetValue,
        initialValue,
        currentValue,
        unit,
        exerciseType,
        measurementType,
        startDate: new Date(startDate),
        targetDate: targetDate ? new Date(targetDate) : null,
        status: "active",
        progress,
      },
    });

    // Si hay un valor inicial, crear el primer registro de progreso
    if (initialValue !== undefined) {
      await prisma.goalProgress.create({
        data: {
          goalId: newGoal.id,
          value: initialValue,
          date: new Date(startDate),
          notes: "Valor inicial",
        },
      });
    }

    // Create notification for goal creation
    try {
      // Check if user has notifications enabled
      const userProfile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { notificationsActive: true },
      });

      if (userProfile?.notificationsActive !== false) {
        // Default to true if not set
        // Create notification in database directly
        await createGoalCreatedNotification(session.user.id, title);

        // Add to Redis list for polling
        await publishGoalNotification(session.user.id, "created", title);

        console.log(
          `Goal creation notification created for user ${session.user.id}`
        );
      }
    } catch (notificationError) {
      // Log but don't fail the request if notification creation fails
      console.error("Error creating goal notification:", notificationError);
    }

    return NextResponse.json(newGoal);
  } catch (error) {
    console.error("Error al crear objetivo:", error);
    return NextResponse.json(
      { error: "Error al crear objetivo" },
      { status: 500 }
    );
  }
}
