import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET a specific day in a nutrition plan
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; dayNumber: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = params.id;
    const dayNumber = Number.parseInt(params.dayNumber);

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

    // Get the specific day
    const day = await prisma.nutritionDay.findUnique({
      where: {
        nutritionPlanId_dayNumber: {
          nutritionPlanId: planId,
          dayNumber: dayNumber,
        },
      },
      include: {
        meals: {
          include: {
            food: true,
            recipe: true,
          },
        },
      },
    });

    if (!day) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    return NextResponse.json(day);
  } catch (error) {
    console.error("Error fetching nutrition day:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition day" },
      { status: 500 }
    );
  }
}

// PUT update a specific day in a nutrition plan
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; dayNumber: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = params.id;
    const dayNumber = Number.parseInt(params.dayNumber);
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

    // Check if the day exists
    const existingDay = await prisma.nutritionDay.findUnique({
      where: {
        nutritionPlanId_dayNumber: {
          nutritionPlanId: planId,
          dayNumber: dayNumber,
        },
      },
    });

    if (!existingDay) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    // Update the day
    const updatedDay = await prisma.nutritionDay.update({
      where: {
        nutritionPlanId_dayNumber: {
          nutritionPlanId: planId,
          dayNumber: dayNumber,
        },
      },
      data: {
        dayName: data.dayName,
      },
    });

    return NextResponse.json(updatedDay);
  } catch (error) {
    console.error("Error updating nutrition day:", error);
    return NextResponse.json(
      { error: "Failed to update nutrition day" },
      { status: 500 }
    );
  }
}

// DELETE a specific day in a nutrition plan
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; dayNumber: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = params.id;
    const dayNumber = Number.parseInt(params.dayNumber);

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

    // Check if the day exists
    const existingDay = await prisma.nutritionDay.findUnique({
      where: {
        nutritionPlanId_dayNumber: {
          nutritionPlanId: planId,
          dayNumber: dayNumber,
        },
      },
    });

    if (!existingDay) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    // Delete the day (cascade will delete related meals)
    await prisma.nutritionDay.delete({
      where: {
        nutritionPlanId_dayNumber: {
          nutritionPlanId: planId,
          dayNumber: dayNumber,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting nutrition day:", error);
    return NextResponse.json(
      { error: "Failed to delete nutrition day" },
      { status: 500 }
    );
  }
}
