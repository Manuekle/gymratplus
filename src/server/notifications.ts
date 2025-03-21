/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { redis } from "@/lib/redis";

const prisma = new PrismaClient();

export type NotificationType =
  | "workout"
  | "goal"
  | "meal"
  | "weight"
  | "progress"
  | "nutrition"
  | "water";

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}

// Crear una notificación en la base de datos
export async function createNotification(data: NotificationPayload) {
  const notification = await prisma.notification.create({
    data: {
      title: data.title,
      message: data.message,
      type: data.type,
      read: false,
    },
  });

  // Invalida la caché de notificaciones para este usuario
  await redis.del(`notifications:${data.userId}`);

  return notification;
}

// Obtener notificaciones con caché
export async function getUserNotifications(userId: string, limit: number = 10) {
  // Intenta obtener de la caché primero
  const cached = await redis.get<any[]>(`notifications:${userId}`);

  if (cached) {
    return cached;
  }

  // Si no está en caché, obtener de la base de datos
  const notifications = await prisma.notification.findMany({
    where: {
      // Aquí deberías agregar una relación userId en tu modelo Notification
      // Actualmente tu modelo no tiene esta relación
      // Asumiremos que lo agregarás
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  // Guardar en caché por 5 minutos
  await redis.set(`notifications:${userId}`, notifications, { ex: 300 });

  return notifications;
}

// Marcar notificación como leída
export async function markNotificationAsRead(id: string, userId: string) {
  const notification = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  // Invalida la caché
  await redis.del(`notifications:${userId}`);

  return notification;
}

// Generador de notificaciones basadas en eventos del sistema
export async function generateSystemNotifications() {
  // Esta función se ejecutaría a través de un cron job

  // 1. Notificaciones de entrenamiento
  const upcomingWorkouts = await prisma.workoutSession.findMany({
    where: {
      date: {
        gte: new Date(),
        lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // Próximas 24 horas
      },
      completed: false,
    },
    include: {
      user: true,
      workout: true,
    },
  });

  for (const workout of upcomingWorkouts) {
    await createNotification({
      userId: workout.userId,
      title: "Recordatorio de entrenamiento",
      message: `Tu entrenamiento "${workout.workout.name}" está programado para hoy`,
      type: "workout",
    });
  }

  // 2. Notificaciones de objetivos casi completados
  const nearCompletionGoals = await prisma.goal.findMany({
    where: {
      status: "active",
      progress: {
        gte: 90,
        lt: 100,
      },
    },
    include: {
      user: true,
    },
  });

  for (const goal of nearCompletionGoals) {
    await createNotification({
      userId: goal.userId,
      title: "¡Casi logras tu objetivo!",
      message: `Estás al ${goal.progress}% de completar tu objetivo "${goal.title}"`,
      type: "goal",
    });
  }

  // 3. Recordatorios de registro de peso
  const usersNeedingWeightUpdate = await prisma.user.findMany({
    where: {
      weights: {
        none: {
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Última semana
          },
        },
      },
    },
  });

  for (const user of usersNeedingWeightUpdate) {
    await createNotification({
      userId: user.id,
      title: "Actualiza tu peso",
      message: "Ha pasado una semana desde tu último registro de peso",
      type: "weight",
    });
  }

  // Puedes agregar más tipos de notificaciones según tus necesidades
}
