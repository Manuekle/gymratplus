import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  getUserNotifications,
  createNotification,
  markAllNotificationsAsRead,
  deleteAllNotifications,
  type CreateNotificationParams,
} from "@/lib/notification-service";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 });
  }

  try {
    const notifications = await getUserNotifications(session.user.id);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

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
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 },
    );
  }
}

export async function PATCH() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 });
  }

  try {
    const result = await markAllNotificationsAsRead(session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.id) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 });
  }

  try {
    const result = await deleteAllNotifications(session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 },
    );
  }
}
