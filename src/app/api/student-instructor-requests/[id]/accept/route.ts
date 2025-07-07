import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const requestId = params.id;

    // Verificar si el usuario es un instructor y si la solicitud le pertenece
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructorProfile) {
      return new NextResponse('Forbidden: User is not an instructor.', { status: 403 });
    }

    const studentInstructorRequest = await prisma.studentInstructor.findUnique({
      where: { id: requestId },
    });

    if (!studentInstructorRequest) {
      return new NextResponse('Request not found', { status: 404 });
    }

    if (studentInstructorRequest.instructorProfileId !== instructorProfile.id) {
      return new NextResponse('Forbidden: Not authorized to accept this request.', { status: 403 });
    }

    // Actualizar el estado de la solicitud a 'accepted'
    const updatedRequest = await prisma.studentInstructor.update({
      where: { id: requestId },
      data: {
        status: "active", // Cambiar a 'active' cuando se acepta
        startDate: new Date(), // Establecer la fecha de inicio de la relación
      },
    });

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error('[ACCEPT_STUDENT_REQUEST_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 