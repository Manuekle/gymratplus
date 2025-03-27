import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const workoutSession = await prisma.workoutSession.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        workout: {
          include: {
            exercises: true,
          },
        },
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    if (!workoutSession) {
      return new NextResponse("Sesión no encontrada", { status: 404 });
    }

    // Actualizar el peso máximo en WorkoutExercise
    const updatePromises = workoutSession.exercises.map(
      async (exerciseSession) => {
        // Encontrar el peso máximo de los sets
        const maxWeight = Math.max(
          ...exerciseSession.sets.map((set) => set.weight || 0)
        );

        // Encontrar el ejercicio correspondiente en el workout
        const workoutExercise = workoutSession.workout.exercises.find(
          (we) => we.exerciseId === exerciseSession.exerciseId
        );

        if (workoutExercise && maxWeight > 0) {
          // Actualizar solo si el nuevo peso es mayor que el actual
          if (!workoutExercise.weight || maxWeight > workoutExercise.weight) {
            await prisma.workoutExercise.update({
              where: { id: workoutExercise.id },
              data: { weight: maxWeight },
            });
          }
        }
      }
    );

    // Esperar a que todas las actualizaciones se completen
    await Promise.all(updatePromises);

    // Marcar la sesión como completada
    const updatedSession = await prisma.workoutSession.update({
      where: { id: params.id },
      data: { completed: true },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("[WORKOUT_SESSION_COMPLETE]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
