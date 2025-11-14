import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import {
  createNutritionPlan,
  type NutritionPlan,
} from "@/lib/nutrition/nutrition-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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
        { error: "Solo los instructores pueden acceder a esta información" },
        { status: 403 },
      );
    }

    const studentId = params.id;

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
          error: "No tienes permiso para acceder al perfil de este estudiante",
        },
        { status: 403 },
      );
    }

    // Obtener el perfil del estudiante
    const studentProfile = await prisma.profile.findUnique({
      where: { userId: studentId },
      select: {
        dailyCalorieTarget: true,
        dailyProteinTarget: true,
        dailyCarbTarget: true,
        dailyFatTarget: true,
        goal: true,
        dietaryPreference: true,
      },
    });

    if (!studentProfile) {
      return NextResponse.json(
        {
          error:
            "El estudiante no tiene un perfil completo. Por favor, pídele que complete su perfil primero.",
        },
        { status: 404 },
      );
    }

    // Generar el plan nutricional
    // NOTA: Esta función solo genera el plan en memoria, NO guarda nada en la base de datos
    // El plan solo se guarda cuando el instructor presiona "Crear Plan" en el frontend
    const nutritionPlan = await createNutritionPlan({
      userId: studentId,
      goal: studentProfile.goal || "maintain",
      dietaryPreference: studentProfile.dietaryPreference || "no-preference",
      dailyCalorieTarget: studentProfile.dailyCalorieTarget || 2000,
      dailyProteinTarget: studentProfile.dailyProteinTarget || 150,
      dailyCarbTarget: studentProfile.dailyCarbTarget || 250,
      dailyFatTarget: studentProfile.dailyFatTarget || 65,
    });

    // Log de verificación: mostrar qué se está enviando
    console.log(`\n📤 [API] Enviando plan nutricional al frontend:`);
    console.log(
      `   └─ Breakfast: P=${nutritionPlan.breakfast.protein.toFixed(1)}g, C=${nutritionPlan.breakfast.carbs.toFixed(1)}g, F=${nutritionPlan.breakfast.fat.toFixed(1)}g, Cal=${nutritionPlan.breakfast.calories}kcal, Entries=${nutritionPlan.breakfast.entries.length}`,
    );
    console.log(
      `   └─ Lunch: P=${nutritionPlan.lunch.protein.toFixed(1)}g, C=${nutritionPlan.lunch.carbs.toFixed(1)}g, F=${nutritionPlan.lunch.fat.toFixed(1)}g, Cal=${nutritionPlan.lunch.calories}kcal, Entries=${nutritionPlan.lunch.entries.length}`,
    );
    console.log(
      `   └─ Dinner: P=${nutritionPlan.dinner.protein.toFixed(1)}g, C=${nutritionPlan.dinner.carbs.toFixed(1)}g, F=${nutritionPlan.dinner.fat.toFixed(1)}g, Cal=${nutritionPlan.dinner.calories}kcal, Entries=${nutritionPlan.dinner.entries.length}`,
    );
    console.log(
      `   └─ Snack: P=${nutritionPlan.snack.protein.toFixed(1)}g, C=${nutritionPlan.snack.carbs.toFixed(1)}g, F=${nutritionPlan.snack.fat.toFixed(1)}g, Cal=${nutritionPlan.snack.calories}kcal, Entries=${nutritionPlan.snack.entries.length}`,
    );

    const totalSent = {
      protein:
        nutritionPlan.breakfast.protein +
        nutritionPlan.lunch.protein +
        nutritionPlan.dinner.protein +
        nutritionPlan.snack.protein,
      carbs:
        nutritionPlan.breakfast.carbs +
        nutritionPlan.lunch.carbs +
        nutritionPlan.dinner.carbs +
        nutritionPlan.snack.carbs,
      fat:
        nutritionPlan.breakfast.fat +
        nutritionPlan.lunch.fat +
        nutritionPlan.dinner.fat +
        nutritionPlan.snack.fat,
      calories:
        nutritionPlan.breakfast.calories +
        nutritionPlan.lunch.calories +
        nutritionPlan.dinner.calories +
        nutritionPlan.snack.calories,
    };
    console.log(
      `   └─ TOTALES ENVIADOS: P=${totalSent.protein.toFixed(1)}g, C=${totalSent.carbs.toFixed(1)}g, F=${totalSent.fat.toFixed(1)}g, Cal=${totalSent.calories}kcal`,
    );

    // Solo devolver el plan generado, NO guardar en BD
    return NextResponse.json(nutritionPlan);
  } catch (error) {
    console.error("Error al generar el plan:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor al generar el plan",
      },
      { status: 500 },
    );
  }
}
