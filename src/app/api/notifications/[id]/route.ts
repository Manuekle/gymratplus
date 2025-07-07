import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  markNotificationAsRead,
  deleteNotification,
} from "@/lib/notification-service";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    const notification = await prisma.notification.findUnique({
      where: { id: id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error fetching notification:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    const notification = await prisma.notification.findUnique({
      where: { id: id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedNotification = await markNotificationAsRead(id ?? "");
    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    const notification = await prisma.notification.findUnique({
      where: { id: id },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const deletedNotification = await deleteNotification(id ?? "");
    return NextResponse.json(deletedNotification);
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
