import { NextRequest, NextResponse } from "next/server";
import {
  deleteNotification,
  markNotificationAsRead,
} from "@/lib/notifications/notification-service";
import { prisma } from "@/lib/database/prisma";
import { auth } from "../../../../../auth.ts";

export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 },
      );
    }

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 },
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Marcar la notificación como leída
    const updatedNotification = await markNotificationAsRead(id);

    if (!updatedNotification) {
      // Si la notificación ya no existe (fue eliminada), retornar 404
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedNotification);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 },
      );
    }

    const notification = await prisma.notification.findUnique({
      where: { id: id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 },
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const deletedNotification = await deleteNotification(id);
    return NextResponse.json(deletedNotification);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
