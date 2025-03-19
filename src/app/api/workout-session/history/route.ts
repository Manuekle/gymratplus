import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener todas las sesiones de entrenamiento del usuario
    const workoutSessions = await prisma.workoutSession.findMany({
      where: {
        userId: session.user.id,
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
      { status: 500 }
    );
  }
}
