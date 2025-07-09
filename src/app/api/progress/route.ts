import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

// GET /api/progress - Obtener registros de progreso (peso, grasa corporal, masa muscular)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const type = url.searchParams.get("type") || "all"; // 'weight', 'bodyFat', 'muscle', 'all'

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    const query: Prisma.WeightFindManyArgs = {
      where: {
        userId: user.id,
      },
      orderBy: {
        date: "asc",
      },
    };

    // Añadir filtros de fecha si están presentes
    if (startDate) {
      query.where = query.where || {};
      query.where.date = {
        ...(typeof query.where.date === "object" ? query.where.date : {}),
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      query.where = query.where || {};
      query.where.date = {
        ...(typeof query.where.date === "object" ? query.where.date : {}),
        lte: new Date(endDate),
      };
    }

    // Seleccionar campos según el tipo de datos solicitado
    if (type === "weight") {
      query.select = {
        id: true,
        date: true,
        weight: true,
        createdAt: true,
      };
    } else if (type === "bodyFat") {
      query.select = {
        id: true,
        date: true,
        bodyFatPercentage: true,
        createdAt: true,
      };
    } else if (type === "muscle") {
      query.select = {
        id: true,
        date: true,
        muscleMassPercentage: true,
        createdAt: true,
      };
    }

    const progressData = await prisma.weight.findMany(query);

    return NextResponse.json(progressData);
  } catch (error) {
    console.error("Error al obtener datos de progreso:", error);
    return NextResponse.json(
      { error: "Error al obtener datos de progreso" },
      { status: 500 },
    );
  }
}

// POST /api/progress - Crear un nuevo registro de progreso
export async function POST(req: NextRequest) {
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
        { status: 404 },
      );
    }

    // Validación de campos
    if (!weight && !bodyFatPercentage && !muscleMassPercentage) {
      return NextResponse.json(
        {
          error:
            "Debe proporcionar al menos un valor de peso, grasa corporal o masa muscular",
        },
        { status: 400 },
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "La fecha es requerida" },
        { status: 400 },
      );
    }

    // Preparar datos para creación
    const createData: any = {
      userId: user.id,
      weight: weight ? Number.parseFloat(weight) : 0,
      date: new Date(date),
    };
    
    if (bodyFatPercentage !== undefined) {
      createData.bodyFatPercentage = Number.parseFloat(bodyFatPercentage);
    }
    
    if (muscleMassPercentage !== undefined) {
      createData.muscleMassPercentage = Number.parseFloat(muscleMassPercentage);
    }
    
    if (notes !== undefined) {
      createData.notes = notes;
    }

    // Crear nuevo registro de progreso
    const newProgressEntry = await prisma.weight.create({
      data: createData,
    });

    // Si se registró un peso, actualizar el perfil del usuario
    if (weight) {
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: { currentWeight: weight.toString() }, // Usar currentWeight y convertir a string
        create: {
          userId: user.id,
          currentWeight: weight.toString(), // Usar currentWeight y convertir a string
        },
      });
    }

    return NextResponse.json(newProgressEntry);
  } catch (error) {
    console.error("Error al crear registro de progreso:", error);
    return NextResponse.json(
      { error: "Error al crear registro de progreso" },
      { status: 500 },
    );
  }
}
