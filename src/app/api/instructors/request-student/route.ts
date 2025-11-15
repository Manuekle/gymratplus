import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";
import { createNotification } from "@/lib/notifications/notification-service";

// Esquema de validación para la solicitud del instructor a un estudiante
const requestStudentSchema = z.object({
  studentId: z.string().nonempty("El ID del estudiante es requerido."),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const instructorId = session.user.id;

    // Verificar que el usuario sea un instructor con suscripción activa
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      include: {
        instructorProfile: true,
      },
    });

    if (!instructor?.isInstructor) {
      return NextResponse.json(
        {
          error:
            "Solo los instructores pueden solicitar entrenar con estudiantes",
        },
        { status: 403 },
      );
    }

    if (!instructor.instructorProfile?.isPaid) {
      return NextResponse.json(
        {
          error:
            "Debes tener una suscripción activa para entrenar con estudiantes",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { studentId } = requestStudentSchema.parse(body);

    // Verificar que el estudiante existe
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, isInstructor: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Estudiante no encontrado" },
        { status: 404 },
      );
    }

    if (student.isInstructor) {
      return NextResponse.json(
        { error: "No puedes solicitar entrenar con otro instructor" },
        { status: 400 },
      );
    }

    const instructorProfileId = instructor.instructorProfile.id;

    // Verificar si ya existe un registro para este par instructor-estudiante
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
              "Ya existe una solicitud pendiente o activa para este estudiante.",
          },
          { status: 409 },
        );
      }

      // Si existe pero está en otro estado (ej: rejected, cancelled), actualizarlo
      const updatedRequest = await prisma.studentInstructor.update({
        where: { id: existingRecord.id },
        data: {
          status: "pending",
        },
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

      // Crear notificación para el estudiante
      await createNotification({
        userId: studentId,
        title: "Nueva solicitud de instructor",
        message: `${instructor.name || "Un instructor"} quiere entrenar contigo.`,
        type: "instructor_request",
      });

      return NextResponse.json(
        {
          message: "Solicitud enviada exitosamente",
          request: updatedRequest,
        },
        { status: 200 },
      );
    }

    // Crear nueva solicitud
    const newRequest = await prisma.studentInstructor.create({
      data: {
        studentId: studentId,
        instructorProfileId: instructorProfileId,
        status: "pending",
      },
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

    // Crear notificación para el estudiante
    await createNotification({
      userId: studentId,
      title: "Nueva solicitud de instructor",
      message: `${instructor.name || "Un instructor"} quiere entrenar contigo.`,
      type: "instructor_request",
    });

    return NextResponse.json(
      {
        message: "Solicitud enviada exitosamente",
        request: newRequest,
      },
      { status: 201 },
    );
  } catch {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
