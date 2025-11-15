import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany();
    return NextResponse.json(exercises);
  } catch {
    return NextResponse.json(
      { error: "Error fetching exercises" },
      { status: 500 },
    );
  }
}
