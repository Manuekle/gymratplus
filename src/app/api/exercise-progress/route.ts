import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/exercise-progress - Obtener registros de progreso de ejercicios
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const exercise = url.searchParams.get("exercise"); // 'benchPress', 'squat', 'deadlift', 'all'

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const query: Prisma.ExerciseProgressFindManyArgs = {
      where: {
        userId: user.id,
      },
      orderBy: {
        date: "asc",
      },
    };

    // Añadir filtros de fecha si están presentes
    if (startDate) {
      query.where.date = {
        ...(query.where.date || {}),
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      query.where.date = {
        ...(query.where.date || {}),
        lte: new Date(endDate),
      };
    }

    // Seleccionar campos según el ejercicio solicitado
    if (exercise && exercise !== "all") {
      query.select = {
        id: true,
        date: true,
        createdAt: true,
      };

      // Añadir solo el ejercicio solicitado
      query.select[exercise] = true;
    }

    const progressData = await prisma.exerciseProgress.findMany(query);

    return NextResponse.json(progressData);
  } catch (error) {
    console.error("Error al obtener datos de progreso de ejercicios:", error);
    return NextResponse.json(
      { error: "Error al obtener datos de progreso de ejercicios" },
      { status: 500 }
    );
  }
}

// POST /api/exercise-progress - Crear un nuevo registro de progreso de ejercicios
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
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

    // Validación de campos
    if (!benchPress && !squat && !deadlift) {
      return NextResponse.json(
        {
          error: "Debe proporcionar al menos un valor de ejercicio",
        },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "La fecha es requerida" },
        { status: 400 }
      );
    }

    // Crear nuevo registro de progreso
    const newProgressEntry = await prisma.exerciseProgress.create({
      data: {
        userId: user.id,
        benchPress: benchPress ? Number.parseFloat(benchPress) : undefined,
        squat: squat ? Number.parseFloat(squat) : undefined,
        deadlift: deadlift ? Number.parseFloat(deadlift) : undefined,
        date: new Date(date),
        notes,
      },
    });

    return NextResponse.json(newProgressEntry);
  } catch (error) {
    console.error("Error al crear registro de progreso de ejercicios:", error);
    return NextResponse.json(
      { error: "Error al crear registro de progreso de ejercicios" },
      { status: 500 }
    );
  }
}
