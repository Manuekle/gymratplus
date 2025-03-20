/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";

// Inicializar cliente de Redis con Upstash
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Verificar rate limiting para prevenir spam de registro
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const registerAttemptKey = `register:attempt:${ip}`;
    const attempts = await redis.incr(registerAttemptKey);

    // Establecer expiración solo la primera vez
    if (attempts === 1) {
      await redis.expire(registerAttemptKey, 60 * 60); // 1 hora
    }

    if (attempts > 10) {
      return NextResponse.json(
        { error: "Demasiados intentos. Intente más tarde." },
        { status: 429 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Limpiar datos sensibles
    const { password: _, ...userWithoutPassword } = user;

    // Guardar en caché para acceso rápido
    await redis.set(`user:email:${email}`, user, {
      ex: 60 * 10, // 10 minutos
    });

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: "Usuario registrado exitosamente",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error en registro:", error);
    let message = "Unknown error";
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json(
      { error: "Error al registrar usuario: " + message },
      { status: 500 }
    );
  }
}
