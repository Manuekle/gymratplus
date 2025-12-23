import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "../@auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el id de la relación desde la URL
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 },
      );
    }

    // Buscar la relación
    const relation = await prisma.studentInstructor.findUnique({
      where: { id },
    });
    if (!relation) {
      return NextResponse.json(
        { error: "Relación no encontrada" },
        { status: 404 },
      );
    }
    // Buscar el perfil de instructor
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { id: relation.instructorProfileId },
    });
    if (!instructorProfile || instructorProfile.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    if (relation.status === "active" || relation.status === "accepted") {
      // Si ya está activo, actualizar a active para consistencia
      if (relation.status === "accepted") {
        const updated = await prisma.studentInstructor.update({
          where: { id },
          data: { status: "active" },
        });
        return NextResponse.json(updated);
      }
      return NextResponse.json(relation);
    }
    // Actualizar status a active
    const updated = await prisma.studentInstructor.update({
      where: { id },
      data: { status: "active" },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
