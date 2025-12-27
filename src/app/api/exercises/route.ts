import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const muscle = searchParams.get("muscle") || "";
    const difficulty = searchParams.get("difficulty") || "";

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

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        difficulty: true,
        equipment: true,
        muscleGroup: true,
        // primaryMuscles: true, // Not in schema
        // secondaryMuscles: true, // Not in schema
        // instructions: false // Exclude heavy fields if not necessary in list view
      },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Error fetching exercises" },
      { status: 500 },
    );
  }
}
