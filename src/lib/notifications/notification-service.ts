import { prisma } from "@/lib/database/prisma";
import type { Notification } from "@prisma/client";

export type NotificationType =
  | "workout"
  | "meal"
  | "water"
  | "weight"
  | "goal"
  | "system"
  | "chat";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}

export interface CreateNotificationByEmailParams {
  userEmail: string;
  title: string;
  message: string;
  type: NotificationType;
}

export async function createNotification({
  userId,
  title,
  message,
  type,
}: CreateNotificationParams): Promise<Notification> {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      read: false,
    },
  });

  // Send Push Notification
  try {
    // @ts-ignore - PushSubscription is generated but not picked up by IDE sometimes
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length > 0) {
      // Import web-push dynamically to avoid issues in edge runtimes if applicable
      // though this is a server action/lib, dynamic import is safer for optional deps
      const webpush = require("web-push");

      // Ensure VAPID keys are available
      if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webpush.setVapidDetails(
          process.env.VAPID_SUBJECT || "mailto:support@gymratplus.com",
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY,
        );

        const payload = JSON.stringify({
          title,
          body: message,
          url: "/dashboard/notifications", // Default URL, could be improved with type-specific URLs
          tag: notification.id,
        });

        await Promise.allSettled(
          subscriptions.map((sub: any) =>
            webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              payload,
            ),
          ),
        );
      }
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
    // Don't fail the notification creation if push fails
  }

  return notification;
}

export async function createNotificationByEmail({
  userEmail,
  title,
  message,
  type,
}: CreateNotificationByEmailParams): Promise<Notification> {
  // Buscar el usuario por email
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });

  if (!user) {
    throw new Error(`Usuario con email ${userEmail} no encontrado`);
  }

  return prisma.notification.create({
    data: {
      userId: user.id,
      title,
      message,
      type,
      read: false,
    },
  });
}

export async function getUserNotifications(
  userId: string,
): Promise<Notification[]> {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUnreadNotificationsCount(
  userId: string,
): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
}

export async function markNotificationAsRead(
  id: string,
): Promise<Notification | null> {
  try {
    // Verificar que la notificación existe antes de actualizar
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return null; // Retornar null si no existe
    }

    return prisma.notification.update({
      where: {
        id,
      },
      data: {
        read: true,
      },
    });
  } catch (error) {
    // Si es un error de registro no encontrado, retornar null
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return null;
    }
    throw error;
  }
}

export async function markAllNotificationsAsRead(
  userId: string,
): Promise<{ count: number }> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });

  return { count: result.count };
}

export async function deleteNotification(id: string): Promise<Notification> {
  return prisma.notification.delete({
    where: {
      id,
    },
  });
}

export async function deleteAllNotifications(
  userId: string,
): Promise<{ count: number }> {
  const result = await prisma.notification.deleteMany({
    where: {
      userId,
    },
  });

  return { count: result.count };
}
