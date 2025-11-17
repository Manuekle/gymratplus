import { Redis } from "@upstash/redis";
import { createNotification } from "@/lib/notifications/notification-service";
import { prisma } from "@/lib/database/prisma";

export const subscriberClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export const NOTIFICATION_CHANNEL = "notifications";
export const WATER_INTAKE_CHANNEL = "water-intake";
export const WORKOUT_CHANNEL = "workout"; // Add workout channel

// For Upstash Redis, we need to use the HTTP-based approach
export async function initNotificationSubscriber() {
  try {
    // Set up a polling mechanism to check for new messages
    const checkForNotifications = async () => {
      try {
        // Get notifications from the channel
        const notifications = await subscriberClient.lrange(
          NOTIFICATION_CHANNEL,
          0,
          -1,
        );

        // Process each notification and track successfully processed ones
        for (let i = 0; i < notifications.length; i++) {
          try {
            // Verificar si el mensaje ya es un objeto
            const message = notifications[i];
            const data =
              typeof message === "string" ? JSON.parse(message) : message;
            const { userId, notification } = data;

            if (userId && notification) {
              // Verificar si ya existe una notificación similar hoy para evitar duplicados
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const existing = await prisma.notification.findFirst({
                where: {
                  userId,
                  type: notification.type,
                  title: notification.title,
                  message: notification.message,
                  createdAt: {
                    gte: today,
                  },
                },
              });

              // Solo crear si no existe ya
              if (!existing) {
                await createNotification({
                  userId,
                  title: notification.title,
                  message: notification.message,
                  type: notification.type,
                });

                console.log(
                  `Notification created for user ${userId}: ${notification.title}`,
                );
              } else {
                console.log(
                  `Notification already exists for user ${userId}: ${notification.title}, skipping duplicate`,
                );
              }
            }
          } catch (error) {
            console.error("Error processing notification:", error);
          }
        }

        // Clear ALL processed notifications from the list
        if (notifications.length > 0) {
          try {
            // Eliminar todos los elementos procesados usando ltrim
            // ltrim mantiene solo los elementos desde start hasta end (inclusive)
            // Para eliminar los primeros N elementos, mantenemos desde el índice N hasta el final
            // Si N >= longitud de la lista, la lista queda vacía
            // Nota: índices empiezan en 0, así que si hay 5 elementos (0-4) y queremos eliminar todos,
            // usamos ltrim LIST 5 -1, que mantiene desde el índice 5 (no existe) hasta el final = lista vacía
            await subscriberClient.ltrim(
              NOTIFICATION_CHANNEL,
              notifications.length,
              -1,
            );
          } catch (error) {
            console.error("Error clearing notification channel:", error);
          }
        }
      } catch {}
    };

    // Check water intake (only update UI, notifications are handled in the water-intake route)
    const checkWaterIntake = async () => {
      try {
        const intakeUpdates = await subscriberClient.lrange(
          WATER_INTAKE_CHANNEL,
          0,
          -1,
        );

        // Just clear the updates without processing notifications
        if (intakeUpdates.length > 0) {
          await subscriberClient.ltrim(
            WATER_INTAKE_CHANNEL,
            intakeUpdates.length,
            -1,
          );
        }
      } catch {}
    };

    // Check workout notifications
    const checkWorkoutNotifications = async () => {
      try {
        const workoutUpdates = await subscriberClient.lrange(
          WORKOUT_CHANNEL,
          0,
          -1,
        );

        for (let i = 0; i < workoutUpdates.length; i++) {
          try {
            // Verificar si el mensaje ya es un objeto
            const data =
              typeof workoutUpdates[i] === "string"
                ? JSON.parse(workoutUpdates[i])
                : workoutUpdates[i];
            // Remove workoutSessionId from destructuring since it's not used
            const { userId, action, workoutName, day } = data;

            if (userId && action) {
              let title = "";
              let messageText = "";

              switch (action) {
                case "started":
                  title = "Entrenamiento iniciado";
                  messageText = `Has iniciado una sesión de entrenamiento "${workoutName}" para el día ${
                    day || "de hoy"
                  }.`;
                  break;
                case "completed":
                  title = "Entrenamiento completado";
                  messageText = `¡Felicidades! Has completado tu sesión de entrenamiento "${workoutName}".`;
                  break;
                case "cancelled":
                  title = "Entrenamiento cancelado";
                  messageText = `Has cancelado la sesión de entrenamiento "${workoutName}".`;
                  break;
                case "progress":
                  title = "Progreso de entrenamiento";
                  messageText = `Has completado el 50% de tu sesión de entrenamiento "${workoutName}".`;
                  break;
                default:
                  continue; // Skip unknown actions
              }

              // Verificar si ya existe una notificación similar hoy para evitar duplicados
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const existing = await prisma.notification.findFirst({
                where: {
                  userId,
                  type: "workout",
                  title,
                  message: messageText,
                  createdAt: {
                    gte: today,
                  },
                },
              });

              // Solo crear si no existe ya
              if (!existing) {
                await createNotification({
                  userId,
                  title,
                  message: messageText,
                  type: "workout",
                });

                console.log(
                  `Workout notification created for user ${userId}: ${title}`,
                );
              } else {
                console.log(
                  `Workout notification already exists for user ${userId}: ${title}, skipping duplicate`,
                );
              }
            }
          } catch (error) {
            console.error(
              "Error processing workout notification message:",
              error,
            );
          }
        }

        if (workoutUpdates.length > 0) {
          await subscriberClient.ltrim(
            WORKOUT_CHANNEL,
            workoutUpdates.length,
            -1,
          );
        }
      } catch {}
    };

    // Set up interval for polling
    const POLLING_INTERVAL = 15000; // 15 segundos
    const notificationInterval = setInterval(
      checkForNotifications,
      POLLING_INTERVAL,
    );
    const waterIntakeInterval = setInterval(checkWaterIntake, POLLING_INTERVAL);
    const workoutInterval = setInterval(
      checkWorkoutNotifications,
      POLLING_INTERVAL,
    );

    // Return a function to clean up intervals if needed
    return () => {
      clearInterval(notificationInterval);
      clearInterval(waterIntakeInterval);
      clearInterval(workoutInterval);
    };
  } catch {
    // Devolvemos una función vacía en caso de error para mantener consistencia en el tipo de retorno
    return () => {};
  }
}
