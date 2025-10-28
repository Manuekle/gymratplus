import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createGoalCompletedNotification,
  publishGoalNotification,
} from "@/lib/goal-notifications";
import { createNotification } from "@/lib/notification-service";

// PUT /api/goals/[id] - Actualizar un objetivo específico
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

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

    const body = await request.json();
    const { title, description, targetValue, unit, targetDate, status } = body;

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
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Objetivo no encontrado" },
        { status: 404 },
      );
    }

    // Preparar datos para actualizar
    const updateData: {
      title?: string;
      description?: string;
      targetValue?: number;
      unit?: string;
      targetDate?: Date;
      status?: string;
      completedDate?: Date;
      progress?: number;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (targetValue !== undefined) updateData.targetValue = targetValue;
    if (unit !== undefined) updateData.unit = unit;
    if (targetDate !== undefined) updateData.targetDate = new Date(targetDate);

    // Si se está completando el objetivo
    let wasCompleted = false;
    if (status === "completed" && existingGoal.status !== "completed") {
      updateData.status = "completed";
      updateData.completedDate = new Date();
      updateData.progress = 100;
      wasCompleted = true;
    }
    // Si se está abandonando o reactivando
    else if (status !== undefined) {
      updateData.status = status;
    }

    // Actualizar el objetivo
    const updatedGoal = await prisma.goal.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    // Create notification for goal update
    try {
      // Check if user has notifications enabled
      const userProfile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { notificationsActive: true },
      });

      if (userProfile?.notificationsActive !== false) {
        // Default to true if not set
        const goalTitle = updatedGoal.title;

        if (wasCompleted) {
          // Create notification for goal completion
          await createGoalCompletedNotification(user.id, goalTitle);

          // Add to Redis list for polling
          await publishGoalNotification(user.id, "completed", goalTitle);

          console.log(
            `Goal completion notification created for user ${user.id}`,
          );
        } else {
          // Create notification for goal update
          await createNotification({
            userId: user.id,
            title: "Objetivo actualizado",
            message: `Has actualizado tu objetivo: ${goalTitle}`,
            type: "goal",
          });

          // Add to Redis list for polling
          await publishGoalNotification(user.id, "updated", goalTitle);

          console.log(`Goal update notification created for user ${user.id}`);
        }
      }
    } catch (notificationError) {
      // Log but don't fail the request if notification creation fails
      console.error(
        "Error creating goal update notification:",
        notificationError,
      );
    }

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error al actualizar objetivo:", error);
    return NextResponse.json(
      { error: "Error al actualizar objetivo" },
      { status: 500 },
    );
  }
}

// DELETE /api/goals/[id] - Eliminar un objetivo específico
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

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
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Objetivo no encontrado" },
        { status: 404 },
      );
    }

    // Eliminar el objetivo
    await prisma.goal.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Objetivo eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar objetivo:", error);
    return NextResponse.json(
      { error: "Error al eliminar objetivo" },
      { status: 500 },
    );
  }
}
