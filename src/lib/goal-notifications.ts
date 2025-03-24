import { publishNotification } from "@/lib/redis";
import { createNotification } from "@/lib/notification-service";

export const GOAL_CHANNEL = "goal-notifications";

export async function publishGoalNotification(
  userId: string,
  action: "created" | "updated" | "completed" | "progress" | "achieved",
  goalTitle: string,
  progress?: number
): Promise<void> {
  // Add to Redis list for polling
  await publishNotification(userId, {
    type: "goal",
    title: getNotificationTitle(action),
    message: getNotificationMessage(action, goalTitle, progress),
  });
}

export async function createGoalCreatedNotification(
  userId: string,
  goalTitle: string
): Promise<void> {
  await createNotification({
    userId,
    title: "Nuevo objetivo creado",
    message: `Has creado un nuevo objetivo: ${goalTitle}`,
    type: "goal",
  });
}

export async function createGoalProgressUpdatedNotification(
  userId: string,
  goalTitle: string,
  progress: number
): Promise<void> {
  await createNotification({
    userId,
    title: "Progreso actualizado",
    message: `Has actualizado tu progreso en el objetivo "${goalTitle}" a ${progress.toFixed(
      1
    )}%`,
    type: "goal",
  });
}

export async function createGoalAchievedNotification(
  userId: string,
  goalTitle: string
): Promise<void> {
  await createNotification({
    userId,
    title: "¡Objetivo alcanzado!",
    message: `¡Felicidades! Has alcanzado tu objetivo: ${goalTitle}`,
    type: "goal",
  });
}

export async function createGoalCompletedNotification(
  userId: string,
  goalTitle: string
): Promise<void> {
  await createNotification({
    userId,
    title: "Objetivo completado",
    message: `Has marcado como completado tu objetivo: ${goalTitle}`,
    type: "goal",
  });
}

// Helper functions
function getNotificationTitle(action: string): string {
  switch (action) {
    case "created":
      return "Nuevo objetivo creado";
    case "updated":
      return "Objetivo actualizado";
    case "completed":
      return "Objetivo completado";
    case "progress":
      return "Progreso actualizado";
    case "achieved":
      return "¡Objetivo alcanzado!";
    default:
      return "Actualización de objetivo";
  }
}

function getNotificationMessage(
  action: string,
  goalTitle: string,
  progress?: number
): string {
  switch (action) {
    case "created":
      return `Has creado un nuevo objetivo: ${goalTitle}`;
    case "updated":
      return `Has actualizado tu objetivo: ${goalTitle}`;
    case "completed":
      return `Has marcado como completado tu objetivo: ${goalTitle}`;
    case "progress":
      return `Has actualizado tu progreso en el objetivo "${goalTitle}" a ${progress?.toFixed(
        1
      )}%`;
    case "achieved":
      return `¡Felicidades! Has alcanzado tu objetivo: ${goalTitle}`;
    default:
      return `Actualización en tu objetivo: ${goalTitle}`;
  }
}
