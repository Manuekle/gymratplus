import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function POST(
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
    const { name, dosage, frequency, description } = body;

    // Validate required fields
    if (!name || !dosage || !frequency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    // Create the supplement
    const supplement = await prisma.planSupplement.create({
      data: {
        foodPlanId: id,
        name,
        dosage,
        frequency,
        description,
      },
    });

    return NextResponse.json(supplement);
  } catch (error) {
    console.error("Error creating supplement:", error);
    return NextResponse.json(
      { error: "Failed to create supplement" },
      { status: 500 }
    );
  }
}

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
          error: "Food plan not found or you do not have permission to view it",
        },
        { status: 404 }
      );
    }

    // Get the supplements
    const supplements = await prisma.planSupplement.findMany({
      where: {
        foodPlanId: id,
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
