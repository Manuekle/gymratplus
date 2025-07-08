import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id: workoutId } = params;
    const { status, notes, dueDate } = await request.json();

    // Verificar que la rutina existe y pertenece al instructor
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      select: { 
        id: true, 
        instructorId: true,
        assignedToId: true 
      }
    });

    if (!workout) {
      return NextResponse.json(
        { error: 'La rutina no existe' },
        { status: 404 }
      );
    }

    // Verificar que el instructor es el propietario de la rutina
    if (workout.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para actualizar esta rutina' },
        { status: 403 }
      );
    }

    // Actualizar la rutina
    const updatedWorkout = await prisma.workout.update({
      where: { id: workoutId },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(dueDate && { dueDate: new Date(dueDate) })
      },
      include: {
        exercises: {
          include: {
            exercise: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedWorkout);
  } catch (error) {
    console.error('Error al actualizar la rutina asignada:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al actualizar la rutina' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id: workoutId } = params;

    // Verificar que la rutina existe y pertenece al instructor
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      select: { 
        id: true, 
        instructorId: true,
        assignedToId: true 
      }
    });

    if (!workout) {
      return NextResponse.json(
        { error: 'La rutina no existe' },
        { status: 404 }
      );
    }

    // Verificar que el instructor es el propietario de la rutina
    if (workout.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta rutina' },
        { status: 403 }
      );
    }

    // Cambiar el estado a 'archived' en lugar de eliminar
    await prisma.workout.update({
      where: { id: workoutId },
      data: { 
        status: 'archived',
        assignedToId: null,
        assignedDate: null,
        dueDate: null
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar la rutina asignada:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al eliminar la rutina' },
      { status: 500 }
    );
  }
}
