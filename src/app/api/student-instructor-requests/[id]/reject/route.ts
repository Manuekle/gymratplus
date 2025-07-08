import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createNotificationByEmail } from '@/lib/notification-service';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const requestId = url.pathname.split("/").pop();
    if (!requestId) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }

    // Verificar si el usuario es un instructor y si la solicitud le pertenece
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructorProfile) {
      return NextResponse.json({ error: 'Forbidden: User is not an instructor.' }, { status: 403 });
    }

    const studentInstructorRequest = await prisma.studentInstructor.findUnique({
      where: { id: requestId },
    });

    if (!studentInstructorRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (studentInstructorRequest.instructorProfileId !== instructorProfile.id) {
      return NextResponse.json({ error: 'Forbidden: Not authorized to reject this request.' }, { status: 403 });
    }

    // Actualizar el estado de la solicitud a 'rejected'
    const updatedRequest = await prisma.studentInstructor.update({
      where: { id: requestId },
      data: {
        status: "rejected", // Cambiar a 'rejected' cuando se rechaza
      },
      include: {
        student: {
          select: {
            name: true,
            email: true,
          },
        },
        instructor: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Crear notificación para el alumno
    await createNotificationByEmail({
      userEmail: updatedRequest.student.email!,
      title: "Solicitud rechazada",
      message: `${updatedRequest.instructor.user.name} ha rechazado tu solicitud.`,
      type: "system",
    });

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error('[REJECT_STUDENT_REQUEST_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 