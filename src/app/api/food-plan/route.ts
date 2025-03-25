/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const foodPlans = await prisma.foodPlan.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        supplements: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(foodPlans);
  } catch (error) {
    console.error("Error fetching food plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch food plans" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      description,
      goal,
      calorieTarget,
      protein,
      carbs,
      fat,
      isActive,
      supplements,
    } = body;

    // Validate required fields
    if (!name || !goal || !calorieTarget || !protein || !carbs || !fat) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If this plan is set as active, deactivate all other plans
    if (isActive) {
      await prisma.foodPlan.updateMany({
        where: {
          userId: session.user.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    // Create the food plan
    const foodPlan = await prisma.foodPlan.create({
      data: {
        userId: session.user.id,
        name,
        description,
        goal,
        calorieTarget,
        protein,
        carbs,
        fat,
        isActive: isActive || false,
        supplements: supplements
          ? {
              create: supplements.map((supplement: any) => ({
                name: supplement.name,
                dosage: supplement.dosage,
                frequency: supplement.frequency,
                description: supplement.description,
              })),
            }
          : undefined,
      },
      include: {
        supplements: true,
      },
    });

    return NextResponse.json(foodPlan);
  } catch (error) {
    console.error("Error creating food plan:", error);
    return NextResponse.json(
      { error: "Failed to create food plan" },
      { status: 500 }
    );
  }
}
