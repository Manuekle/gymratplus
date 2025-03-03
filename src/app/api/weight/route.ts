import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Obtener historial de peso del usuario autenticado
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const weights = await prisma.weight.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(weights);
}

// Agregar un nuevo registro de peso
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const newWeight = await prisma.weight.create({
    data: {
      userId: session.user.id,
      weight: body.weight,
      date: new Date(),
      notes: body.notes,
    },
  });

  return NextResponse.json(newWeight);
}
