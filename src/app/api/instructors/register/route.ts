import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createNotification } from "@/lib/notification-service";

const instructorRegisterSchema = z.object({
  bio: z.string().optional(),
  curriculum: z.string().optional(),
  pricePerMonth: z.number().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  isRemote: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      bio,
      curriculum,
      pricePerMonth,
      contactEmail,
      contactPhone,
      country,
      city,
      isRemote,
    } = instructorRegisterSchema.parse(body);

    // Transacción: actualizar usuario y perfil de instructor
    try {
      console.log(
        "[INSTRUCTOR_REGISTER] Actualizando usuario:",
        session.user.id,
      );
      const [user, instructorProfile] = await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: { isInstructor: true },
        }),
        prisma.instructorProfile.upsert({
          where: { userId: session.user.id },
          update: {
            bio,
            curriculum,
            pricePerMonth,
            contactEmail,
            contactPhone,
            country,
            city,
            isRemote,
          },
          create: {
            userId: session.user.id,
            bio,
            curriculum,
            pricePerMonth,
            contactEmail,
            contactPhone,
            country,
            city,
            isRemote,
          },
        }),
      ]);
      console.log("[INSTRUCTOR_REGISTER] Usuario actualizado:", user);
      console.log(
        "[INSTRUCTOR_REGISTER] Perfil instructor actualizado/creado:",
        instructorProfile,
      );
    } catch (err) {
      console.error("[INSTRUCTOR_REGISTER] Error en la transacción:", err);
      return NextResponse.json(
        { error: "Error actualizando usuario o perfil de instructor" },
        { status: 500 },
      );
    }

    // Limpiar cache de usuario en Redis
    try {
      const { redis } = await import("@/lib/redis");
      const cacheKeys = [
        `user:${session.user.id}:data`,
        `profile:${session.user.id}`,
        `session:${session.user.id}`,
      ];
      await Promise.all(cacheKeys.map((key) => redis.del(key)));
    } catch (e) {
      console.error("Error limpiando cache de usuario en Redis", e);
    }

    // Crear notificación de bienvenida para el instructor
    await createNotification({
      userId: session.user.id,
      title: "¡Bienvenido como instructor!",
      message:
        "Tu perfil de instructor ha sido creado exitosamente. Ahora puedes recibir solicitudes de alumnos.",
      type: "system",
    });

    // Obtener el usuario actualizado
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        experienceLevel: true,
        image: true,
        isInstructor: true,
        instructorProfile: true,
        profile: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Perfil de instructor creado correctamente",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("[INSTRUCTOR_REGISTER_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
