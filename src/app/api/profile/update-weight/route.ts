import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/database/prisma";
import { auth } from "../../../../../../../../../../auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { weight } = body;

    if (!weight || typeof weight !== "number") {
      return NextResponse.json(
        { error: "El peso es requerido y debe ser un número" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Actualizar el peso en el perfil del usuario
    // Usar currentWeight en lugar de weight
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: { currentWeight: weight.toString() }, // Convertir a string según el esquema
      create: {
        userId: user.id,
        currentWeight: weight.toString(), // Convertir a string según el esquema
      },
    });

    return NextResponse.json({
      success: true,
      message: "Peso actualizado correctamente en el perfil",
      profile: updatedProfile,
    });
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar peso en perfil" },
      { status: 500 },
    );
  }
}
