import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "../../../../../../../../../../auth";

// GET /api/progress/[id] - Obtener un registro específico
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Progress ID is required" },
        { status: 400 },
      );
    }

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    const progressEntry = await prisma.weight.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!progressEntry) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(progressEntry);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener registro de progreso" },
      { status: 500 },
    );
  }
}

// PUT /api/progress/[id] - Actualizar un registro específico
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Progress ID is required" },
        { status: 400 },
      );
    }

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { weight, bodyFatPercentage, muscleMassPercentage, date, notes } =
      body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Verificar que el registro pertenece al usuario
    const existingEntry = await prisma.weight.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 },
      );
    }

    // Preparar datos para actualización
    const updateData: {
      weight?: number;
      bodyFatPercentage?: number;
      muscleMassPercentage?: number;
      date?: Date;
      notes?: string | null;
    } = {};

    if (weight !== undefined) {
      updateData.weight = Number.parseFloat(weight);
    }
    if (bodyFatPercentage !== undefined) {
      updateData.bodyFatPercentage = Number.parseFloat(bodyFatPercentage);
    }
    if (muscleMassPercentage !== undefined) {
      updateData.muscleMassPercentage = Number.parseFloat(muscleMassPercentage);
    }
    if (date) {
      updateData.date = new Date(date);
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Actualizar el registro
    const updatedEntry = await prisma.weight.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    // Verificar si este es el registro más reciente
    if (weight !== undefined) {
      const latestRecord = await prisma.weight.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: {
          date: "desc",
        },
      });

      // Si este registro es el más reciente con peso, actualizar el perfil
      if (latestRecord && latestRecord.id === id) {
        await prisma.profile.upsert({
          where: { userId: user.id },
          update: { currentWeight: weight.toString() },
          create: {
            userId: user.id,
            currentWeight: weight.toString(),
          },
        });
      }
    }

    return NextResponse.json(updatedEntry);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar registro de progreso" },
      { status: 500 },
    );
  }
}

// DELETE /api/progress/[id] - Eliminar un registro específico
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Progress ID is required" },
        { status: 400 },
      );
    }

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Verificar que el registro pertenece al usuario
    const existingEntry = await prisma.weight.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 },
      );
    }

    // Guardar información sobre si este era el registro más reciente con peso
    const isLatestWithWeight = existingEntry.weight !== null;

    // Eliminar el registro
    await prisma.weight.delete({
      where: {
        id: id,
      },
    });

    // Si se eliminó el registro más reciente con peso, actualizar el perfil con el siguiente registro más reciente
    if (isLatestWithWeight) {
      const latestRecord = await prisma.weight.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: {
          date: "desc",
        },
      });

      if (latestRecord && latestRecord.weight) {
        await prisma.profile.upsert({
          where: { userId: user.id },
          update: { currentWeight: latestRecord.weight.toString() },
          create: {
            userId: user.id,
            currentWeight: latestRecord.weight.toString(),
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar registro de progreso" },
      { status: 500 },
    );
  }
}
