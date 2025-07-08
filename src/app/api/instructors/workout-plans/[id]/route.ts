import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { status } = body;

    // Verificar que el plan pertenece al instructor
    const assignedWorkout = await prisma.studentAssignedWorkout.findFirst({
      where: {
        id: params.id,
        instructorId: session.user.id,
      },
    });

    if (!assignedWorkout) {
      return NextResponse.json({ error: 'Workout plan not found.' }, { status: 404 });
    }

    // Actualizar el estado del plan
    const updatedPlan = await prisma.studentAssignedWorkout.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(updatedPlan, { status: 200 });
  } catch (error) {
    console.error('[PATCH_INSTRUCTOR_WORKOUT_PLAN_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Verificar que el plan pertenece al instructor
    const assignedWorkout = await prisma.studentAssignedWorkout.findFirst({
      where: {
        id: params.id,
        instructorId: session.user.id,
      },
    });

    if (!assignedWorkout) {
      return NextResponse.json({ error: 'Workout plan not found.' }, { status: 404 });
    }

    // Eliminar el plan
    await prisma.studentAssignedWorkout.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Workout plan deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE_INSTRUCTOR_WORKOUT_PLAN_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 