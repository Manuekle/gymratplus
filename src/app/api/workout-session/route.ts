// app/api/workout-sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { workoutId, dayName } = await req.json();

    // Obtener el workout con sus ejercicios
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        exercises: {
          include: {
            exercise: true, // Trae los detalles del ejercicio
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "Entrenamiento no encontrado" },
        { status: 404 }
      );
    }

    console.log("Ejercicios en workout:", workout.exercises);
    console.log("Día recibido:", dayName);

    // Convertir "Pecho y Tríceps" en ["Pecho", "Tríceps"]
    const muscleGroups = dayName
      .split(/\s*y\s*|\s*,\s*/) // Divide por "y", ",", espacios extras
      .map((muscle) => muscle.trim().toLowerCase());

    console.log("Grupos musculares a filtrar:", muscleGroups);

    // Filtrar los ejercicios que coincidan con cualquiera de los grupos musculares
    const filteredExercises = workout.exercises.filter((workoutExercise) =>
      muscleGroups.includes(workoutExercise.exercise.muscleGroup.toLowerCase())
    );

    console.log("Ejercicios filtrados:", filteredExercises);

    if (filteredExercises.length === 0) {
      return NextResponse.json(
        { error: `No hay ejercicios para el día: ${dayName}` },
        { status: 404 }
      );
    }

    // Crear la sesión de entrenamiento con los ejercicios filtrados
    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId: session.user.id,
        workoutId: workout.id,
        notes: `Día: ${dayName}`,
        exercises: {
          create: filteredExercises.map((workoutExercise) => ({
            exerciseId: workoutExercise.exerciseId,
            sets: {
              create: Array.from({ length: workoutExercise.sets }).map(
                (_, index) => ({
                  setNumber: index + 1,
                  isDropSet:
                    workoutExercise.notes?.includes("Drop set") || false,
                })
              ),
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

    return NextResponse.json(workoutSession);
  } catch (error) {
    console.error("Error al iniciar entrenamiento:", error);
    return NextResponse.json(
      { error: "Error al iniciar entrenamiento" },
      { status: 500 }
    );
  }
}
