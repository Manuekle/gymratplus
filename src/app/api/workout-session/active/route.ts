import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Buscar la sesión de entrenamiento activa más reciente
    const activeWorkoutSession = await prisma.workoutSession.findFirst({
      where: {
        userId: session.user.id,
        completed: false,
      },
      orderBy: {
        createdAt: "desc",
      },
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
    });

    if (!activeWorkoutSession) {
      return NextResponse.json(
        { error: "No hay sesión de entrenamiento activa" },
        { status: 404 },
      );
    }

    return NextResponse.json(activeWorkoutSession);
  } catch (error) {
    console.error("Error al obtener sesión de entrenamiento activa:", error);
    return NextResponse.json(
      { error: "Error al obtener sesión de entrenamiento activa" },
      { status: 500 },
    );
  }
}
