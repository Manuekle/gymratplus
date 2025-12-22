import { type NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth.ts";
import {
  getUserNotifications,
  createNotification,
  markAllNotificationsAsRead,
  deleteAllNotifications,
  type CreateNotificationParams,
} from "@/lib/notifications/notification-service";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 });
  }

  try {
    const notifications = await getUserNotifications(session.user.id);
    return NextResponse.json(notifications);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const notificationData: CreateNotificationParams = {
      userId: session.user.id,
      title: body.title,
      message: body.message,
      type: body.type,
    };

    const notification = await createNotification(notificationData);
    return NextResponse.json(notification);
  } catch {
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 },
    );
  }
}

export async function PATCH() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 });
  }

  try {
    const result = await markAllNotificationsAsRead(session.user.id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 });
  }

  try {
    const result = await deleteAllNotifications(session.user.id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 },
    );
  }
}
