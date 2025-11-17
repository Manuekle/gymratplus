import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/database/redis";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token no proporcionado" },
        { status: 400 },
      );
    }

    // Buscar token en Redis (ahora viene de verify-reset-code)
    const tokenKey = `reset-password-token:${token}`;
    const tokenData = await redis.get(tokenKey);

    if (!tokenData) {
      return NextResponse.json(
        { valid: false, error: "Token inválido o expirado" },
        { status: 200 },
      );
    }

    // Manejar tanto string JSON como objeto ya parseado
    const parsedData =
      typeof tokenData === "string" ? JSON.parse(tokenData) : tokenData;

    // Verificar si el token ha expirado
    if (parsedData.expiresAt && Date.now() > parsedData.expiresAt) {
      // Eliminar token expirado
      await redis.del(tokenKey);
      return NextResponse.json(
        { valid: false, error: "Token expirado" },
        { status: 200 },
      );
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    console.error("Error validating reset token:", error);
    return NextResponse.json(
      { valid: false, error: "Error al validar el token" },
      { status: 500 },
    );
  }
}
