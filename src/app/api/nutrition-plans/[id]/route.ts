import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET a specific nutrition plan
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

    const nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: {
        id: planId,
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
    });

    if (!nutritionPlan) {
      return NextResponse.json(
        { error: "Nutrition plan not found" },
        { status: 404 }
      );
    }

    if (nutritionPlan.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(nutritionPlan);
  } catch (error) {
    console.error("Error fetching nutrition plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition plan" },
      { status: 500 }
    );
  }
}

// PUT update a nutrition plan
export async function PUT(
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

    // Update the nutrition plan
    const updatedPlan = await prisma.nutritionPlan.update({
      where: {
        id: planId,
      },
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive,
        targetCalories: data.targetCalories,
        targetProtein: data.targetProtein,
        targetCarbs: data.targetCarbs,
        targetFat: data.targetFat,
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("Error updating nutrition plan:", error);
    return NextResponse.json(
      { error: "Failed to update nutrition plan" },
      { status: 500 }
    );
  }
}

// DELETE a nutrition plan
export async function DELETE(
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

    // Delete the nutrition plan (cascade will delete related days, meals, etc.)
    await prisma.nutritionPlan.delete({
      where: {
        id: planId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting nutrition plan:", error);
    return NextResponse.json(
      { error: "Failed to delete nutrition plan" },
      { status: 500 }
    );
  }
}
