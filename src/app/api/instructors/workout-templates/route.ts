import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const workoutTemplateExerciseSchema = z.object({
  exerciseName: z.string().min(1, 'El nombre del ejercicio es requerido'),
  sets: z.number().int().min(1, 'Los sets deben ser al menos 1'),
  reps: z.string().min(1, 'Las repeticiones son requeridas'),
  rest: z.string().min(1, 'El tiempo de descanso es requerido'),
  notes: z.string().optional(),
});

const createWorkoutTemplateSchema = z.object({
  name: z.string().min(1, 'El nombre de la rutina es requerido'),
  description: z.string().optional(),
  exercises: z.array(workoutTemplateExerciseSchema).min(1, 'Debe haber al menos un ejercicio en la rutina'),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id || !session.user.isInstructor) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const body = await req.json();
    const { name, description, exercises } = createWorkoutTemplateSchema.parse(body);

    const workoutTemplate = await prisma.workoutTemplate.create({
      data: {
        name,
        description,
        instructorId: session.user.id,
        exercises: {
          create: exercises.map((exercise) => ({
            exerciseName: exercise.exerciseName,
            sets: exercise.sets,
            reps: exercise.reps,
            rest: exercise.rest,
            notes: exercise.notes,
          })),
        },
      },
      include: {
        exercises: true,
      },
    });

    return NextResponse.json(workoutTemplate, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    console.error('Error creando plantilla de rutina:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id || !session.user.isInstructor) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const workoutTemplates = await prisma.workoutTemplate.findMany({
      where: {
        instructorId: session.user.id,
      },
      include: {
        exercises: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(workoutTemplates);
  } catch (error) {
    console.error('Error obteniendo plantillas de rutina:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 