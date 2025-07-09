import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
    if (relation.status === "accepted") {
      return NextResponse.json(relation);
    }
    // Actualizar status
    const updated = await prisma.studentInstructor.update({
      where: { id },
      data: { status: "accepted" },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ACCEPT_STUDENT_ERROR]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
