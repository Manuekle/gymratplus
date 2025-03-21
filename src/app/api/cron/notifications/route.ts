import { NextResponse } from "next/server";
import { generateSystemNotifications } from "@/server/notifications";

export async function GET(request: Request) {
  // Verificar clave API para ejecutar el cron job
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("apiKey");

  if (apiKey !== process.env.CRON_API_KEY) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Generar notificaciones del sistema
  await generateSystemNotifications();

  return NextResponse.json({ success: true });
}
