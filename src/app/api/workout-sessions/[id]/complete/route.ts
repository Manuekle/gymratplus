import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth/next";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Workout session ID is required" },
        { status: 400 },
      );
    }

    const workoutSession = await prisma.workoutSession.findUnique({
      where: {
        id: id,
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
      return NextResponse.json(
        { error: "Sesión no encontrada" },
        { status: 404 },
      );
    }

    // Actualizar el peso máximo en WorkoutExercise (solo si el workout aún existe)
    const updatePromises = workoutSession.exercises.map(
      async (exerciseSession) => {
        // Encontrar el peso máximo de los sets
        const maxWeight = Math.max(
          ...exerciseSession.sets.map((set) => set.weight || 0),
        );

        // Encontrar el ejercicio correspondiente en el workout (si el workout existe)
        const workoutExercise = workoutSession.workout?.exercises.find(
          (we) => we.exerciseId === exerciseSession.exerciseId,
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
      },
    );

    // Esperar a que todas las actualizaciones se completen
    await Promise.all(updatePromises);

    // Marcar la sesión como completada
    const updatedSession = await prisma.workoutSession.update({
      where: { id: id },
      data: { completed: true },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("[WORKOUT_SESSION_COMPLETE]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
