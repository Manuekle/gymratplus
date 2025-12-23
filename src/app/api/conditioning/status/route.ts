import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch Profile and Last Workout
    const [profile, lastSession] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId },
        select: { monthsTraining: true, createdAt: true },
      }),
      prisma.workoutSession.findFirst({
        where: { userId, completed: true },
        orderBy: { date: "desc" },
      }),
    ]);

    let recommended = false;
    let reason = "";

    // Criterion 1: New User (monthsTraining < 1 or null)
    if (!profile?.monthsTraining || profile.monthsTraining < 1) {
      recommended = true;
      reason = "new_user";
    }

    // Criterion 2: Inactive (Last workout > 30 days ago)
    if (lastSession) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (new Date(lastSession.date) < thirtyDaysAgo) {
        recommended = true;
        reason = "returning";
      }
    } else if (!recommended) {
      // No workouts ever? Treat as new user if not already set
      recommended = true;
      reason = "new_user";
    }

    return NextResponse.json({ recommended, reason });
  } catch (error) {
    console.error("Conditioning status error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
