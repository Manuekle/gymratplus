import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "../../../../../../../auth.ts";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

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
        status: { in: ["active", "accepted"] },
      },
    });

    if (!studentRelationship) {
      return NextResponse.json(
        {
          error:
            "No tienes permiso para ver los planes de alimentación de este estudiante",
        },
        { status: 403 },
      );
    }

    // Obtener los planes de alimentación del estudiante
    // Buscar planes donde el estudiante es el dueño (userId) o está asignado (assignedToId)
    // y que fueron creados por este instructor
    const foodRecommendations = await prisma.foodRecommendation.findMany({
      where: {
        OR: [
          { userId: studentId, instructorId: session.user.id },
          { assignedToId: studentId, instructorId: session.user.id },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        userId: true,
        instructorId: true,
        assignedToId: true,
        date: true,
        name: true,
        calorieTarget: true,
        proteinTarget: true,
        carbsTarget: true,
        fatTarget: true,
        description: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(foodRecommendations);
  } catch (error) {
    console.error("Error fetching food plans:", error);
    return NextResponse.json(
      {
        error:
          "Error interno del servidor al obtener los planes de alimentación",
      },
      { status: 500 },
    );
  }
}
