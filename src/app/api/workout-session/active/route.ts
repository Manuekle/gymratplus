import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

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
        { status: 404 }
      );
    }

    return NextResponse.json(activeWorkoutSession);
  } catch (error) {
    console.error("Error al obtener sesión de entrenamiento activa:", error);
    return NextResponse.json(
      { error: "Error al obtener sesión de entrenamiento activa" },
      { status: 500 }
    );
  }
}
