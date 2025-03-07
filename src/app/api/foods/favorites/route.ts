import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const favorites = await prisma.food.findMany({
      where: {
        isFavorite: true,
        OR: [{ userId: null }, { userId: session.user.id }],
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return NextResponse.json(
      { error: "Error al obtener los alimentos favoritos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { foodId, isFavorite } = body;

    if (!foodId) {
      return NextResponse.json(
        { error: "Se requiere el ID del alimento" },
        { status: 400 }
      );
    }

    // Verificar que el alimento existe
    const food = await prisma.food.findUnique({
      where: { id: foodId },
    });

    if (!food) {
      return NextResponse.json(
        { error: "Alimento no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar estado de favorito
    const updatedFood = await prisma.food.update({
      where: { id: foodId },
      data: { isFavorite: isFavorite ?? true },
    });

    return NextResponse.json(updatedFood);
  } catch (error) {
    console.error("Error al marcar favorito:", error);
    return NextResponse.json(
      { error: "Error al actualizar favorito" },
      { status: 500 }
    );
  }
}
