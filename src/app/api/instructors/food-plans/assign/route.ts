import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

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

    const { studentId, meals, macros, calorieTarget, notes } =
      await request.json();

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

    // Crear el plan de alimentación asignado al estudiante con los alimentos seleccionados
    const foodRecommendation = await prisma.foodRecommendation.create({
      data: {
        userId: studentId, // El estudiante es el dueño del plan
        instructorId: session.user.id, // El instructor que lo creó
        assignedToId: studentId, // Asignado al estudiante
        macros: JSON.stringify(macros),
        meals: JSON.stringify(meals),
        calorieTarget: Math.round(calorieTarget),
        notes: notes || null,
      },
      select: {
        id: true,
        userId: true,
        instructorId: true,
        assignedToId: true,
        date: true,
        macros: true,
        meals: true,
        calorieTarget: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(foodRecommendation);
  } catch {
    return NextResponse.json(
      {
        error: "Error interno del servidor al crear el plan de alimentación",
      },
      { status: 500 },
    );
  }
}
