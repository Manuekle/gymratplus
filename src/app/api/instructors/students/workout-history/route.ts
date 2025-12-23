import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario es instructor
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructorProfile) {
      return NextResponse.json(
        { error: "No tienes permiso para acceder a esta información" },
        { status: 403 },
      );
    }

    // Obtener el parámetro studentId de la URL si existe
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    // Obtener todos los estudiantes asignados al instructor
    const studentRelationships = await prisma.studentInstructor.findMany({
      where: {
        instructorProfileId: instructorProfile.id,
        status: "active",
      },
      select: {
        studentId: true,
      },
    });

    const studentIds = studentRelationships.map((rel) => rel.studentId);

    // Si se especifica un studentId, verificar que pertenece al instructor
    if (studentId) {
      if (!studentIds.includes(studentId)) {
        return NextResponse.json(
          {
            error: "No tienes permiso para ver el historial de este estudiante",
          },
          { status: 403 },
        );
      }
    }

    // Obtener las sesiones de entrenamiento de los estudiantes
    const whereClause = {
      userId: studentId ? studentId : { in: studentIds },
      completed: true, // Solo entrenamientos completados
      workout: {
        // Solo entrenamientos asignados por el instructor
        instructorId: session.user.id,
        type: "assigned",
      },
    };

    const workoutSessions = await prisma.workoutSession.findMany({
      where: whereClause,
      orderBy: {
        date: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: {
                setNumber: "asc",
              },
            },
          },
        },
        workout: {
          select: {
            id: true,
            name: true,
            instructorId: true,
          },
        },
      },
    });

    return NextResponse.json(workoutSessions);
  } catch (error) {
    console.error("Error al obtener historial de entrenamientos:", error);
    return NextResponse.json(
      { error: "Error al obtener historial de entrenamientos" },
      { status: 500 },
    );
  }
}
