import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/database/prisma";
import { auth } from "../../../../auth.ts";

// Types removed - using inline types where needed

// Zod Schemas
const exerciseSetSchema = z.object({
  reps: z.number().int().positive(),
  weight: z.number().nonnegative(),
});

const exerciseDataSchema = z.object({
  name: z.string().min(1, "El nombre del ejercicio es requerido"),
  sets: z.array(exerciseSetSchema).min(1, "Debe haber al menos una serie"),
});

const createWorkoutSessionSchema = z.object({
  date: z.string().or(z.date()),
  exercises: z
    .array(exerciseDataSchema)
    .min(1, "Debe haber al menos un ejercicio"),
  notes: z.string().optional(),
  workoutId: z.string().min(1, "El ID del entrenamiento es requerido"),
});

export async function GET(
  request: NextRequest,
): Promise<NextResponse<unknown>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para continuar." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Validate date format if provided
    if ((startDate && !endDate) || (!startDate && endDate)) {
      return NextResponse.json(
        { error: "Debes proporcionar tanto la fecha de inicio como la de fin" },
        { status: 400 },
      );
    }

    try {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (
        (start && Number.isNaN(start.getTime())) ||
        (end && Number.isNaN(end.getTime()))
      ) {
        throw new Error("Formato de fecha inválido");
      }

      if (start && end && start > end) {
        return NextResponse.json(
          { error: "La fecha de inicio debe ser anterior a la fecha de fin" },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Formato de fecha inválido. Usa el formato YYYY-MM-DD" },
        { status: 400 },
      );
    }

    const where = {
      userId: session.user.id,
      ...(startDate && endDate
        ? {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {}),
    };

    // Optimize query: only select needed fields and limit results
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    const workoutSessions = await prisma.workoutSession.findMany({
      where,
      select: {
        id: true,
        date: true,
        notes: true,
        exercises: {
          select: {
            exercise: {
              select: {
                id: true,
                name: true,
                muscleGroup: true,
              },
            },
            sets: {
              select: {
                setNumber: true,
                weight: true,
                reps: true,
                completed: true,
              },
              orderBy: {
                setNumber: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
      skip: skip,
    });

    // Transformar los datos para incluir los ejercicios y sus series
    const transformedSessions = workoutSessions.map((session) => ({
      id: session.id,
      date: session.date,
      notes: session.notes,
      exercises: session.exercises.reduce(
        (acc, exerciseSession) => {
          // Obtener todas las series completadas
          const completedSets = exerciseSession.sets
            .filter((set) => set.completed && set.weight && set.reps)
            .sort((a, b) => b.setNumber - a.setNumber);

          // Si no hay series completadas, usar todas las series con datos
          const setsWithData =
            completedSets.length > 0
              ? completedSets
              : exerciseSession.sets
                  .filter((set) => set.weight && set.reps)
                  .sort((a, b) => b.setNumber - a.setNumber);

          if (setsWithData.length > 0) {
            // Obtener el set con el peso máximo
            const maxWeightSet = setsWithData.reduce((max, set) =>
              (set.weight || 0) > (max.weight || 0) ? set : max,
            );

            acc[exerciseSession.exercise.name] = {
              weight: maxWeightSet.weight || 0,
              reps: maxWeightSet.reps || 0,
              muscleGroup: exerciseSession.exercise.muscleGroup || "Otros", // Add muscle group
              exerciseId: exerciseSession.exercise.id, // Add exercise ID
            };
          } else {
            // Si no hay sets con datos, usar valores por defecto
            acc[exerciseSession.exercise.name] = {
              weight: 0,
              reps: 0,
              muscleGroup: exerciseSession.exercise.muscleGroup || "Otros",
              exerciseId: exerciseSession.exercise.id,
            };
          }

          return acc;
        },
        {} as Record<
          string,
          {
            weight: number;
            reps: number;
            muscleGroup: string;
            exerciseId: string;
          }
        >,
      ),
    }));

    // Obtener el total real de sesiones (antes de aplicar limit y skip)
    const totalSessions = await prisma.workoutSession.count({ where });

    return NextResponse.json({
      data: transformedSessions,
      pagination: {
        limit,
        skip,
        total: totalSessions,
        hasMore: skip + limit < totalSessions,
      },
    });
  } catch (error) {
    console.error("[WORKOUT_SESSIONS_GET]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<unknown>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para continuar." },
        { status: 401 },
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "El cuerpo de la solicitud no es un JSON válido" },
        { status: 400 },
      );
    }

    // Validate request body
    const validation = createWorkoutSessionSchema.safeParse(body);
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return NextResponse.json(
        { error: `Datos inválidos: ${errorMessage}` },
        { status: 400 },
      );
    }

    const {
      date: sessionDate,
      exercises: exerciseData,
      notes: sessionNotes,
      workoutId,
    } = validation.data;

    // Verify workout exists and belongs to user
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      select: { id: true, createdById: true },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "El entrenamiento especificado no existe" },
        { status: 404 },
      );
    }

    if (workout.createdById !== session.user.id) {
      return NextResponse.json(
        {
          error: "No tienes permiso para agregar sesiones a este entrenamiento",
        },
        { status: 403 },
      );
    }

    // Buscar todos los ejercicios por nombre antes de crear la sesión
    const exerciseRecords = await Promise.all(
      exerciseData.map(async (exercise) => {
        const record = await prisma.exercise.findFirst({
          where: { name: exercise.name },
        });
        if (!record) {
          throw new Error(`Ejercicio "${exercise.name}" no encontrado`);
        }
        return { ...exercise, exerciseId: record.id };
      }),
    );

    // Create workout session
    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId: session.user.id,
        workoutId,
        date: new Date(sessionDate as string | number),
        notes: sessionNotes,
        exercises: {
          create: exerciseRecords.map((exercise) => ({
            exercise: {
              connect: {
                id: exercise.exerciseId,
              },
            },
            sets: {
              create: exercise.sets.map((set, index) => ({
                setNumber: index + 1,
                reps: set.reps,
                weight: set.weight,
                completed: false,
              })),
            },
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    // Transform response to maintain consistency with GET
    type ExerciseSessionData = {
      sets: Array<{ weight: number; reps: number }>;
      exercise: { name: string; muscleGroup?: string | null; id: string };
    };

    const transformedSession = {
      id: workoutSession.id,
      date: workoutSession.date,
      notes: workoutSession.notes,
      exercises:
        (workoutSession.exercises as ExerciseSessionData[] | undefined)?.reduce(
          (
            acc: Record<
              string,
              {
                weight: number;
                reps: number;
                muscleGroup: string;
                exerciseId: string;
              }
            >,
            exerciseSession: ExerciseSessionData,
          ) => {
            const lastSet =
              exerciseSession.sets?.[exerciseSession.sets.length - 1];
            acc[exerciseSession.exercise.name] = {
              weight: lastSet?.weight ?? 0,
              reps: lastSet?.reps ?? 0,
              muscleGroup: exerciseSession.exercise.muscleGroup || "Otros",
              exerciseId: exerciseSession.exercise.id,
            };
            return acc;
          },
          {} as Record<
            string,
            {
              weight: number;
              reps: number;
              muscleGroup: string;
              exerciseId: string;
            }
          >,
        ) ?? {},
    };

    return NextResponse.json(transformedSession, { status: 201 });
  } catch (error) {
    console.error("[WORKOUT_SESSIONS_POST]", error);

    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return NextResponse.json(
          { error: "Uno de los ejercicios no existe" },
          { status: 404 },
        );
      }

      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Ya existe una sesión con estos datos" },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Error al crear la sesión de entrenamiento" },
      { status: 500 },
    );
  }
}
