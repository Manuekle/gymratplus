import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET all days for a nutrition plan
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = params.id;

    // Check if the plan exists and belongs to the user
    const existingPlan = await prisma.nutritionPlan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Nutrition plan not found" },
        { status: 404 }
      );
    }

    if (existingPlan.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all days for the plan
    const days = await prisma.nutritionDay.findMany({
      where: {
        nutritionPlanId: planId,
      },
      include: {
        meals: {
          include: {
            food: true,
            recipe: true,
          },
        },
      },
      orderBy: {
        dayNumber: "asc",
      },
    });

    return NextResponse.json(days);
  } catch (error) {
    console.error("Error fetching nutrition days:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition days" },
      { status: 500 }
    );
  }
}

// POST create a new day for a nutrition plan
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = params.id;
    const data = await req.json();

    // Check if the plan exists and belongs to the user
    const existingPlan = await prisma.nutritionPlan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Nutrition plan not found" },
        { status: 404 }
      );
    }

    if (existingPlan.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Validate required fields
    if (!data.dayNumber) {
      return NextResponse.json(
        { error: "Day number is required" },
        { status: 400 }
      );
    }

    // Check if the day already exists
    const existingDay = await prisma.nutritionDay.findUnique({
      where: {
        nutritionPlanId_dayNumber: {
          nutritionPlanId: planId,
          dayNumber: data.dayNumber,
        },
      },
    });

    if (existingDay) {
      return NextResponse.json(
        { error: "Day already exists in this plan" },
        { status: 400 }
      );
    }

    // Create the day
    const day = await prisma.nutritionDay.create({
      data: {
        nutritionPlanId: planId,
        dayNumber: data.dayNumber,
        dayName: data.dayName || null,
      },
    });

    return NextResponse.json(day);
  } catch (error) {
    console.error("Error creating nutrition day:", error);
    return NextResponse.json(
      { error: "Failed to create nutrition day" },
      { status: 500 }
    );
  }
}
