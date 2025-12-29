import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { getCached, CacheKeys } from "@/lib/cache/redis";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const muscle = searchParams.get("muscle") || "";
    const difficulty = searchParams.get("difficulty") || "";

    // Build cache key based on filters
    const cacheKey = CacheKeys.EXERCISES_FILTERED(muscle, difficulty, search);

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (muscle && muscle !== "all") {
      where.muscleGroup = muscle;
    }

    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }

    // Use cache for exercises query
    const exercises = await getCached(
      cacheKey,
      () =>
        prisma.exercise.findMany({
          where,
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            difficulty: true,
            equipment: true,
            muscleGroup: true,
          },
        }),
      3600, // Cache for 1 hour
    );

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Error fetching exercises" },
      { status: 500 },
    );
  }
}
