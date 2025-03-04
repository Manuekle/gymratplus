import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { workoutPlanId, nutritionPlanIds } = await request.json();

    // Aquí podríamos implementar la lógica para guardar los planes en la base de datos
    // Por ejemplo, crear un registro que vincule estos planes al perfil del usuario

    // Verificar que el plan de entrenamiento existe
    const workout = await prisma.workout.findUnique({
      where: { id: workoutPlanId },
    });

    if (!workout) {
      return NextResponse.json(
        { error: "Plan de entrenamiento no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que los planes de comidas existen
    const mealLogs = await prisma.mealLog.findMany({
      where: {
        id: {
          in: Object.values(nutritionPlanIds),
        },
      },
    });

    if (mealLogs.length !== Object.values(nutritionPlanIds).length) {
      return NextResponse.json(
        { error: "Uno o más planes de comidas no encontrados" },
        { status: 404 }
      );
    }

    // Obtener el userId del workout
    const userId = workout.userId;

    // Crear un evento para el plan de entrenamiento
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startTime = new Date(tomorrow);
    startTime.setHours(8, 0, 0, 0); // 8:00 AM

    const endTime = new Date(tomorrow);
    endTime.setHours(9, 0, 0, 0); // 9:00 AM

    const event = await prisma.event.create({
      data: {
        userId: userId,
        title: `Plan de entrenamiento: ${workout.name}`,
        start: startTime,
        end: endTime,
        workoutId: workout.id,
        color: "#4f46e5", // Color indigo
        allDay: false,
        notes: "Plan generado automáticamente",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Plan guardado correctamente",
      eventId: event.id,
    });
  } catch (error) {
    console.error("Error guardando el plan:", error);
    return NextResponse.json(
      { error: "Error al guardar el plan" },
      { status: 500 }
    );
  }
}
