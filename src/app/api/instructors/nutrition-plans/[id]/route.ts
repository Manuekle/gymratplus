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
    const { isActive } = body;

    // Verificar que el plan pertenece a un estudiante del instructor
    const foodPlan = await prisma.foodPlan.findFirst({
      where: {
        id: params.id,
      },
      include: {
        user: true,
      },
    });

    if (!foodPlan) {
      return NextResponse.json({ error: 'Nutrition plan not found.' }, { status: 404 });
    }

    // Verificar que el usuario es estudiante del instructor
    const studentRelationship = await prisma.studentInstructor.findFirst({
      where: {
        studentId: foodPlan.userId,
        instructorProfileId: instructorProfile.id,
        status: "active",
      },
    });

    if (!studentRelationship) {
      return NextResponse.json({ error: 'Nutrition plan not found or not assigned to instructor.' }, { status: 404 });
    }

    // Actualizar el estado del plan
    const updatedPlan = await prisma.foodPlan.update({
      where: {
        id: params.id,
      },
      data: {
        isActive,
      },
    });

    return NextResponse.json(updatedPlan, { status: 200 });
  } catch (error) {
    console.error('[PATCH_INSTRUCTOR_NUTRITION_PLAN_ERROR]', error);
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

    // Verificar que el plan pertenece a un estudiante del instructor
    const foodPlan = await prisma.foodPlan.findFirst({
      where: {
        id: params.id,
        user: {
          studentInstructor: {
            some: {
              instructorProfileId: instructorProfile.id,
              status: "active",
            },
          },
        },
      },
    });

    if (!foodPlan) {
      return NextResponse.json({ error: 'Nutrition plan not found.' }, { status: 404 });
    }

    // Eliminar el plan
    await prisma.foodPlan.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Nutrition plan deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE_INSTRUCTOR_NUTRITION_PLAN_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 