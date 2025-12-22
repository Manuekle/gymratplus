import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { requireFeature } from "@/lib/subscriptions/check-access";
import { auth } from "../../../../../../auth.ts";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Check subscription tier for workout assignment feature
    try {
      await requireFeature("WORKOUT_ASSIGNMENT");
    } catch (error) {
      return NextResponse.json(
        { error: "Upgrade required - This feature requires INSTRUCTOR tier" },
        { status: 403 },
      );
    }

    // Verificar que el usuario sea un instructor
    const instructor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isInstructor: true },
    });

    if (!instructor?.isInstructor) {
      return NextResponse.json(
        { error: "Solo los instructores pueden asignar rutinas" },
        { status: 403 },
      );
    }

    const { workoutId, studentId, dueDate, notes } = await request.json();

    // Obtener el perfil del instructor
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!instructorProfile) {
      return NextResponse.json(
        { error: "Perfil de instructor no encontrado" },
        { status: 404 },
      );
    }

    // Validar que el estudiante esté asignado al instructor
    const studentRelationship = await prisma.studentInstructor.findFirst({
      where: {
        studentId: studentId,
        instructorProfileId: instructorProfile.id,
        status: "active",
      },
    });

    if (!studentRelationship) {
      return NextResponse.json(
        { error: "No tienes permiso para asignar rutinas a este estudiante" },
        { status: 403 },
      );
    }

    // Verificar que la rutina existe
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      select: {
        id: true,
        instructorId: true,
        createdById: true,
      },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "La rutina no existe" },
        { status: 404 },
      );
    }

    // Verificar que el usuario sea el propietario de la rutina o un instructor con permisos
    if (
      workout.createdById !== session.user.id &&
      workout.instructorId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "No tienes permiso para asignar esta rutina" },
        { status: 403 },
      );
    }

    // Convertir la fecha de vencimiento si existe
    let dueDateValue = null;
    if (dueDate) {
      dueDateValue = new Date(dueDate);
      if (isNaN(dueDateValue.getTime())) {
        return NextResponse.json(
          { error: "Formato de fecha inválido" },
          { status: 400 },
        );
      }
    }

    // Definir el tipo para los datos de actualización
    type WorkoutUpdateData = {
      assignedToId: string;
      assignedDate: Date;
      dueDate: Date | null;
      status: string;
      notes: string | null;
      instructorId?: string;
      type: string;
    };

    // Asignar la rutina al estudiante
    const updateData: WorkoutUpdateData = {
      assignedToId: studentId,
      assignedDate: new Date(),
      dueDate: dueDateValue,
      status: "assigned",
      notes: notes || null,
      type: "assigned", // Cambiar el tipo a "assigned"
      // Si la rutina no tenía instructorId, asignar el actual
      ...(workout.instructorId ? {} : { instructorId: session.user.id }),
    };

    // Realizar la actualización en dos pasos para evitar problemas con los tipos
    // Primero actualizamos los campos básicos
    await prisma.workout.update({
      where: { id: workoutId },
      data: updateData,
    });

    // Luego obtenemos el workout actualizado con las relaciones
    const assignedWorkout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(assignedWorkout);
  } catch (error) {
    console.error("Error al asignar la rutina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al asignar la rutina" },
      { status: 500 },
    );
  }
}
