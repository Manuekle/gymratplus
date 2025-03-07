import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { date, mealType, entries } = await req.json();

    if (!date || !mealType || !entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const mealLog = await prisma.mealLog.create({
      data: {
        userId: session.user.id,
        date: new Date(date),
        mealType,
        entries: {
          create: entries.map((entry) => ({
            foodId: entry.foodId,
            quantity: entry.quantity,
          })),
        },
      },
      include: { entries: { include: { food: true } } },
    });

    return NextResponse.json(mealLog, { status: 201 });
  } catch (error) {
    console.error("Error al registrar comida:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
