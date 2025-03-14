import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET a specific supplement in a nutrition plan
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; supplementId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = params.id;
    const supplementId = params.supplementId;

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

    // Get the supplement
    const planSupplement = await prisma.planSupplement.findUnique({
      where: {
        nutritionPlanId_supplementId: {
          nutritionPlanId: planId,
          supplementId: supplementId,
        },
      },
      include: {
        supplement: true,
      },
    });

    if (!planSupplement) {
      return NextResponse.json(
        { error: "Supplement not found in this plan" },
        { status: 404 }
      );
    }

    return NextResponse.json(planSupplement);
  } catch (error) {
    console.error("Error fetching supplement:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplement" },
      { status: 500 }
    );
  }
}

// PUT update a specific supplement in a nutrition plan
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; supplementId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = params.id;
    const supplementId = params.supplementId;
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

    // Check if the supplement exists in the plan
    const existingSupplement = await prisma.planSupplement.findUnique({
      where: {
        nutritionPlanId_supplementId: {
          nutritionPlanId: planId,
          supplementId: supplementId,
        },
      },
    });

    if (!existingSupplement) {
      return NextResponse.json(
        { error: "Supplement not found in this plan" },
        { status: 404 }
      );
    }

    // Update the supplement
    const updatedSupplement = await prisma.planSupplement.update({
      where: {
        nutritionPlanId_supplementId: {
          nutritionPlanId: planId,
          supplementId: supplementId,
        },
      },
      data: {
        dosage:
          data.dosage !== undefined ? data.dosage : existingSupplement.dosage,
        timing:
          data.timing !== undefined ? data.timing : existingSupplement.timing,
        frequency:
          data.frequency !== undefined
            ? data.frequency
            : existingSupplement.frequency,
        notes: data.notes !== undefined ? data.notes : existingSupplement.notes,
      },
      include: {
        supplement: true,
      },
    });

    return NextResponse.json(updatedSupplement);
  } catch (error) {
    console.error("Error updating supplement:", error);
    return NextResponse.json(
      { error: "Failed to update supplement" },
      { status: 500 }
    );
  }
}

// DELETE a specific supplement from a nutrition plan
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; supplementId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const planId = params.id;
    const supplementId = params.supplementId;

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

    // Check if the supplement exists in the plan
    const existingSupplement = await prisma.planSupplement.findUnique({
      where: {
        nutritionPlanId_supplementId: {
          nutritionPlanId: planId,
          supplementId: supplementId,
        },
      },
    });

    if (!existingSupplement) {
      return NextResponse.json(
        { error: "Supplement not found in this plan" },
        { status: 404 }
      );
    }

    // Delete the supplement from the plan
    await prisma.planSupplement.delete({
      where: {
        nutritionPlanId_supplementId: {
          nutritionPlanId: planId,
          supplementId: supplementId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting supplement:", error);
    return NextResponse.json(
      { error: "Failed to delete supplement" },
      { status: 500 }
    );
  }
}
