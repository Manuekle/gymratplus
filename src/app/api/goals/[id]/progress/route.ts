import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createGoalAchievedNotification,
  createGoalProgressUpdatedNotification,
  publishGoalNotification,
} from "@/lib/goal-notifications";

// POST /api/goals/[id]/progress - Añadir una actualización de progreso
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    
    if (!id) {
      return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
    }
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { value, date, notes } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Verificar que el objetivo pertenece al usuario
    const goal = await prisma.goal.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Objetivo no encontrado" },
        { status: 404 },
      );
    }

    // Validación de campos
    if (value === undefined) {
      return NextResponse.json(
        { error: "El valor es obligatorio" },
        { status: 400 },
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "La fecha es obligatoria" },
        { status: 400 },
      );
    }

    // Crear nueva actualización de progreso
    const newProgressUpdate = await prisma.goalProgress.create({
      data: {
        goalId: id,
        value: Number.parseFloat(value),
        date: new Date(date),
        notes,
      },
    });

    // Actualizar el valor actual y el progreso del objetivo
    let progress = goal.progress || 0;
    let goalAchieved = false;

    if (
      goal.initialValue != null &&
      goal.targetValue != null &&
      goal.initialValue !== goal.targetValue
    ) {
      const diff = Math.abs(value - goal.initialValue);
      const totalDiff = Math.abs(goal.targetValue - goal.initialValue);

      // Si el objetivo es reducir y el valor actual es menor que el inicial
      if (goal.targetValue < goal.initialValue && value < goal.initialValue) {
        progress = Math.min(100, (diff / totalDiff) * 100);
      }
      // Si el objetivo es aumentar y el valor actual es mayor que el inicial
      else if (
        goal.targetValue > goal.initialValue &&
        value > goal.initialValue
      ) {
        progress = Math.min(100, (diff / totalDiff) * 100);
      }
      // Si vamos en dirección contraria al objetivo
      else {
        progress = 0;
      }
    }

    // Verificar si se ha alcanzado el objetivo
    let status = goal.status;
    let completedDate = goal.completedDate;

    if (
      (goal.initialValue !== null &&
        goal.targetValue !== null &&
        goal.targetValue < goal.initialValue &&
        value <= goal.targetValue) ||
      (goal.initialValue !== null &&
        goal.targetValue !== null &&
        goal.targetValue > goal.initialValue &&
        value >= goal.targetValue)
    ) {
      status = "completed";
      completedDate = new Date();
      progress = 100;
      goalAchieved = true;
    }

    // Actualizar el objetivo
    await prisma.goal.update({
      where: {
        id: id,
      },
      data: {
        currentValue: value,
        progress,
        status,
        completedDate,
      },
    });

    // Si es un objetivo de peso, actualizar también el perfil
    if (goal.type === "weight") {
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: { currentWeight: value.toString() },
        create: {
          userId: user.id,
          currentWeight: value.toString(),
        },
      });
    }

    // Create notification for goal progress update
    try {
      // Check if user has notifications enabled
      const userProfile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { notificationsActive: true },
      });

      if (userProfile?.notificationsActive !== false) {
        // Default to true if not set
        const goalTitle = goal.title;

        if (goalAchieved) {
          // Create notification for goal achievement
          await createGoalAchievedNotification(user.id, goalTitle);

          // Add to Redis list for polling
          await publishGoalNotification(user.id, "achieved", goalTitle);

          console.log(
            `Goal achievement notification created for user ${user.id}`,
          );
        } else if (
          progress >= 50 &&
          progress < 100 &&
          (goal.progress || 0) < 50
        ) {
          // Create notification for reaching 50% progress (only once)
          await createGoalProgressUpdatedNotification(
            user.id,
            goalTitle,
            progress,
          );

          // Add to Redis list for polling
          await publishGoalNotification(
            user.id,
            "progress",
            goalTitle,
            progress,
          );

          console.log(`Goal progress notification created for user ${user.id}`);
        }
      }
    } catch (notificationError) {
      // Log but don't fail the request if notification creation fails
      console.error(
        "Error creating goal progress notification:",
        notificationError,
      );
    }

    return NextResponse.json(newProgressUpdate);
  } catch (error) {
    console.error("Error al añadir actualización de progreso:", error);
    return NextResponse.json(
      { error: "Error al añadir actualización de progreso" },
      { status: 500 },
    );
  }
}
