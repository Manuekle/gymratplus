import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authRoute } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany();
    return NextResponse.json(exercises);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error obteniendo ejercicios" },
      { status: 500 }
    );
  }
}
