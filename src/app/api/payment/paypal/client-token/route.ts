import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const environment = process.env.PAYPAL_ENVIRONMENT || "sandbox";
    const baseUrl =
      environment === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "PayPal credentials not configured" },
        { status: 500 },
      );
    }

    // Obtener el client token (access_token) para el SDK v6
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`,
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        response_type: "client_token",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Error obteniendo client token:", errorText);
      return NextResponse.json(
        { error: "Error al obtener client token de PayPal" },
        { status: 500 },
      );
    }

    const tokenData = await tokenResponse.json();

    return NextResponse.json({
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
    });
  } catch (error) {
    console.error("Error getting PayPal client token:", error);
    return NextResponse.json(
      {
        error: "Error al obtener client token",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
