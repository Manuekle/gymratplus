import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const assignedWorkouts = await prisma.workout.findMany({
      where: {
        assignedToId: session.user.id,
        type: "assigned",
        status: { not: "archived" },
      },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
        instructor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { assignedDate: "desc" },
    });

    return NextResponse.json(assignedWorkouts);
  } catch (error) {
    console.error("Error al obtener rutinas asignadas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
