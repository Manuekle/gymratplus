import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "../../../../../auth.ts";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = session.user as {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };

    // Obtener todas las sesiones de entrenamiento del usuario
    const workoutSessions = await prisma.workoutSession.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: "desc",
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

    return NextResponse.json(workoutSessions);
  } catch (error) {
    console.error("Error al obtener historial de entrenamientos:", error);
    return NextResponse.json(
      { error: "Error al obtener historial de entrenamientos" },
      { status: 500 },
    );
  }
}
