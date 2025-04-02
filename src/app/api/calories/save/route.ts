import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redis } from "@/lib/redis";

// Add a TTL constant
const PROFILE_CACHE_TTL = 60 * 5; // 5 minutes

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await req.json();
    const {
      dailyCalorieTarget,
      dailyProteinTarget,
      dailyCarbTarget,
      dailyFatTarget,
    } = data;

    // Validar datos
    if (
      !dailyCalorieTarget ||
      !dailyProteinTarget ||
      !dailyCarbTarget ||
      !dailyFatTarget
    ) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Verificar si el usuario tiene un perfil
    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    let updatedProfile;

    if (profile) {
      // Actualizar el perfil existente
      updatedProfile = await prisma.profile.update({
        where: {
          userId: session.user.id,
        },
        data: {
          dailyCalorieTarget,
          dailyProteinTarget,
          dailyCarbTarget,
          dailyFatTarget,
          updatedAt: new Date(),
        },
      });
    } else {
      // Crear un nuevo perfil si no existe
      updatedProfile = await prisma.profile.create({
        data: {
          userId: session.user.id,
          dailyCalorieTarget,
          dailyProteinTarget,
          dailyCarbTarget,
          dailyFatTarget,
        },
      });
    }

    // Actualizar Redis
    const cacheKey = `profile:${userId}`;
    await redis
      .set(cacheKey, JSON.stringify(updatedProfile), {
        ex: PROFILE_CACHE_TTL,
      })
      .catch((error) => {
        console.error("Error actualizando cache Redis:", error);
      });

    // Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Objetivos calóricos actualizados correctamente",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error al guardar objetivos calóricos:", error);
    return NextResponse.json(
      { error: "Error al guardar objetivos calóricos" },
      { status: 500 }
    );
  }
}
