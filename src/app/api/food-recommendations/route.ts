/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { nutritionPlan } = body;

    // Extract the necessary data from the nutrition plan
    const { macros, meals, calorieTarget } = nutritionPlan;

    // Create the food recommendation with stringified JSON
    const foodRecommendation = await prisma.foodRecommendation.create({
      data: {
        userId: session.user.id,
        macros: JSON.stringify(macros),
        meals: JSON.stringify(meals),
        calorieTarget,
      },
    });

    return NextResponse.json(foodRecommendation);
  } catch (error) {
    console.error("Error saving food recommendation:", error);
    return NextResponse.json(
      { error: "Failed to save food recommendation" },
      { status: 500 },
    );
  }
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const foodRecommendations = await prisma.foodRecommendation.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(foodRecommendations);
  } catch (error) {
    console.error("Error fetching food recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch food recommendations" },
      { status: 500 },
    );
  }
}
