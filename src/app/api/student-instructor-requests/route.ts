import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";
import { createNotificationByEmail } from "@/lib/notifications/notification-service";
import { auth } from "../../../../auth.ts";

// Esquema de validación para la solicitud del instructor
const requestInstructorSchema = z.object({
  instructorProfileId: z
    .string()
    .nonempty("El ID del perfil del instructor es requerido."),
  agreedPrice: z.number().optional(),
});

export async function GET() {
  try {
    const session = await auth();

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
                isInstructor: true, // Incluir el estado booleano real
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
  } catch {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

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
      const isPending = existingRecord.status === "pending";
      const requestDate = new Date(existingRecord.startDate);
      const now = new Date();
      const hoursDiff =
        (now.getTime() - requestDate.getTime()) / (1000 * 60 * 60);
      const isExpired = isPending && hoursDiff >= 24;

      // Si ya hay una solicitud pendiente (no expirada) o activa, devolver error
      if (["pending", "active"].includes(existingRecord.status) && !isExpired) {
        return NextResponse.json(
          {
            error:
              "Ya existe una solicitud pendiente o activa para este instructor.",
          },
          { status: 409 },
        );
      }

      // Si existe pero está en otro estado (ej: rejected, cancelled) o está expirada, actualizarlo
      const updateData: {
        status: string;
        agreedPrice?: number;
        startDate?: Date;
      } = {
        status: "pending",
        startDate: new Date(), // Resetear fecha de solicitud
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

    // Validar si el estudiante ya tiene una solicitud pendiente o activa con OTRO instructor
    // Y verificar si ese instructor sigue ACTIVO (isInstructor = true). Si no está activo, permitimos la nueva solicitud.
    const activeRequests = await prisma.studentInstructor.findMany({
      where: {
        studentId: studentId,
        status: { in: ["pending", "active"] },
        instructorProfileId: { not: instructorProfileId }, // Excluir la solicitud actual si es la misma
      },
      include: {
        instructor: {
          select: {
            user: {
              select: {
                isInstructor: true,
              },
            },
          },
        },
      },
    });

    // Filtrar solicitudes que realmente bloquean (solo las de instructores ACTIVOS y NO expiradas)
    const blockingRequest = activeRequests.find((req) => {
      // Si el instructor no es activo, no bloquea
      if (!req.instructor?.user?.isInstructor) return false;

      // Si está activo (contratado), siempre bloquea
      if (req.status === "active") return true;

      // Si está pendiente, verificar si expiró (24h)
      if (req.status === "pending") {
        const reqDate = new Date(req.startDate);
        const reqNow = new Date();
        const reqHoursDiff =
          (reqNow.getTime() - reqDate.getTime()) / (1000 * 60 * 60);
        return reqHoursDiff < 24; // Bloquea solo si NO ha expirado (< 24h)
      }

      return false;
    });

    if (blockingRequest) {
      return NextResponse.json(
        {
          error:
            "Ya tienes una solicitud pendiente o activa con otro instructor activo. Debes cancelarla primero.",
        },
        { status: 409 },
      );
    }

    // Si llegamos aqui, o no tiene solicitudes, o las que tiene son de instructores inactivos (isInstructor=false).
    // Podemos proceder.

    // Crear la nueva solicitud
    const createData: {
      studentId: string;
      instructorProfileId: string;
      status: string;
      agreedPrice?: number;
    } = {
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

    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
