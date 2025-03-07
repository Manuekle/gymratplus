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
    // Obtener categorías disponibles
    const categories = await prisma.food.groupBy({
      by: ["category"],
      orderBy: {
        category: "asc",
      },
    });

    return NextResponse.json(categories.map((c) => c.category));
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json(
      { error: "Error al obtener las categorías de alimentos" },
      { status: 500 }
    );
  }
}
