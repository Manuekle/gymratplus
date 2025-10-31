import { prisma } from "@/lib/database/prisma";
import type { Notification } from "@prisma/client";

export type NotificationType =
  | "workout"
  | "meal"
  | "water"
  | "weight"
  | "goal"
  | "system";

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
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      read: false,
    },
  });
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
): Promise<Notification> {
  return prisma.notification.update({
    where: {
      id,
    },
    data: {
      read: true,
    },
  });
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
