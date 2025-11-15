import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export async function GET(
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

    return NextResponse.json(studentProfile);
  } catch {
    return NextResponse.json(
      {
        error: "Error interno del servidor al obtener el perfil del estudiante",
      },
      { status: 500 },
    );
  }
}
