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

    // Verificar si el usuario es un instructor
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructorProfile) {
      return NextResponse.json({ error: 'Forbidden: User is not an instructor.' }, { status: 403 });
    }

    // Obtener los planes de entrenamiento asignados por el instructor
    const assignedWorkouts = await prisma.studentAssignedWorkout.findMany({
      where: {
        instructorId: session.user.id,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        workoutTemplate: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        assignedDate: "desc",
      },
    });

    // Obtener datos adicionales de entrenamientos completados
    const workoutPlans = await Promise.all(
      assignedWorkouts.map(async (assigned) => {
        // Obtener sesiones de entrenamiento del estudiante
        const workoutSessions = await prisma.workoutSession.findMany({
          where: {
            userId: assigned.studentId,
            completed: true,
          },
          orderBy: {
            date: "desc",
          },
        });

        const totalWorkouts = workoutSessions.length;
        const lastWorkoutDate = workoutSessions[0]?.date;
        
        // Calcular progreso basado en entrenamientos completados vs asignados
        const progress = Math.min(100, Math.round((totalWorkouts / 12) * 100)); // Asumiendo 12 entrenamientos por plan
        
        // Calcular próximo entrenamiento
        const nextWorkoutDate = lastWorkoutDate 
          ? new Date(new Date(lastWorkoutDate).getTime() + 2 * 24 * 60 * 60 * 1000) // +2 días
          : new Date();

        return {
          id: assigned.id,
          studentId: assigned.student.id,
          studentName: assigned.student.name,
          studentEmail: assigned.student.email,
          studentImage: assigned.student.image,
          templateName: assigned.workoutTemplate.name,
          status: assigned.status,
          startDate: assigned.assignedDate,
          progress,
          totalWorkouts: 12, // Valor fijo para demostración
          completedWorkouts: totalWorkouts,
          lastWorkoutDate,
          nextWorkoutDate,
        };
      })
    );

    return NextResponse.json(workoutPlans, { status: 200 });
  } catch (error) {
    console.error('[GET_INSTRUCTOR_WORKOUT_PLANS_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructorProfile) {
      return NextResponse.json({ error: 'Forbidden: User is not an instructor.' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, workoutTemplateId, status = "assigned" } = body;

    // Verificar que el estudiante pertenece al instructor
    const studentRelationship = await prisma.studentInstructor.findFirst({
      where: {
        instructorProfileId: instructorProfile.id,
        studentId,
        status: "active",
      },
    });

    if (!studentRelationship) {
      return NextResponse.json({ error: 'Student not found or not assigned to instructor.' }, { status: 404 });
    }

    // Verificar que el template existe y pertenece al instructor
    const workoutTemplate = await prisma.workoutTemplate.findFirst({
      where: {
        id: workoutTemplateId,
        instructorId: session.user.id,
      },
    });

    if (!workoutTemplate) {
      return NextResponse.json({ error: 'Workout template not found.' }, { status: 404 });
    }

    // Crear el plan de entrenamiento asignado
    const assignedWorkout = await prisma.studentAssignedWorkout.create({
      data: {
        studentId,
        instructorId: session.user.id,
        workoutTemplateId,
        status,
        assignedDate: new Date(),
      },
    });

    return NextResponse.json(assignedWorkout, { status: 201 });
  } catch (error) {
    console.error('[POST_INSTRUCTOR_WORKOUT_PLAN_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 