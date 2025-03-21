import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "@/server/notifications";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const notifications = await getUserNotifications(session.user.id);
  return NextResponse.json(notifications);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json(
      { error: "ID de notificación requerido" },
      { status: 400 }
    );
  }

  const notification = await markNotificationAsRead(id, session.user.id);
  return NextResponse.json(notification);
}
