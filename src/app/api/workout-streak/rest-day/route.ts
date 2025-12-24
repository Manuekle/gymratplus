import { NextResponse } from "next/server";
import { WorkoutStreakService } from "@/lib/workout/workout-streak-service";
import { auth } from "@auth";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const streakService = new WorkoutStreakService();
    const streak = await streakService.updateStreak(session.user.id, false);

    return NextResponse.json(streak);
  } catch (error) {
    console.error("Error en POST /api/workout-streak/rest-day:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
