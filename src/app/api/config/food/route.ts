import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { foodsToCreate } from "@/data/food";

const prisma = new PrismaClient();

// Mapeo de categorías a tipos de comida
function getMealTypesForCategory(category: string): string[] {
  const mealTypes: Record<string, string[]> = {
    // Desayuno
    lácteos: ["desayuno", "snack"],
    huevos: ["desayuno", "almuerzo", "cena"],
    frutas: ["desayuno", "snack"],
    cereales: ["desayuno", "snack"],

    // Almuerzo/Cena
    carnes: ["almuerzo", "cena"],
    pescados: ["almuerzo", "cena"],
    legumbres: ["almuerzo", "cena"],
    verduras: ["almuerzo", "cena"],
    arroz: ["almuerzo", "cena"],
    pastas: ["almuerzo", "cena"],

    // Snacks
    "frutos-secos": ["snack"],
    semillas: ["snack"],
    barras: ["snack"],

    // Cualquier momento
    aceites: ["desayuno", "almuerzo", "cena", "snack"],
    bebidas: ["desayuno", "almuerzo", "cena", "snack"],
    suplementos: ["desayuno", "almuerzo", "cena", "snack"],
    proteína: ["desayuno", "almuerzo", "cena", "snack"],
    otros: ["desayuno", "almuerzo", "cena", "snack"],
  };

  return mealTypes[category] || ["desayuno", "almuerzo", "cena", "snack"];
}

// Endpoint: sube todos los alimentos de foodsToCreate
export async function PUT() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar si ya existen alimentos base
    const existingFoodsCount = await prisma.food.count({
      where: { userId: null },
    });

    if (existingFoodsCount > 0) {
      return NextResponse.json({
        message: "Los alimentos base ya están cargados",
      });
    }

    // Insertar todos los alimentos de foodsToCreate
    const foods = await Promise.all(
      foodsToCreate.map(({ isFavorite, ...foodData }) =>
        prisma.food.create({
          data: {
            ...foodData,
            mealType: getMealTypesForCategory(foodData.category),
            userId: null, // Alimentos base del sistema
          },
        })
      )
    );

    return NextResponse.json({
      message: `Se cargaron ${foods.length} alimentos base correctamente`,
      count: foods.length,
    });
  } catch (error) {
    console.error("Error al cargar alimentos:", error);
    return NextResponse.json(
      {
        error: "Error al cargar los alimentos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
