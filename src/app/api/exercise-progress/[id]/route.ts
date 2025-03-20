import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/exercise-progress/[id] - Obtener un registro específico
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = context.params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const progressEntry = await prisma.exerciseProgress.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!progressEntry) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(progressEntry);
  } catch (error) {
    console.error(
      "Error al obtener registro de progreso de ejercicios:",
      error
    );
    return NextResponse.json(
      { error: "Error al obtener registro de progreso de ejercicios" },
      { status: 500 }
    );
  }
}

// PUT /api/exercise-progress/[id] - Actualizar un registro específico
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = context.params;

    const body = await request.json();
    const { benchPress, squat, deadlift, date, notes } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el registro pertenece al usuario
    const existingEntry = await prisma.exerciseProgress.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar el registro
    const updatedEntry = await prisma.exerciseProgress.update({
      where: {
        id: id,
      },
      data: {
        benchPress:
          benchPress !== undefined ? Number.parseFloat(benchPress) : undefined,
        squat: squat !== undefined ? Number.parseFloat(squat) : undefined,
        deadlift:
          deadlift !== undefined ? Number.parseFloat(deadlift) : undefined,
        date: date ? new Date(date) : undefined,
        notes,
      },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error(
      "Error al actualizar registro de progreso de ejercicios:",
      error
    );
    return NextResponse.json(
      { error: "Error al actualizar registro de progreso de ejercicios" },
      { status: 500 }
    );
  }
}

// DELETE /api/exercise-progress/[id] - Eliminar un registro específico
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = context.params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el registro pertenece al usuario
    const existingEntry = await prisma.exerciseProgress.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el registro
    await prisma.exerciseProgress.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error al eliminar registro de progreso de ejercicios:",
      error
    );
    return NextResponse.json(
      { error: "Error al eliminar registro de progreso de ejercicios" },
      { status: 500 }
    );
  }
}
