import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { redis } from "@/lib/database/redis";
import bcrypt from "bcryptjs";

// Función para validar fortaleza de contraseña
function validatePasswordStrength(password: string): {
  valid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return {
      valid: false,
      error: "La contraseña debe tener al menos 8 caracteres",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "La contraseña debe contener al menos una mayúscula",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: "La contraseña debe contener al menos una minúscula",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error: "La contraseña debe contener al menos un número",
    };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      valid: false,
      error: "La contraseña debe contener al menos un carácter especial",
    };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token y contraseña son requeridos" },
        { status: 400 },
      );
    }

    // Validar fortaleza de contraseña
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 },
      );
    }

    // Buscar token en Redis (ahora viene de verify-reset-code)
    const tokenKey = `reset-password-token:${token}`;
    const tokenData = await redis.get(tokenKey);

    if (!tokenData) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 },
      );
    }

    const parsedData =
      typeof tokenData === "string" ? JSON.parse(tokenData) : tokenData;

    // Verificar si el token ha expirado
    if (parsedData.expiresAt && Date.now() > parsedData.expiresAt) {
      await redis.del(tokenKey);
      return NextResponse.json(
        { error: "Token expirado. Por favor, solicita un nuevo enlace." },
        { status: 400 },
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: parsedData.userId },
      select: { id: true },
    });

    if (!user) {
      await redis.del(tokenKey);
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar contraseña en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Eliminar el token usado (solo puede usarse una vez)
    await redis.del(tokenKey);

    // Limpiar cachés relacionadas
    const cacheKeys = [
      `user:${user.id}:data`,
      `profile:${user.id}`,
      `session:${user.id}`,
    ];

    await Promise.all(cacheKeys.map((key) => redis.del(key))).catch(() => {});

    return NextResponse.json(
      { message: "Contraseña restablecida exitosamente" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json(
      {
        error:
          "Error al restablecer la contraseña. Por favor, intenta más tarde.",
      },
      { status: 500 },
    );
  }
}
