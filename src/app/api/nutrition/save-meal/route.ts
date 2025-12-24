import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    const data = await req.json();
    const {
      foodName,
      calories,
      protein,
      carbs,
      fat,
      mealType,
      quantity,
      consumedAt,
    } = data;

    // Validate required fields
    if (
      !foodName ||
      calories === undefined ||
      protein === undefined ||
      carbs === undefined ||
      fat === undefined ||
      !mealType
    ) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 },
      );
    }

    // Create meal log entry
    const mealLog = await prisma.mealLog.create({
      data: {
        userId: session.user.id,
        mealType,
        consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
        foodId: null, // Custom food not in database
        recipeId: null,
        quantity: quantity || 1,
        calories: Math.round(calories),
        protein: Number.parseFloat(protein.toFixed(2)),
        carbs: Number.parseFloat(carbs.toFixed(2)),
        fat: Number.parseFloat(fat.toFixed(2)),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${foodName} guardado correctamente`,
      mealLog,
    });
  } catch (error) {
    console.error("Error saving meal:", error);
    return NextResponse.json(
      { error: "Error al guardar la comida" },
      { status: 500 },
    );
  }
}
