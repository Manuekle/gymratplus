import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WorkoutStreakService } from "@/lib/workout-streak-service";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: "Usuario no válido" }, { status: 400 });
    }

    const streakService = new WorkoutStreakService();
    const stats = await streakService.getStreakStats(userId);

    return NextResponse.json(stats);
  } catch (error: unknown) {
    console.error("Error en GET /api/workout-streak:", error);

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const isWorkout = searchParams.get("isWorkout") === "true";

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: "Usuario no válido" }, { status: 400 });
    }

    const streakService = new WorkoutStreakService();
    const streak = await streakService.updateStreak(userId, isWorkout);

    return NextResponse.json(streak);
  } catch (error) {
    console.error("Error en POST /api/workout-streak:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
