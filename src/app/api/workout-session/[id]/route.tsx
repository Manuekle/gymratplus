import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth/next";
import { publishNotification } from "@/lib/database/redis";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const workoutSessionId = id;

    if (!workoutSessionId) {
      return NextResponse.json(
        { error: "ID de la sesión de entrenamiento no proporcionado" },
        { status: 400 },
      );
    }

    // Verificar que la sesión pertenece al usuario
    const workoutSession = await prisma.workoutSession.findUnique({
      where: { id: workoutSessionId },
      include: {
        workout: {
          select: { name: true },
        },
      },
    });

    if (!workoutSession) {
      return NextResponse.json(
        { error: "Sesión de entrenamiento no encontrada" },
        { status: 404 },
      );
    }

    if (workoutSession.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar esta sesión de entrenamiento" },
        { status: 403 },
      );
    }

    // Get workout name before deletion
    const workoutName = workoutSession.workout?.name || "Entrenamiento";

    // Eliminar primero los sets
    await prisma.setSession.deleteMany({
      where: {
        exerciseSession: {
          workoutSessionId,
        },
      },
    });

    // Eliminar los ejercicios
    await prisma.exerciseSession.deleteMany({
      where: { workoutSessionId },
    });

    // Eliminar la sesión de entrenamiento
    await prisma.workoutSession.delete({
      where: { id: workoutSessionId },
    });

    // Create notification for workout cancellation
    try {
      // Check if user has notifications enabled
      const userProfile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { notificationsActive: true },
      });

      if (userProfile?.notificationsActive !== false) {
        // Default to true if not set
        // Add to Redis list for polling (the subscriber will create the notification)
        await publishNotification(session.user.id, {
          type: "workout",
          title: "Entrenamiento cancelado",
          message: `Has cancelado la sesión de entrenamiento "${workoutName}".`,
        });

        console.log(
          `Workout cancellation notification published for user ${session.user.id}`,
        );
      }
    } catch (notificationError) {
      // Log but don't fail the request if notification creation fails
      console.error(
        "Error publishing workout cancellation notification:",
        notificationError,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar la sesión de entrenamiento:", error);
    return NextResponse.json(
      { error: "Error al eliminar la sesión de entrenamiento" },
      { status: 500 },
    );
  }
}
