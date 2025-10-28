import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/me/tags - Get current user's interests
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      // El campo interests ya existe tras la migración y prisma generate
    });

    return NextResponse.json(user?.interests ?? []);
  } catch (error) {
    console.error("Error fetching user interests:", error);
    return NextResponse.json(
      { error: "Error fetching user interests" },
      { status: 500 },
    );
  }
}

// PUT /api/users/me/tags - Update user's interests
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { interests } = await req.json();
  if (!Array.isArray(interests)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { interests },
    select: { interests: true },
  });

  // Limpiar caché de usuario si usas Redis
  try {
    const { redis } = await import("@/lib/redis");
    await redis.del(`user:${session.user.id}:data`);
    await redis.del(`session:${session.user.id}`);
  } catch {}

  // Devuelve los intereses actualizados
  return NextResponse.json({ interests: user.interests });
}
