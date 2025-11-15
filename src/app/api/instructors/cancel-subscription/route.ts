import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { redis } from "@/lib/database/redis";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the user's subscription status
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isInstructor: false,
      },
      include: {
        instructorProfile: true,
      },
    });

    // Limpiar todas las cachés relacionadas con el usuario
    const cacheKeys = [
      `user:${session.user.id}:data`,
      `profile:${session.user.id}`,
      `session:${session.user.id}`,
      `instructorProfile:${session.user.id}`,
    ];

    // Eliminar todas las cachés
    await Promise.all(cacheKeys.map((key) => redis.del(key))).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        redirectTo: "/dashboard",
        isInstructor: updatedUser.isInstructor,
      },
      { status: 200 },
    );
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
