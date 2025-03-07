import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { day, exercises } = await req.json();

    if (!day || !exercises || !exercises.length) {
      return NextResponse.json(
        { error: "Datos inválidos proporcionados" },
        { status: 400 }
      );
    }

    console.log("Día recibido:", day);
    console.log("Ejercicios recibidos:", exercises);

    // Buscar el workout del usuario (asumiendo que tiene uno activo)
    // Si necesitas un workoutId específico, deberías incluirlo en la solicitud
    const userWorkout = await prisma.workout.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!userWorkout) {
      return NextResponse.json(
        { error: "No se encontró un entrenamiento activo para el usuario" },
        { status: 404 }
      );
    }

    // Crear la sesión de entrenamiento con los ejercicios proporcionados
    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId: session.user.id,
        workoutId: userWorkout.id,
        notes: `Día: ${day}`,
        exercises: {
          create: await Promise.all(
            exercises.map(async (exercise) => {
              // Buscar el ejercicio en la base de datos por nombre
              const exerciseRecord = await prisma.exercise.findFirst({
                where: { name: exercise.name },
              });

              if (!exerciseRecord) {
                console.error(`Ejercicio no encontrado: ${exercise.name}`);
                // Puedes manejar esto de diferentes maneras, aquí simplemente usamos un ID predeterminado
                // o podrías crear el ejercicio si no existe
                throw new Error(`Ejercicio no encontrado: ${exercise.name}`);
              }

              return {
                exerciseId: exerciseRecord.id,
                completed: false,
                sets: {
                  create: Array.from({ length: exercise.sets }).map(
                    (_, index) => ({
                      setNumber: index + 1,
                      reps: exercise.reps || null,
                      weight: null, // Será completado por el usuario durante el entrenamiento
                      isDropSet:
                        exercise.notes?.toLowerCase().includes("drop set") ||
                        false,
                      completed: false,
                    })
                  ),
                },
              };
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

    return NextResponse.json({
      success: true,
      message: "Sesión de entrenamiento creada exitosamente",
      workoutSession,
    });
  } catch (error) {
    console.error("Error al crear sesión de entrenamiento:", error);
    return NextResponse.json(
      { error: "Error al crear sesión de entrenamiento" },
      { status: 500 }
    );
  }
}
