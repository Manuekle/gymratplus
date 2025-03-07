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
    const { date, weight, chest, waist, hips, thighs, arms } = await req.json();

    if (!weight) {
      return NextResponse.json(
        { error: "El peso es obligatorio" },
        { status: 400 }
      );
    }

    const bodyMetrics = await prisma.bodyMetrics.create({
      data: {
        userId: session.user.id,
        date: new Date(date),
        weight,
        chest,
        waist,
        hips,
        thighs,
        arms,
      },
    });

    return NextResponse.json(bodyMetrics, { status: 201 });
  } catch (error) {
    console.error("Error al registrar medidas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
