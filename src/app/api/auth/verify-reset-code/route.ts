import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/database/redis";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email y código son requeridos" },
        { status: 400 },
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    // Validar formato del código (6 dígitos)
    if (!/^\d{6}$/.test(trimmedCode)) {
      return NextResponse.json(
        { error: "El código debe tener 6 dígitos" },
        { status: 400 },
      );
    }

    // Buscar código en Redis
    const codeKey = `reset-password-code:${trimmedEmail}`;
    const codeData = await redis.get(codeKey);

    if (!codeData) {
      return NextResponse.json(
        { error: "Código inválido o expirado. Solicita uno nuevo." },
        { status: 400 },
      );
    }

    // Manejar tanto string JSON como objeto ya parseado
    const parsedData =
      typeof codeData === "string" ? JSON.parse(codeData) : codeData;

    // Verificar si el código ha expirado
    if (parsedData.expiresAt && Date.now() > parsedData.expiresAt) {
      await redis.del(codeKey);
      return NextResponse.json(
        { error: "Código expirado. Solicita uno nuevo." },
        { status: 400 },
      );
    }

    // Verificar intentos fallidos (máximo 5 intentos)
    if (parsedData.attempts >= 5) {
      await redis.del(codeKey);
      return NextResponse.json(
        {
          error:
            "Demasiados intentos fallidos. Solicita un nuevo código de verificación.",
        },
        { status: 429 },
      );
    }

    // Verificar si el código es correcto
    if (parsedData.code !== trimmedCode) {
      // Incrementar contador de intentos
      parsedData.attempts = (parsedData.attempts || 0) + 1;
      await redis.set(codeKey, JSON.stringify(parsedData), {
        ex: Math.ceil((parsedData.expiresAt - Date.now()) / 1000), // Mantener tiempo restante
      });

      const remainingAttempts = 5 - parsedData.attempts;
      return NextResponse.json(
        {
          error: `Código incorrecto. Te quedan ${remainingAttempts} intento${remainingAttempts !== 1 ? "s" : ""}.`,
        },
        { status: 400 },
      );
    }

    // Código correcto - generar token de sesión para reset
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutos para cambiar la contraseña

    // Guardar token de sesión
    const tokenKey = `reset-password-token:${resetToken}`;
    await redis.set(
      tokenKey,
      JSON.stringify({
        userId: parsedData.userId,
        email: parsedData.email,
        expiresAt: tokenExpiry,
      }),
      {
        ex: 15 * 60, // 15 minutos
      },
    );

    // Eliminar el código usado
    await redis.del(codeKey);

    return NextResponse.json(
      {
        success: true,
        token: resetToken,
        message: "Código verificado correctamente.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error verificando código:", error);
    return NextResponse.json(
      {
        error: "Error al verificar el código. Por favor, intenta más tarde.",
      },
      { status: 500 },
    );
  }
}
