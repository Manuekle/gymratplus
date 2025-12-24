import { NextRequest, NextResponse } from "next/server";
import { verifyCode } from "@/lib/auth/verification-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[VERIFY-API] Received body:", JSON.stringify(body));
    const { userId, code, type } = body;

    // Validar parámetros requeridos
    if (!userId || !code || !type) {
      console.log("[VERIFY-API] Missing parameters:", { userId, code, type });
      return NextResponse.json(
        {
          error: "Parámetros requeridos: userId, code, type",
        },
        { status: 400 },
      );
    }

    // Validar tipo
    if (type !== "email") {
      return NextResponse.json(
        {
          error: "Tipo inválido. Solo se soporta 'email' por ahora",
        },
        { status: 400 },
      );
    }

    // Validar formato del código (6 dígitos)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          error: "El código debe tener 6 dígitos",
        },
        { status: 400 },
      );
    }

    // Verificar código
    const result = await verifyCode(userId, code, type);

    if (!result.success) {
      console.log(`[VERIFY] Verification failed for user ${userId}: ${result.error}`);
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: result.error,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        verified: true,
        message:
          type === "email"
            ? "Email verificado exitosamente"
            : "Teléfono verificado exitosamente",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("FATAL ERROR in verify-code API:", error);
    return NextResponse.json(
      {
        success: false,
        verified: false,
        error: "Error al procesar la solicitud. Por favor, intenta más tarde.",
        debug: process.env.NODE_ENV === "development" ? (error as any)?.message : undefined
      },
      { status: 500 },
    );
  }
}
