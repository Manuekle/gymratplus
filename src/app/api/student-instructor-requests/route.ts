import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createNotificationByEmail } from "@/lib/notification-service";

// Esquema de validación para la solicitud del instructor
const requestInstructorSchema = z.object({
  instructorProfileId: z
    .string()
    .nonempty("El ID del perfil del instructor es requerido."),
  agreedPrice: z.number().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = session.user.id;

    // Obtener todas las solicitudes del estudiante
    const requests = await prisma.studentInstructor.findMany({
      where: {
        studentId: studentId,
      },
      include: {
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
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("[GET_STUDENT_INSTRUCTOR_REQUESTS_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = session.user.id;
    const body = await req.json();
    const { instructorProfileId, agreedPrice } =
      requestInstructorSchema.parse(body);

    // Verificar si ya existe un registro para este par estudiante-instructor
    const existingRecord = await prisma.studentInstructor.findFirst({
      where: {
        studentId: studentId,
        instructorProfileId: instructorProfileId,
      },
    });

    // Si ya existe un registro, actualizarlo en lugar de crear uno nuevo
    if (existingRecord) {
      // Si ya hay una solicitud pendiente o activa, devolver error
      if (["pending", "active"].includes(existingRecord.status)) {
        return NextResponse.json(
          {
            error:
              "Ya existe una solicitud pendiente o activa para este instructor.",
          },
          { status: 409 },
        );
      }

      // Si existe pero está en otro estado (ej: rejected, cancelled), actualizarlo
      const updateData: any = {
        status: "pending",
      };
      
      if (agreedPrice !== undefined) {
        updateData.agreedPrice = agreedPrice;
      }
      
      const updatedRequest = await prisma.studentInstructor.update({
        where: { id: existingRecord.id },
        data: updateData,
        include: {
          student: {
            select: { name: true, email: true },
          },
          instructor: {
            select: {
              user: {
                select: { name: true, email: true },
              },
            },
          },
        },
      });

      // Crear notificación para el instructor
      await createNotificationByEmail({
        userEmail: updatedRequest.instructor.user.email!,
        title: "Solicitud de alumno actualizada",
        message: `${updatedRequest.student.name} ha actualizado su solicitud para ser tu alumno.`,
        type: "system",
      });

      return NextResponse.json(updatedRequest, { status: 200 });
    }

    // Crear la nueva solicitud
    const createData: any = {
      studentId,
      instructorProfileId,
      status: "pending", // Estado inicial de la solicitud
    };
    
    if (agreedPrice !== undefined) {
      createData.agreedPrice = agreedPrice;
    }
    
    const studentInstructorRequest = await prisma.studentInstructor.create({
      data: createData,
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

    // Crear notificación para el instructor
    await createNotificationByEmail({
      userEmail: studentInstructorRequest.instructor.user.email!,
      title: "Nueva solicitud de alumno",
      message: `${studentInstructorRequest.student.name} ha solicitado ser tu alumno.`,
      type: "system",
    });

    return NextResponse.json(studentInstructorRequest, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("[STUDENT_INSTRUCTOR_REQUEST_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
