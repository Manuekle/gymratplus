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

    // Fetch Weight History (From Weight model OR ProgressPhoto)
    // Preference: Weight model if populated, else ProgressPhoto
    const weightHistory = await prisma.weight.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      select: { date: true, weight: true },
    });

    const photoWeights = await prisma.progressPhoto.findMany({
      where: { userId, weight: { not: null } },
      orderBy: { date: "asc" },
      select: { date: true, weight: true },
    });

    // Merge and sort
    const allWeights = [...weightHistory, ...photoWeights]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((w) => ({
        date: new Date(w.date).toLocaleDateString(),
        weight: w.weight,
      }));

    // Fetch Strength Stats (Max Weight per Exercise per Month?)
    // This is expensive if we query all. Let's get top 3 exercises by volume.
    // For now, let's just return raw data for the last 6 months for a few key exercises if they exist.
    // Simplifying: Just get recent workout sessions and extract volume.

    // NOTE: Detailed analytics usually requires aggregation queries (GROUP BY).
    // Prisma doesn't do complex GROUP BY easily on nested relations.
    // We will do a simple fetch of recent sets for now.

    return NextResponse.json({
      weightHistory: allWeights,
      strengthStats: [], // Placeholder for now to avoid slow query complexity in V1
    });
  } catch (error) {
    console.error("Progress stats error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
