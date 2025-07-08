import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar si el usuario es un instructor y obtener su perfil de instructor
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructorProfile) {
      return NextResponse.json({ error: 'Forbidden: User is not an instructor or profile not found.' }, { status: 403 });
    }

    // Obtener las relaciones activas de alumnos con este instructor
    const studentInstructorRelationships = await prisma.studentInstructor.findMany({
      where: {
        instructorProfileId: instructorProfile.id,
        status: { in: ["active", "pending"] }, // Trae alumnos activos y solicitudes pendientes
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            workoutStreak: {
              select: {
                currentStreak: true,
                lastWorkoutAt: true,
              },
            },
            workoutSessions: {
              where: {
                completed: true,
                date: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0) - (7 * 24 * 60 * 60 * 1000)), // Últimos 7 días
                },
              },
              orderBy: {
                date: "desc",
              },
            },
          },
        },
      },
    });

    // Formatear los datos para la respuesta
    const studentsData = studentInstructorRelationships
      .filter(rel => rel.student)
      .map(rel => ({
        id: rel.id,
        studentId: rel.student.id,
        name: rel.student.name,
        email: rel.student.email,
        image: rel.student.image,
        agreedPrice: rel.agreedPrice,
        status: rel.status,
        lastWorkoutAt: rel.student.workoutSessions.length > 0 ? rel.student.workoutSessions[0].date : null,
        currentWorkoutStreak: rel.student.workoutStreak?.currentStreak || 0,
        completedWorkoutsLast7Days: rel.student.workoutSessions.length,
        totalWorkouts: rel.student.workoutSessions.length, // Simplificado por ahora
        averageWorkoutsPerWeek: 0, // Placeholder
        lastNutritionLog: null, // Placeholder
        hasActiveMealPlan: false, // Placeholder
        hasActiveWorkoutPlan: false, // Placeholder
      }));

    return NextResponse.json(studentsData, { status: 200 });
  } catch (error) {
    console.error('[GET_INSTRUCTOR_STUDENTS_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 