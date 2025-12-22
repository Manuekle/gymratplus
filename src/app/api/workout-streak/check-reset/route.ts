import { NextResponse, NextRequest } from "next/server";
import { WorkoutStreakService } from "@/lib/workout/workout-streak-service";
import { auth } from "../../../../../../../../../../auth";

/**
 * Endpoint para verificar y resetear rachas
 * Se debe llamar periódicamente (cada hora o desde un cron job)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { userId } = await request.json();

    // Si se proporciona un userId específico, verificar solo ese usuario
    // Si no, verificar todos los usuarios (para uso de cron jobs)
    if (userId && userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const streakService = new WorkoutStreakService();

    if (userId) {
      // Verificar un usuario específico
      const result = await streakService.checkAndResetStreak(userId);
      return NextResponse.json(result);
    } else {
      // Verificar todos los usuarios (requiere permisos especiales)
      // Por ahora, solo permitir verificar el usuario actual
      const result = await streakService.checkAndResetStreak(session.user.id);
      return NextResponse.json(result);
    }
  } catch (error: unknown) {
    console.error("Error en POST /api/workout-streak/check-reset:", error);

    if (error instanceof Error && error.message === "User not found") {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

/**
 * Endpoint para enviar notificaciones en el día crítico
 * Se debe llamar cada 2 horas
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { userId } = await request.json();

    if (userId && userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const streakService = new WorkoutStreakService();
    const targetUserId = userId || session.user.id;

    const result =
      await streakService.sendCriticalDayNotifications(targetUserId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error en PUT /api/workout-streak/check-reset:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
