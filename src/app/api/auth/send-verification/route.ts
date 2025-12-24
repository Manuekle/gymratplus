import { NextRequest, NextResponse } from "next/server";
import {
  sendEmailVerification,
  // sendSMSVerification,
  checkEmailUniqueness,
  // checkPhoneUniqueness,
} from "@/lib/auth/verification-service";
// import { validatePhoneNumber } from "@/lib/sms/twilio";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, destination, userId, userName } = body;

    // Validar parámetros requeridos
    if (!type || !destination || !userId) {
      return NextResponse.json(
        {
          error: "Parámetros requeridos: type, destination, userId",
        },
        { status: 400 },
      );
    }

    // Validar tipo
    if (type !== "email" && type !== "sms") {
      return NextResponse.json(
        {
          error: "Tipo inválido. Debe ser 'email' o 'sms'",
        },
        { status: 400 },
      );
    }

    // Verificación por email
    if (type === "email") {
      const trimmedEmail = destination.trim().toLowerCase();

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json(
          { error: "Formato de email inválido" },
          { status: 400 },
        );
      }

      // Verificar unicidad
      const uniqueCheck = await checkEmailUniqueness(trimmedEmail, userId);
      if (!uniqueCheck.available) {
        return NextResponse.json(
          { error: uniqueCheck.message },
          { status: 409 },
        );
      }

      // Enviar código
      const result = await sendEmailVerification(
        userId,
        trimmedEmail,
        userName,
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json(
        {
          success: true,
          message: "message" in result ? result.message : "Código enviado",
          ...("code" in result && result.code ? { code: result.code } : {}),
        },
        { status: 200 },
      );
    }

    /* 
    // Verificación por SMS
    if (type === "sms") {
      const trimmedPhone = destination.trim();

      // Validar formato de teléfono
      if (!validatePhoneNumber(trimmedPhone)) {
        return NextResponse.json(
          {
            error:
              "Formato de teléfono inválido. Debe incluir código de país (ej: +1234567890)",
          },
          { status: 400 },
        );
      }

      // Verificar unicidad
      const uniqueCheck = await checkPhoneUniqueness(trimmedPhone, userId);
      if (!uniqueCheck.available) {
        return NextResponse.json(
          { error: uniqueCheck.message },
          { status: 409 },
        );
      }

      // Enviar código
      const result = await sendSMSVerification(userId, trimmedPhone);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json(
        {
          success: true,
          message: "message" in result ? result.message : "Código enviado",
          ...("code" in result && result.code ? { code: result.code } : {}),
        },
        { status: 200 },
      );
    }
    */

    return NextResponse.json(
      { error: "Tipo de verificación no soportado" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error en send-verification:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud. Por favor, intenta más tarde.",
      },
      { status: 500 },
    );
  }
}
