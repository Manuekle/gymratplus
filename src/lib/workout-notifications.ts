import { publishWorkout } from "@/lib/redis";
import { createNotification } from "@/lib/notification-service";

export type WorkoutAction = "started" | "completed" | "progress" | "cancelled";

export async function publishWorkoutNotification(
  userId: string,
  workoutSessionId: string,
  action: WorkoutAction,
  workoutName: string,
  day?: string,
): Promise<void> {
  // Add to Redis list for polling
  await publishWorkout(userId, workoutSessionId, action, workoutName, day);
}

export async function createWorkoutStartedNotification(
  userId: string,
  workoutName: string,
  day: string,
): Promise<void> {
  await createNotification({
    userId,
    title: "Entrenamiento iniciado",
    message: `Has iniciado una sesión de entrenamiento "${workoutName}" para el día ${day}.`,
    type: "workout",
  });
}

export async function createWorkoutCompletedNotification(
  userId: string,
  workoutName: string,
): Promise<void> {
  await createNotification({
    userId,
    title: "Entrenamiento completado",
    message: `¡Felicidades! Has completado tu sesión de entrenamiento "${workoutName}".`,
    type: "workout",
  });
}

export async function createWorkoutCancelledNotification(
  userId: string,
  workoutName: string,
): Promise<void> {
  await createNotification({
    userId,
    title: "Entrenamiento cancelado",
    message: `Has cancelado la sesión de entrenamiento "${workoutName}".`,
    type: "workout",
  });
}

export async function createWorkoutProgressNotification(
  userId: string,
  workoutName: string,
  progressPercentage: number,
): Promise<void> {
  await createNotification({
    userId,
    title: "Progreso de entrenamiento",
    message: `Has completado el ${progressPercentage}% de tu sesión de entrenamiento "${workoutName}".`,
    type: "workout",
  });
}
