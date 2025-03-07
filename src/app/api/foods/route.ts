import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Obtener parámetros de búsqueda
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const onlyFavorites = searchParams.get("favorites") === "true";

  // Construir filtros
  const filters: any = {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { category: { contains: query, mode: "insensitive" } },
    ],
  };

  if (category) {
    filters.category = category;
  }

  if (onlyFavorites) {
    filters.AND = [
      { isFavorite: true },
      { OR: [{ userId: null }, { userId: session.user.id }] },
    ];
  } else {
    filters.OR.push({
      OR: [{ userId: null }, { userId: session.user.id }],
    });
  }

  // Realizar búsqueda paginada
  const foods = await prisma.food.findMany({
    where: filters,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: {
      name: "asc",
    },
  });

  const total = await prisma.food.count({ where: filters });

  return NextResponse.json({
    foods,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Validar campos requeridos
    const requiredFields = [
      "name",
      "calories",
      "protein",
      "carbs",
      "fat",
      "serving",
      "category",
    ];
    for (const field of requiredFields) {
      if (body[field] === undefined) {
        return NextResponse.json(
          { error: `El campo ${field} es requerido` },
          { status: 400 }
        );
      }
    }

    // Crear alimento personalizado
    const newFood = await prisma.food.create({
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
        userId: session.user.id, // Asociar al usuario actual
        isFavorite: body.isFavorite || false,
      },
    });

    return NextResponse.json(newFood, { status: 201 });
  } catch (error) {
    console.error("Error al crear alimento:", error);
    return NextResponse.json(
      { error: "Error al crear el alimento" },
      { status: 500 }
    );
  }
}
