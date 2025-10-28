import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { deleteNotification } from "@/lib/notification-service";
import { prisma } from "@/lib/prisma";

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

    const session = await getServerSession(authOptions);

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

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error fetching notification:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
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
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
