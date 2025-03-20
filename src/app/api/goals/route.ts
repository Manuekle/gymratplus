import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/goals - Obtener objetivos del usuario
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // Filtrar por tipo de objetivo
    const status = url.searchParams.get("status"); // Filtrar por estado

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Consulta base
    const query: {
      where: {
        userId: string;
        type?: string | null;
        status?: string | null;
      };
      orderBy: {
        createdAt: "desc";
      };
      include: {
        progressUpdates: {
          orderBy: {
            date: "asc";
          };
        };
      };
    } = {
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        progressUpdates: {
          orderBy: {
            date: "asc",
          },
        },
      },
    };

    // Añadir filtros si están presentes
    if (type) {
      query.where.type = type;
    }

    if (status) {
      query.where.status = status;
    }

    const goals = await prisma.goal.findMany(query);

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error al obtener objetivos:", error);
    return NextResponse.json(
      { error: "Error al obtener objetivos" },
      { status: 500 }
    );
  }
}

// POST /api/goals - Crear un nuevo objetivo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      title,
      description,
      targetValue,
      initialValue,
      unit,
      exerciseType,
      measurementType,
      startDate,
      targetDate,
    } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Validación de campos
    if (!type || !title) {
      return NextResponse.json(
        { error: "El tipo y título son obligatorios" },
        { status: 400 }
      );
    }

    // Obtener el valor actual del perfil para objetivos de peso
    let currentValue = initialValue;

    if (type === "weight" && !initialValue) {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });

      if (profile?.currentWeight) {
        currentValue = Number.parseFloat(profile.currentWeight);
      }
    }

    // Calcular progreso inicial
    let progress = 0;
    if (
      initialValue !== undefined &&
      targetValue !== undefined &&
      initialValue !== targetValue
    ) {
      const diff = Math.abs(currentValue - initialValue);
      const totalDiff = Math.abs(targetValue - initialValue);
      progress = Math.min(100, (diff / totalDiff) * 100);

      // Si el objetivo es reducir y el valor actual es menor que el inicial
      if (targetValue < initialValue && currentValue < initialValue) {
        progress = Math.min(100, (diff / totalDiff) * 100);
      }
      // Si el objetivo es aumentar y el valor actual es mayor que el inicial
      else if (targetValue > initialValue && currentValue > initialValue) {
        progress = Math.min(100, (diff / totalDiff) * 100);
      }
      // Si vamos en dirección contraria al objetivo
      else {
        progress = 0;
      }
    }

    // Crear nuevo objetivo
    const newGoal = await prisma.goal.create({
      data: {
        userId: user.id,
        type,
        title,
        description,
        targetValue,
        initialValue,
        currentValue,
        unit,
        exerciseType,
        measurementType,
        startDate: new Date(startDate),
        targetDate: targetDate ? new Date(targetDate) : null,
        status: "active",
        progress,
      },
    });

    // Si hay un valor inicial, crear el primer registro de progreso
    if (initialValue !== undefined) {
      await prisma.goalProgress.create({
        data: {
          goalId: newGoal.id,
          value: initialValue,
          date: new Date(startDate),
          notes: "Valor inicial",
        },
      });
    }

    return NextResponse.json(newGoal);
  } catch (error) {
    console.error("Error al crear objetivo:", error);
    return NextResponse.json(
      { error: "Error al crear objetivo" },
      { status: 500 }
    );
  }
}
