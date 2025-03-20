import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authRoute } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET a specific meal log
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authRoute);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const mealLogId = params.id;

    const mealLog = await prisma.mealLog.findUnique({
      where: {
        id: mealLogId,
      },
      include: {
        food: true,
        recipe: true,
      },
    });

    if (!mealLog) {
      return NextResponse.json(
        { error: "Meal log not found" },
        { status: 404 }
      );
    }

    if (mealLog.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(mealLog);
  } catch (error) {
    console.error("Error fetching meal log:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal log" },
      { status: 500 }
    );
  }
}

// DELETE a meal log
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authRoute);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const mealLogId = params.id;

    // Check if the meal log exists and belongs to the user
    const mealLog = await prisma.mealLog.findUnique({
      where: {
        id: mealLogId,
      },
    });

    if (!mealLog) {
      return NextResponse.json(
        { error: "Meal log not found" },
        { status: 404 }
      );
    }

    if (mealLog.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the meal log
    await prisma.mealLog.delete({
      where: {
        id: mealLogId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meal log:", error);
    return NextResponse.json(
      { error: "Failed to delete meal log" },
      { status: 500 }
    );
  }
}
