import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = params;

  try {
    const food = await prisma.food.findUnique({
      where: { id },
    });

    if (!food) {
      return NextResponse.json(
        { error: "Alimento no encontrado" },
        { status: 404 }
      );
    }

    // Verificar acceso a alimentos personalizados
    if (food.userId && food.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para ver este alimento" },
        { status: 403 }
      );
    }

    return NextResponse.json(food);
  } catch (error) {
    console.error("Error al obtener alimento:", error);
    return NextResponse.json(
      { error: "Error al obtener el alimento" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = params;

  try {
    // Verificar que el alimento existe y pertenece al usuario
    const existingFood = await prisma.food.findUnique({
      where: { id },
    });

    if (!existingFood) {
      return NextResponse.json(
        { error: "Alimento no encontrado" },
        { status: 404 }
      );
    }

    // Solo permitir editar alimentos del sistema si se trata de marcar/desmarcar favorito
    if (!existingFood.userId && existingFood.userId !== session.user.id) {
      const body = await req.json();

      // Si solo está actualizando isFavorite, permitirlo
      if (Object.keys(body).length === 1 && "isFavorite" in body) {
        const updatedFood = await prisma.food.update({
          where: { id },
          data: { isFavorite: body.isFavorite },
        });
        return NextResponse.json(updatedFood);
      }

      return NextResponse.json(
        { error: "No puedes modificar alimentos del sistema" },
        { status: 403 }
      );
    }

    // Actualizar alimento personalizado
    const body = await req.json();
    const updatedFood = await prisma.food.update({
      where: { id },
      data: {
        name: body.name,
        calories: body.calories,
        protein: body.protein,
        carbs: body.carbs,
        fat: body.fat,
        fiber: body.fiber,
        sugar: body.sugar,
        serving: body.serving,
        category: body.category,
        imageUrl: body.imageUrl,
        isFavorite: body.isFavorite,
      },
    });

    return NextResponse.json(updatedFood);
  } catch (error) {
    console.error("Error al actualizar alimento:", error);
    return NextResponse.json(
      { error: "Error al actualizar el alimento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = params;

  try {
    // Verificar que el alimento existe y pertenece al usuario
    const existingFood = await prisma.food.findUnique({
      where: { id },
    });

    if (!existingFood) {
      return NextResponse.json(
        { error: "Alimento no encontrado" },
        { status: 404 }
      );
    }

    // Solo permitir eliminar alimentos personalizados
    if (!existingFood.userId || existingFood.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No puedes eliminar alimentos del sistema" },
        { status: 403 }
      );
    }

    // Eliminar alimento
    await prisma.food.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar alimento:", error);
    return NextResponse.json(
      { error: "Error al eliminar el alimento" },
      { status: 500 }
    );
  }
}
