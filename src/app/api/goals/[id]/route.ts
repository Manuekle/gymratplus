import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/goals/[id] - Obtener un objetivo específico
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const goal = await prisma.goal.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        progressUpdates: {
          orderBy: {
            date: "asc",
          },
        },
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Objetivo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error al obtener objetivo:", error);
    return NextResponse.json(
      { error: "Error al obtener objetivo" },
      { status: 500 }
    );
  }
}

// PUT /api/goals/[id] - Actualizar un objetivo específico
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, targetValue, unit, targetDate, status } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el objetivo pertenece al usuario
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Objetivo no encontrado" },
        { status: 404 }
      );
    }

    // Preparar datos para actualizar
    const updateData: {
      title?: string;
      description?: string;
      targetValue?: number;
      unit?: string;
      targetDate?: Date;
      status?: string;
      completedDate?: Date;
      progress?: number;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (targetValue !== undefined) updateData.targetValue = targetValue;
    if (unit !== undefined) updateData.unit = unit;
    if (targetDate !== undefined) updateData.targetDate = new Date(targetDate);

    // Si se está completando el objetivo
    if (status === "completed" && existingGoal.status !== "completed") {
      updateData.status = "completed";
      updateData.completedDate = new Date();
      updateData.progress = 100;
    }
    // Si se está abandonando o reactivando
    else if (status !== undefined) {
      updateData.status = status;
    }

    // Actualizar el objetivo
    const updatedGoal = await prisma.goal.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error al actualizar objetivo:", error);
    return NextResponse.json(
      { error: "Error al actualizar objetivo" },
      { status: 500 }
    );
  }
}

// DELETE /api/goals/[id] - Eliminar un objetivo específico
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el objetivo pertenece al usuario
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Objetivo no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el objetivo (las actualizaciones de progreso se eliminarán en cascada)
    await prisma.goal.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar objetivo:", error);
    return NextResponse.json(
      { error: "Error al eliminar objetivo" },
      { status: 500 }
    );
  }
}
