import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { getFoodRecommendationUnified } from "@/lib/nutrition/food-recommendation-helpers";
import { auth } from "../../../../../auth.ts";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const foodPlanId = params.id;

    // Verificar si el usuario es instructor
    const instructorProfile = await prisma.instructorProfile.findFirst({
      where: { userId: session.user.id },
      select: { id: true },
    });

    // Verificar que el usuario tiene acceso al plan
    // Puede ser: el dueño del plan, el asignado, o el instructor que lo creó
    const foodPlan = await prisma.foodRecommendation.findFirst({
      where: {
        id: foodPlanId,
        OR: [
          { userId: session.user.id },
          { assignedToId: session.user.id },
          ...(instructorProfile ? [{ instructorId: session.user.id }] : []),
        ],
      },
    });

    if (!foodPlan) {
      return NextResponse.json(
        { error: "Plan de alimentación no encontrado" },
        { status: 404 },
      );
    }

    // Usar helper unificado que soporta ambas estructuras
    const unifiedPlan = await getFoodRecommendationUnified(foodPlanId);

    if (!unifiedPlan) {
      return NextResponse.json(
        { error: "Error al procesar el plan de alimentación" },
        { status: 500 },
      );
    }

    return NextResponse.json(unifiedPlan);
  } catch (error) {
    console.error("Error al obtener el plan de alimentación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
