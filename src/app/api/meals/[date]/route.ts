import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const date = new Date(params.date);

    const meals = await prisma.mealLog.findMany({
      where: { userId: session.user.id, date: date },
      include: { entries: { include: { food: true } } },
      orderBy: { mealType: "asc" },
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error("Error al obtener comidas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
