import { createNotification } from "@/lib/notification-service";

// Workout notifications
export async function createWorkoutReminderNotification(
  userId: string,
  workoutName: string
) {
  return createNotification({
    userId,
    title: "Recordatorio de entrenamiento",
    message: `¡No olvides tu entrenamiento de ${workoutName} hoy!`,
    type: "workout",
  });
}

export async function createWorkoutCompletedNotification(
  userId: string,
  workoutName: string
) {
  return createNotification({
    userId,
    title: "Entrenamiento completado",
    message: `¡Buen trabajo completando tu entrenamiento de ${workoutName}!`,
    type: "workout",
  });
}

export async function createWorkoutSessionStartedNotification(
  userId: string,
  workoutName: string,
  day: string
) {
  return createNotification({
    userId,
    title: "Entrenamiento iniciado",
    message: `Has iniciado una sesión de entrenamiento "${workoutName}" para el día ${day}.`,
    type: "workout",
  });
}

// Water intake notifications
export async function createWaterReminderNotification(userId: string) {
  return createNotification({
    userId,
    title: "Recordatorio de hidratación",
    message: "¡Recuerda beber agua y mantenerte hidratado!",
    type: "water",
  });
}

export async function createWaterGoalCompletedNotification(userId: string) {
  return createNotification({
    userId,
    title: "Meta de agua alcanzada",
    message: "¡Felicidades! Has alcanzado tu meta diaria de consumo de agua.",
    type: "water",
  });
}

// Meal notifications
export async function createMealReminderNotification(
  userId: string,
  mealType: string
) {
  return createNotification({
    userId,
    title: `Recordatorio de ${mealType}`,
    message: `¡Es hora de tu ${mealType.toLowerCase()}!`,
    type: "meal",
  });
}

export async function createMealLoggedNotification(userId: string) {
  return createNotification({
    userId,
    title: "Comida registrada",
    message: "Tu comida ha sido registrada exitosamente.",
    type: "meal",
  });
}

// Weight notifications
export async function createWeightLoggedNotification(userId: string) {
  return createNotification({
    userId,
    title: "Peso registrado",
    message: "Tu peso ha sido registrado exitosamente.",
    type: "weight",
  });
}

export async function createWeightGoalAchievedNotification(
  userId: string,
  goalWeight: number
) {
  return createNotification({
    userId,
    title: "Meta de peso alcanzada",
    message: `¡Felicidades! Has alcanzado tu meta de peso de ${goalWeight}kg.`,
    type: "weight",
  });
}

// Goal notifications
export async function createGoalCreatedNotification(
  userId: string,
  goalTitle: string
) {
  return createNotification({
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
) {
  return createNotification({
    userId,
    title: "Progreso actualizado",
    message: `Has actualizado tu progreso en el objetivo "${goalTitle}" a ${progress.toFixed(
      1
    )}%`,
    type: "goal",
  });
}

export async function createGoalReminderNotification(
  userId: string,
  goalTitle: string
) {
  return createNotification({
    userId,
    title: "Recordatorio de objetivo",
    message: `Sigue trabajando en tu objetivo: ${goalTitle}`,
    type: "goal",
  });
}

export async function createGoalAchievedNotification(
  userId: string,
  goalTitle: string
) {
  return createNotification({
    userId,
    title: "¡Objetivo alcanzado!",
    message: `¡Felicidades! Has alcanzado tu objetivo: ${goalTitle}`,
    type: "goal",
  });
}

export async function createGoalCompletedNotification(
  userId: string,
  goalTitle: string
) {
  return createNotification({
    userId,
    title: "Objetivo completado",
    message: `Has marcado como completado tu objetivo: ${goalTitle}`,
    type: "goal",
  });
}

// System notifications
export async function createSystemNotification(
  userId: string,
  title: string,
  message: string
) {
  return createNotification({
    userId,
    title,
    message,
    type: "system",
  });
}
