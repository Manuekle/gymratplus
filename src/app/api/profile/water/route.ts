import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { waterIntake } = await req.json();
    if (typeof waterIntake !== "number" || waterIntake < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid water intake value" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const currentTime = new Date();

    // Crear un nuevo registro de agua
    const newWaterLog = await prisma.mealLog.create({
      data: {
        userId,
        mealType: "water_tracking",
        consumedAt: currentTime,
        quantity: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        waterIntake,
      },
    });

    return NextResponse.json(
      { success: true, message: "Water intake recorded", data: newWaterLog },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating water intake record:", error);
    return NextResponse.json(
      { success: false, message: "Failed to record water intake" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { waterIntake } = await req.json();
    if (typeof waterIntake !== "number" || waterIntake < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid water intake value" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar si hay un registro de agua para hoy
    const existingMealLog = await prisma.mealLog.findFirst({
      where: {
        userId,
        consumedAt: { gte: today, lt: tomorrow },
        waterIntake: { not: null },
      },
    });

    if (!existingMealLog) {
      return NextResponse.json(
        { success: false, message: "No water intake record found for today" },
        { status: 404 }
      );
    }

    // Actualizar el registro existente
    const updatedMealLog = await prisma.mealLog.update({
      where: { id: existingMealLog.id },
      data: { waterIntake, updatedAt: new Date() },
    });

    return NextResponse.json(
      { success: true, message: "Water intake updated", data: updatedMealLog },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating water intake:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update water intake" },
      { status: 500 }
    );
  }
}
