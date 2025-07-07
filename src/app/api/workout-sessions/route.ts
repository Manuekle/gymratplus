import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

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

    const workoutSessions = await prisma.workoutSession.findMany({
      where,
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
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
    });

    // Transformar los datos para incluir los ejercicios y sus series
    const transformedSessions = workoutSessions.map((session) => ({
      id: session.id,
      date: session.date,
      notes: session.notes,
      exercises: session.exercises.reduce((acc, exerciseSession) => {
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
            (set.weight || 0) > (max.weight || 0) ? set : max
          );

          acc[exerciseSession.exercise.name] = {
            weight: maxWeightSet.weight || 0,
            reps: maxWeightSet.reps || 0,
          };
        } else {
          // Si no hay sets con datos, usar valores por defecto
          acc[exerciseSession.exercise.name] = {
            weight: 0,
            reps: 0,
          };
        }

        return acc;
      }, {} as Record<string, { weight: number; reps: number }>),
    }));

    return NextResponse.json(transformedSessions);
  } catch (error) {
    console.error("[WORKOUT_SESSIONS_GET]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      date: sessionDate,
      exercises: exerciseData,
      notes: sessionNotes,
      workoutId,
    } = body;

    if (!sessionDate || !exerciseData || !workoutId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Crear la sesión de entrenamiento
    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId: session.user.id,
        workoutId,
        date: new Date(sessionDate),
        notes: sessionNotes,
        exercises: {
          create: exerciseData.map(
            (exercise: {
              name: string;
              sets: { reps: number; weight: number }[];
            }) => ({
              exercise: {
                connect: {
                  name: exercise.name,
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
            })
          ),
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

    // Transformar la respuesta para mantener consistencia con el GET
    const transformedSession = {
      id: workoutSession.id,
      date: workoutSession.date,
      notes: workoutSession.notes,
      exercises: workoutSession.exercises.reduce((acc, exerciseSession) => {
        const lastSet = exerciseSession.sets[exerciseSession.sets.length - 1];
        acc[exerciseSession.exercise.name] = {
          weight: lastSet?.weight || 0,
          reps: lastSet?.reps || 0,
        };
        return acc;
      }, {} as Record<string, { weight: number; reps: number }>),
    };

    return NextResponse.json(transformedSession);
  } catch (error) {
    console.error("[WORKOUT_SESSIONS_POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
