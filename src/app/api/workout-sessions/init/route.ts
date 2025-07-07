import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_EXERCISES = [
  {
    name: "Press banca",
    muscleGroup: "Pecho",
    description: "Ejercicio básico de pecho",
  },
  {
    name: "Sentadilla",
    muscleGroup: "Piernas",
    description: "Ejercicio básico de piernas",
  },
  {
    name: "Peso muerto",
    muscleGroup: "Espalda",
    description: "Ejercicio básico de espalda",
  },
];

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Crear o obtener los ejercicios básicos
    const exercises = await Promise.all(
      DEFAULT_EXERCISES.map(async (exerciseData) => {
        let exercise = await prisma.exercise.findFirst({
          where: { name: exerciseData.name },
        });

        if (!exercise) {
          exercise = await prisma.exercise.create({
            data: exerciseData,
          });
        }

        return exercise;
      })
    );

    // Crear el entrenamiento por defecto
    const defaultWorkout = await prisma.workout.create({
      data: {
        name: "Entrenamiento por defecto",
        description: "Entrenamiento para seguimiento de progreso",
        userId: session.user.id,
        exercises: {
          create: exercises.map((exercise, index) => ({
            exerciseId: exercise.id,
            sets: 3,
            reps: 12,
            weight: 0,
            restTime: 60,
            order: index + 1,
            notes: `Ejercicio básico ${exercise.name}`,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return NextResponse.json(defaultWorkout);
  } catch (error) {
    console.error("[WORKOUT_SESSIONS_INIT]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
