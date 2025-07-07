import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const workoutTemplateExerciseSchema = z.object({
  id: z.string().optional(), // id is optional for existing exercises that are updated
  exerciseName: z.string().min(1, 'El nombre del ejercicio es requerido'),
  sets: z.number().int().min(1, 'Los sets deben ser al menos 1'),
  reps: z.string().min(1, 'Las repeticiones son requeridas'),
  rest: z.string().min(1, 'El tiempo de descanso es requerido'),
  notes: z.string().optional(),
});

const updateWorkoutTemplateSchema = z.object({
  name: z.string().min(1, 'El nombre de la rutina es requerido').optional(),
  description: z.string().optional(),
  exercises: z.array(workoutTemplateExerciseSchema).min(1, 'Debe haber al menos un ejercicio en la rutina').optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id || !session.user.isInstructor) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const templateId = params.id;
    const body = await req.json();
    const validatedData = updateWorkoutTemplateSchema.parse(body);

    // Verify ownership of the workout template
    const existingTemplate = await prisma.workoutTemplate.findUnique({
      where: {
        id: templateId,
      },
      include: {
        exercises: true,
      },
    });

    if (!existingTemplate || existingTemplate.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Plantilla de rutina no encontrada o no autorizado' }, { status: 404 });
    }

    // Handle exercises: delete, update, and create
    if (validatedData.exercises) {
      const existingExerciseIds = existingTemplate.exercises.map(ex => ex.id);
      const updatedExerciseIds = validatedData.exercises.filter(ex => ex.id !== undefined).map(ex => ex.id as string);

      // Exercises to delete
      const exercisesToDelete = existingExerciseIds.filter(id => !updatedExerciseIds.includes(id));
      if (exercisesToDelete.length > 0) {
        await prisma.workoutTemplateExercise.deleteMany({
          where: {
            id: { in: exercisesToDelete },
          },
        });
      }

      // Exercises to update or create
      for (const exerciseData of validatedData.exercises) {
        if (exerciseData.id) {
          // Update existing exercise
          await prisma.workoutTemplateExercise.update({
            where: {
              id: exerciseData.id,
            },
            data: {
              exerciseName: exerciseData.exerciseName,
              sets: exerciseData.sets,
              reps: exerciseData.reps,
              rest: exerciseData.rest,
              notes: exerciseData.notes,
            },
          });
        } else {
          // Create new exercise
          await prisma.workoutTemplateExercise.create({
            data: {
              workoutTemplateId: templateId,
              exerciseName: exerciseData.exerciseName,
              sets: exerciseData.sets,
              reps: exerciseData.reps,
              rest: exerciseData.rest,
              notes: exerciseData.notes,
            },
          });
        }
      }
    }

    const updatedWorkoutTemplate = await prisma.workoutTemplate.update({
      where: {
        id: templateId,
      },
      data: {
        name: validatedData.name,
        description: validatedData.description,
      },
      include: {
        exercises: true,
      },
    });

    return NextResponse.json(updatedWorkoutTemplate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error actualizando plantilla de rutina:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id || !session.user.isInstructor) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const templateId = params.id;

    // Verify ownership of the workout template
    const existingTemplate = await prisma.workoutTemplate.findUnique({
      where: {
        id: templateId,
      },
      include: {
        exercises: true,
      }
    });

    if (!existingTemplate || existingTemplate.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'Plantilla de rutina no encontrada o no autorizado' }, { status: 404 });
    }

    // Delete associated exercises first (due to relational integrity)
    if (existingTemplate.exercises.length > 0) {
      await prisma.workoutTemplateExercise.deleteMany({
        where: {
          workoutTemplateId: templateId,
        },
      });
    }

    await prisma.workoutTemplate.delete({
      where: {
        id: templateId,
      },
    });

    return NextResponse.json({ message: 'Plantilla de rutina eliminada' }, { status: 200 });
  } catch (error) {
    console.error('Error eliminando plantilla de rutina:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 