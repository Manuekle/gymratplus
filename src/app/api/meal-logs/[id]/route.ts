import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

const prisma = new PrismaClient();

// GET a specific meal log
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Meal log ID is required" },
        { status: 400 },
      );
    }

    const mealLogId = id;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

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
        { status: 404 },
      );
    }

    if (mealLog.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(mealLog);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch meal log" },
      { status: 500 },
    );
  }
}

// DELETE a meal log
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Meal log ID is required" },
        { status: 400 },
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const mealLogId = id;

    // Check if the meal log exists and belongs to the user
    const mealLog = await prisma.mealLog.findUnique({
      where: {
        id: mealLogId,
      },
    });

    if (!mealLog) {
      return NextResponse.json(
        { error: "Meal log not found" },
        { status: 404 },
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
  } catch {
    return NextResponse.json(
      { error: "Failed to delete meal log" },
      { status: 500 },
    );
  }
}
