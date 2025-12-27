import { NextRequest, NextResponse } from "next/server";
import { checkPhoneUniqueness } from "@/lib/auth/verification-service";
import { validatePhoneNumber } from "@/lib/utils/phone";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get("phone");
    const excludeUserId = searchParams.get("excludeUserId");

    if (!phone) {
      return NextResponse.json(
        { error: "Número de teléfono es requerido" },
        { status: 400 },
      );
    }

    const trimmedPhone = phone.trim();

    // Validar formato de teléfono
    if (!validatePhoneNumber(trimmedPhone)) {
      return NextResponse.json(
        {
          available: false,
          error:
            "Formato de teléfono inválido. Debe incluir código de país (ej: +1234567890)",
        },
        { status: 400 },
      );
    }

    // Verificar disponibilidad
    const result = await checkPhoneUniqueness(
      trimmedPhone,
      excludeUserId || undefined,
    );

    return NextResponse.json(
      {
        available: result.available,
        message: result.message,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking phone:", error);
    return NextResponse.json(
      { error: "Error al verificar el número de teléfono" },
      { status: 500 },
    );
  }
}
