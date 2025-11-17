import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { createFoodRecommendationNormalized } from "@/lib/nutrition/food-recommendation-helpers";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario sea un instructor
    const instructor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isInstructor: true },
    });

    if (!instructor?.isInstructor) {
      return NextResponse.json(
        { error: "Solo los instructores pueden crear planes de alimentación" },
        { status: 403 },
      );
    }

    const { studentId, name, meals, macros, calorieTarget, notes } =
      await request.json();

    // Validar que name sea string si está presente
    const planName = name && typeof name === "string" ? name.trim() : undefined;

    if (!studentId) {
      return NextResponse.json(
        { error: "ID de estudiante requerido" },
        { status: 400 },
      );
    }

    if (!meals || !macros || !calorieTarget) {
      return NextResponse.json(
        {
          error:
            "Datos del plan incompletos. Se requieren meals, macros y calorieTarget",
        },
        { status: 400 },
      );
    }

    // Obtener el perfil del instructor
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!instructorProfile) {
      return NextResponse.json(
        { error: "Perfil de instructor no encontrado" },
        { status: 404 },
      );
    }

    // Validar que el estudiante esté asignado al instructor
    const studentRelationship = await prisma.studentInstructor.findFirst({
      where: {
        studentId: studentId,
        instructorProfileId: instructorProfile.id,
        status: "active",
      },
    });

    if (!studentRelationship) {
      return NextResponse.json(
        {
          error:
            "No tienes permiso para crear planes de alimentación para este estudiante",
        },
        { status: 403 },
      );
    }

    // Extraer valores numéricos de macros si están en formato "224g (39%)"
    let proteinTarget: number | undefined;
    let carbsTarget: number | undefined;
    let fatTarget: number | undefined;

    if (macros.protein) {
      const proteinMatch = String(macros.protein).match(/(\d+(?:\.\d+)?)/);
      if (proteinMatch) {
        proteinTarget = parseFloat(proteinMatch[1]);
      }
    }
    if (macros.carbs) {
      const carbsMatch = String(macros.carbs).match(/(\d+(?:\.\d+)?)/);
      if (carbsMatch) {
        carbsTarget = parseFloat(carbsMatch[1]);
      }
    }
    if (macros.fat) {
      const fatMatch = String(macros.fat).match(/(\d+(?:\.\d+)?)/);
      if (fatMatch) {
        fatTarget = parseFloat(fatMatch[1]);
      }
    }

    // Crear el plan usando la nueva estructura normalizada
    const foodRecommendation = await createFoodRecommendationNormalized({
      userId: studentId,
      instructorId: session.user.id,
      assignedToId: studentId,
      name: planName, // Nombre personalizado del plan
      calorieTarget: Math.round(calorieTarget),
      proteinTarget,
      carbsTarget,
      fatTarget,
      description: macros.description,
      notes: notes || undefined,
      meals: {
        breakfast: meals.breakfast,
        lunch: meals.lunch,
        dinner: meals.dinner,
        snacks: meals.snacks,
      },
    });

    // Retornar en formato compatible
    return NextResponse.json({
      id: foodRecommendation.id,
      userId: foodRecommendation.userId,
      instructorId: foodRecommendation.instructorId,
      assignedToId: foodRecommendation.assignedToId,
      date: foodRecommendation.date,
      name: foodRecommendation.name,
      calorieTarget: foodRecommendation.calorieTarget,
      notes: foodRecommendation.notes,
      createdAt: foodRecommendation.createdAt,
      updatedAt: foodRecommendation.updatedAt,
    });
  } catch (error) {
    console.error("Error al crear el plan de alimentación:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor al crear el plan de alimentación",
      },
      { status: 500 },
    );
  }
}
