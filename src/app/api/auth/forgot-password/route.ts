import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { redis } from "@/lib/database/redis";
import { sendEmail } from "@/lib/email/resend";
import { renderPasswordResetCodeEmail } from "@/lib/email/templates/password-reset-code";
import crypto from "crypto";

// Función para validar email
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para generar código de 6 dígitos
function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 },
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Validar formato de email
    if (!validateEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 },
      );
    }

    // Rate limiting: máximo 3 solicitudes por hora por email
    const rateLimitKey = `forgot-password:rate-limit:${trimmedEmail}`;
    const attempts = await redis.incr(rateLimitKey);

    if (attempts === 1) {
      await redis.expire(rateLimitKey, 60 * 60); // 1 hora
    }

    if (attempts > 3) {
      return NextResponse.json(
        {
          error:
            "Demasiados intentos. Por favor, espera una hora antes de intentar de nuevo.",
        },
        { status: 429 },
      );
    }

    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      select: { id: true, email: true, name: true },
    });

    // Si el usuario no existe, devolver error (el usuario quiere verificar si existe)
    if (!user) {
      return NextResponse.json(
        {
          error: "No existe una cuenta con ese email.",
        },
        { status: 404 },
      );
    }

    // Generar código de 6 dígitos
    const resetCode = generateResetCode();
    const codeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutos

    // Guardar código en Redis con el email como clave
    const codeKey = `reset-password-code:${trimmedEmail}`;
    await redis.set(
      codeKey,
      JSON.stringify({
        userId: user.id,
        email: user.email,
        code: resetCode,
        expiresAt: codeExpiry,
        attempts: 0, // Contador de intentos fallidos
      }),
      {
        ex: 10 * 60, // 10 minutos de expiración
      },
    );

    // Enviar email con el código usando Resend
    const emailHtml = await renderPasswordResetCodeEmail({
      code: resetCode,
      userName: user.name || undefined,
      userEmail: user.email,
      expiresIn: "10 minutos",
    });

    const emailResult = await sendEmail({
      to: user.email,
      subject: "Tu código de verificación - GymRatPlus",
      html: emailHtml,
    });

    // Si el email falló, devolver error
    if (!emailResult.success) {
      console.error("Error enviando email de reset:", emailResult.error);

      // En desarrollo, mostrar el código en la respuesta si el email falla
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json(
          {
            message:
              "Error al enviar email, pero aquí está el código (solo desarrollo):",
            code: resetCode,
            error: emailResult.error,
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          error: "Error al enviar el email. Por favor, intenta más tarde.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Código de verificación enviado a tu email.",
        // En desarrollo, también devolver el código para testing
        ...(process.env.NODE_ENV === "development" && { code: resetCode }),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud. Por favor, intenta más tarde.",
      },
      { status: 500 },
    );
  }
}
