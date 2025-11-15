import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import {
  createGoalAchievedNotification,
  createGoalProgressUpdatedNotification,
  publishGoalNotification,
} from "@/lib/notifications/goal-notifications";

// POST /api/goals/[id]/progress - Añadir una actualización de progreso
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    const id = segments[segments.length - 2]; // penúltimo segmento

    if (!id) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 },
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // LOGS DE DEPURACIÓN

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

    // Update current value and calculate progress
    let progress = 0;
    let goalAchieved = false;
    let status = goal.status;
    let completedDate = goal.completedDate;

    // Only calculate progress if we have all required values
    if (
      goal.initialValue !== null &&
      goal.initialValue !== undefined &&
      goal.targetValue !== null &&
      goal.targetValue !== undefined
    ) {
      const initial = parseFloat(goal.initialValue.toString());
      const target = parseFloat(goal.targetValue.toString());
      const current = parseFloat(value.toString());

      // Calculate progress based on goal direction
      if (initial === target) {
        // If initial and target are the same, progress is 100% when current matches
        progress = current === initial ? 100 : 0;
      } else {
        // Calculate progress as a percentage between initial and target
        const progressValue = ((current - initial) / (target - initial)) * 100;
        progress = Math.min(100, Math.max(0, progressValue));
      }

      // Check if goal is achieved
      const isDecreasingGoal = target < initial;
      const isIncreasingGoal = target > initial;

      if (
        (isDecreasingGoal && current <= target) ||
        (isIncreasingGoal && current >= target) ||
        current === target
      ) {
        status = "completed";
        completedDate = new Date();
        progress = 100;
        goalAchieved = true;
      }
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
  } catch {
    return NextResponse.json(
      { error: "Error al añadir actualización de progreso" },
      { status: 500 },
    );
  }
}
