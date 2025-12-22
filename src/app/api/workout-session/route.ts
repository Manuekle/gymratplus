import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { publishWorkoutNotification } from "@/lib/notifications/workout-notifications";
import { auth } from "../../../../auth.ts";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado - Usuario no identificado" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const { day, exercises } = await req.json();

    if (
      !day ||
      !exercises ||
      !Array.isArray(exercises) ||
      exercises.length === 0
    ) {
      return NextResponse.json(
        { error: "Datos inválidos proporcionados" },
        { status: 400 },
      );
    }

    console.log("Día recibido:", day);
    console.log("Ejercicios recibidos:", exercises);

    // Buscar el workout del usuario (personal o asignado)
    // Primero intentamos encontrar una rutina personal activa
    let userWorkout = await prisma.workout.findFirst({
      where: { createdById: userId, type: "personal" },
      orderBy: { createdAt: "desc" },
    });

    // Si no hay rutina personal, buscar una asignada
    if (!userWorkout) {
      userWorkout = await prisma.workout.findFirst({
        where: { assignedToId: userId, type: "assigned" },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!userWorkout) {
      return NextResponse.json(
        { error: "No se encontró un entrenamiento activo para el usuario" },
        { status: 404 },
      );
    }

    // Crear la sesión de entrenamiento con los ejercicios proporcionados
    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId: userId,
        workoutId: userWorkout.id,
        notes: `Día: ${day}`,
        exercises: {
          create: await Promise.all(
            exercises.map(
              async (exercise: {
                name: string;
                sets: number;
                reps?: number;
                notes?: string;
              }) => {
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
                      }),
                    ),
                  },
                };
              },
            ),
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

    // Create notification for workout session started
    try {
      // Check if user has notifications enabled
      const userProfile = await prisma.profile.findUnique({
        where: { userId },
        select: { notificationsActive: true },
      });

      if (userProfile?.notificationsActive !== false) {
        // Default to true if not set
        // Add to Redis list for polling (the subscriber will create the notification)
        await publishWorkoutNotification(
          userId,
          workoutSession.id,
          "started",
          userWorkout.name,
          day,
        );
      }
    } catch (notificationError) {
      // Log but don't fail the request if notification creation fails
      console.error("Error creating workout notification:", notificationError);
    }

    return NextResponse.json({
      success: true,
      message: "Sesión de entrenamiento creada exitosamente",
      workoutSession,
    });
  } catch (error) {
    console.error("Error al crear sesión de entrenamiento:", error);
    return NextResponse.json(
      { error: "Error al crear sesión de entrenamiento" },
      { status: 500 },
    );
  }
}
