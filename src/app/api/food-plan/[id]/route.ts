import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    const foodPlan = await prisma.foodPlan.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        supplements: true,
      },
    });

    if (!foodPlan) {
      return NextResponse.json(
        { error: "Food plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(foodPlan);
  } catch (error) {
    console.error("Error fetching food plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch food plan" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
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
    } = body;

    // Check if the plan belongs to the user
    const existingPlan = await prisma.foodPlan.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        {
          error:
            "Food plan not found or you do not have permission to update it",
        },
        { status: 404 }
      );
    }

    // If this plan is set as active, deactivate all other plans
    if (isActive) {
      await prisma.foodPlan.updateMany({
        where: {
          userId: session.user.id,
          isActive: true,
          id: { not: id },
        },
        data: {
          isActive: false,
        },
      });
    }

    // Update the food plan
    const foodPlan = await prisma.foodPlan.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        goal,
        calorieTarget,
        protein,
        carbs,
        fat,
        isActive,
      },
      include: {
        supplements: true,
      },
    });

    return NextResponse.json(foodPlan);
  } catch (error) {
    console.error("Error updating food plan:", error);
    return NextResponse.json(
      { error: "Failed to update food plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    // Check if the plan belongs to the user
    const existingPlan = await prisma.foodPlan.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        {
          error:
            "Food plan not found or you do not have permission to delete it",
        },
        { status: 404 }
      );
    }

    // Delete the food plan
    await prisma.foodPlan.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting food plan:", error);
    return NextResponse.json(
      { error: "Failed to delete food plan" },
      { status: 500 }
    );
  }
}
