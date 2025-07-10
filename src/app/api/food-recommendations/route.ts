import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

interface NutritionPlan {
  macros: object;
  meals: object[];
  calorieTarget: number;
}

interface RequestBody {
  nutritionPlan: NutritionPlan;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: RequestBody = await req.json();
    const { nutritionPlan } = body;

    // Validate required fields
    if (!nutritionPlan || !nutritionPlan.macros || !nutritionPlan.meals || nutritionPlan.calorieTarget === undefined) {
      return NextResponse.json(
        { error: "Missing required fields in nutrition plan" },
        { status: 400 }
      );
    }

    // Extract the necessary data from the nutrition plan
    const { macros, meals, calorieTarget } = nutritionPlan;

    // Create the food recommendation with stringified JSON
    const foodRecommendation = await prisma.foodRecommendation.create({
      data: {
        userId: session.user.id,
        macros: JSON.stringify(macros),
        meals: JSON.stringify(meals),
        calorieTarget: Number(calorieTarget),
      },
    });

    return NextResponse.json(foodRecommendation);
  } catch (error: unknown) {
    console.error("Error saving food recommendation:", error);
    return NextResponse.json(
      { error: "Failed to save food recommendation" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 });
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
  } catch (error: unknown) {
    console.error("Error fetching food recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch food recommendations" },
      { status: 500 },
    );
  }
}
