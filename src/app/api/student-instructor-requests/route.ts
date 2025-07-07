import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Esquema de validación para la solicitud del instructor
const requestInstructorSchema = z.object({
  instructorProfileId: z.string().nonempty("El ID del perfil del instructor es requerido."),
  agreedPrice: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const studentId = session.user.id;
    const body = await req.json();
    const { instructorProfileId, agreedPrice } = requestInstructorSchema.parse(body);

    // Verificar si ya existe una solicitud pendiente o activa del alumno a este instructor
    const existingRequest = await prisma.studentInstructor.findFirst({
      where: {
        studentId: studentId,
        instructorProfileId: instructorProfileId,
        status: { in: ["pending", "active"] }, // Buscar solicitudes pendientes o activas
      },
    });

    if (existingRequest) {
      return new NextResponse('Ya existe una solicitud pendiente o activa para este instructor.', { status: 409 });
    }

    // Crear la nueva solicitud
    const studentInstructorRequest = await prisma.studentInstructor.create({
      data: {
        studentId,
        instructorProfileId,
        agreedPrice,
        status: "pending", // Estado inicial de la solicitud
      },
    });

    return NextResponse.json(studentInstructorRequest, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }

    console.error('[STUDENT_INSTRUCTOR_REQUEST_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 