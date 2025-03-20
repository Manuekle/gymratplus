import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/progress/[id] - Obtener un registro específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const progressEntry = await prisma.weight.findFirst({
      where: {
        id: params.id,
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
    console.error("Error al obtener registro de progreso:", error);
    return NextResponse.json(
      { error: "Error al obtener registro de progreso" },
      { status: 500 }
    );
  }
}

// PUT /api/progress/[id] - Actualizar un registro específico
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { weight, bodyFatPercentage, muscleMassPercentage, date, notes } =
      body;

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
    const existingEntry = await prisma.weight.findFirst({
      where: {
        id: params.id,
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
    const updatedEntry = await prisma.weight.update({
      where: {
        id: params.id,
      },
      data: {
        weight: weight !== undefined ? Number.parseFloat(weight) : undefined,
        bodyFatPercentage:
          bodyFatPercentage !== undefined
            ? Number.parseFloat(bodyFatPercentage)
            : undefined,
        muscleMassPercentage:
          muscleMassPercentage !== undefined
            ? Number.parseFloat(muscleMassPercentage)
            : undefined,
        date: date ? new Date(date) : undefined,
        notes,
      },
    });

    // Verificar si este es el registro más reciente
    if (weight !== undefined) {
      const latestRecord = await prisma.weight.findFirst({
        where: {
          userId: user.id,
          weight: {
            not: null,
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      // Si este registro es el más reciente con peso, actualizar el perfil
      if (latestRecord && latestRecord.id === params.id) {
        await prisma.profile.upsert({
          where: { userId: user.id },
          update: { currentWeight: weight.toString() }, // Usar currentWeight y convertir a string
          create: {
            userId: user.id,
            currentWeight: weight.toString(), // Usar currentWeight y convertir a string
          },
        });
      }
    }

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error al actualizar registro de progreso:", error);
    return NextResponse.json(
      { error: "Error al actualizar registro de progreso" },
      { status: 500 }
    );
  }
}

// DELETE /api/progress/[id] - Eliminar un registro específico
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Verificar que el registro pertenece al usuario
    const existingEntry = await prisma.weight.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 }
      );
    }

    // Guardar información sobre si este era el registro más reciente con peso
    const isLatestWithWeight = existingEntry.weight !== null;

    // Eliminar el registro
    await prisma.weight.delete({
      where: {
        id: params.id,
      },
    });

    // Si se eliminó el registro más reciente con peso, actualizar el perfil con el siguiente registro más reciente
    if (isLatestWithWeight) {
      const latestRecord = await prisma.weight.findFirst({
        where: {
          userId: user.id,
          weight: {
            not: null,
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      if (latestRecord && latestRecord.weight) {
        await prisma.profile.upsert({
          where: { userId: user.id },
          update: { currentWeight: latestRecord.weight.toString() }, // Usar currentWeight y convertir a string
          create: {
            userId: user.id,
            currentWeight: latestRecord.weight.toString(), // Usar currentWeight y convertir a string
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar registro de progreso:", error);
    return NextResponse.json(
      { error: "Error al eliminar registro de progreso" },
      { status: 500 }
    );
  }
}
