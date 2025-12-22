import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import bcrypt from "bcryptjs";
import { redis } from "@/lib/database/redis";
import { sendEmailVerification } from "@/lib/auth/verification-service";

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

// Función para sanitizar inputs
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

// Función para validar email
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para validar nombre
function validateName(name: string): { valid: boolean; error?: string } {
  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return {
      valid: false,
      error: "El nombre debe tener al menos 2 caracteres",
    };
  }

  if (trimmedName.length > 50) {
    return {
      valid: false,
      error: "El nombre no puede exceder 50 caracteres",
    };
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(trimmedName)) {
    return {
      valid: false,
      error: "El nombre solo puede contener letras y espacios",
    };
  }

  return { valid: true };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { email, password, name } = body;

    // Validar campos requeridos
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, contraseña y nombre son requeridos" },
        { status: 400 },
      );
    }

    // Sanitizar inputs
    email = sanitizeInput(email).toLowerCase();
    name = sanitizeInput(name);
    password = password.trim(); // No sanitizar contraseña para permitir caracteres especiales

    // Validar email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 },
      );
    }

    // Validar nombre
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
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
        { status: 429 },
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 },
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    // Guardar en caché para acceso rápido
    await redis.set(`user:email:${email}`, user, {
      ex: 60 * 10, // 10 minutos
    });

    // Enviar código de verificación por email
    try {
      await sendEmailVerification(user.id, email, name);
    } catch (emailError) {
      console.error("Error enviando email de verificación:", emailError);
      // No fallamos el registro si falla el email, pero el frontend debería saberlo
    }

    return NextResponse.json(
      {
        user: { ...userWithoutPassword, id: user.id }, // Aseguramos que el ID se devuelva explícitamente y typing correcto
        verificationRequired: true,
        message:
          "Usuario registrado exitosamente. Por favor verifica tu email.",
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    let message = "Unknown error";
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json(
      { error: "Error al registrar usuario: " + message },
      { status: 500 },
    );
  }
}
