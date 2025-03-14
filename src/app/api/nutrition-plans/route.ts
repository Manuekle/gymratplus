import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET all nutrition plans for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const nutritionPlans = await prisma.nutritionPlan.findMany({
      where: {
        userId: userId,
      },
      include: {
        days: {
          include: {
            meals: {
              include: {
                food: true,
                recipe: true,
              },
            },
          },
        },
        supplements: {
          include: {
            supplement: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(nutritionPlans);
  } catch (error) {
    console.error("Error fetching nutrition plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition plans" },
      { status: 500 }
    );
  }
}

// POST create a new nutrition plan
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create the nutrition plan
    const nutritionPlan = await prisma.nutritionPlan.create({
      data: {
        name: data.name,
        description: data.description || "",
        userId: userId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive || false,
        targetCalories: data.targetCalories || null,
        targetProtein: data.targetProtein || null,
        targetCarbs: data.targetCarbs || null,
        targetFat: data.targetFat || null,
      },
    });

    return NextResponse.json(nutritionPlan);
  } catch (error) {
    console.error("Error creating nutrition plan:", error);
    return NextResponse.json(
      { error: "Failed to create nutrition plan" },
      { status: 500 }
    );
  }
}
