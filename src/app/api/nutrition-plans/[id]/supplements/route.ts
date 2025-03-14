import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET all supplements for a nutrition plan
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

    // Get all supplements for the plan
    const supplements = await prisma.planSupplement.findMany({
      where: {
        nutritionPlanId: planId,
      },
      include: {
        supplement: true,
      },
    });

    return NextResponse.json(supplements);
  } catch (error) {
    console.error("Error fetching supplements:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplements" },
      { status: 500 }
    );
  }
}

// POST add a supplement to a nutrition plan
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
    if (!data.supplementId) {
      return NextResponse.json(
        { error: "Supplement ID is required" },
        { status: 400 }
      );
    }

    // Check if the supplement exists
    const supplement = await prisma.supplement.findUnique({
      where: {
        id: data.supplementId,
      },
    });

    if (!supplement) {
      return NextResponse.json(
        { error: "Supplement not found" },
        { status: 404 }
      );
    }

    // Check if the supplement is already in the plan
    const existingSupplement = await prisma.planSupplement.findUnique({
      where: {
        nutritionPlanId_supplementId: {
          nutritionPlanId: planId,
          supplementId: data.supplementId,
        },
      },
    });

    if (existingSupplement) {
      return NextResponse.json(
        { error: "Supplement already in this plan" },
        { status: 400 }
      );
    }

    // Add the supplement to the plan
    const planSupplement = await prisma.planSupplement.create({
      data: {
        nutritionPlanId: planId,
        supplementId: data.supplementId,
        dosage: data.dosage || supplement.dosage,
        timing: data.timing || supplement.timing,
        frequency: data.frequency || null,
        notes: data.notes || null,
      },
      include: {
        supplement: true,
      },
    });

    return NextResponse.json(planSupplement);
  } catch (error) {
    console.error("Error adding supplement:", error);
    return NextResponse.json(
      { error: "Failed to add supplement" },
      { status: 500 }
    );
  }
}
