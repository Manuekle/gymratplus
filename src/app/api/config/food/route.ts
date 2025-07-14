import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { foodsToCreate } from "@/data/food";

const prisma = new PrismaClient();

// Endpoint: sube todos los alimentos de foodsToCreate (sin restricción de admin)
export async function PUT() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar si ya existen alimentos base
    const existingFoodsCount = await prisma.food.count({
      where: { userId: null },
    });
    if (existingFoodsCount > 0) {
      return NextResponse.json({ message: "Los alimentos ya están cargados" });
    }

    // Insertar todos los alimentos de foodsToCreate
    const foods = await Promise.all(
      foodsToCreate.map((food) =>
        prisma.food.create({
          data: {
            ...food,
            mealType:
              food.category === "proteína" || food.category === "carbohidrato"
                ? ["desayuno", "almuerzo", "cena"]
                : food.category === "fruta"
                  ? ["desayuno", "snack"]
                  : food.category === "verdura"
                    ? ["almuerzo", "cena"]
                    : ["desayuno", "almuerzo", "cena", "snack"],
            userId: null, // Alimentos base del sistema
          },
        })
      )
    );

    return NextResponse.json({ message: `Se subieron ${foods.length} alimentos` });
  } catch (error) {
    console.error("Error al subir alimentos:", error);
    return NextResponse.json({ error: "Error al subir alimentos" }, { status: 500 });
  }
}
