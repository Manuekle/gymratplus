import { Redis } from "@upstash/redis";
import { createNotification } from "@/lib/notifications/notification-service";

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

        // Process each notification
        for (const message of notifications) {
          try {
            // Verificar si el mensaje ya es un objeto
            const data =
              typeof message === "string" ? JSON.parse(message) : message;
            const { userId, notification } = data;

            if (userId && notification) {
              await createNotification({
                userId,
                title: notification.title,
                message: notification.message,
                type: notification.type,
              });

              console.log(
                `Notification created for user ${userId}: ${notification.title}`,
              );
            }
          } catch {}
        }

        // Clear processed notifications
        if (notifications.length > 0) {
          await subscriberClient.ltrim(
            NOTIFICATION_CHANNEL,
            notifications.length,
            -1,
          );
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

        for (const message of workoutUpdates) {
          try {
            // Verificar si el mensaje ya es un objeto
            const data =
              typeof message === "string" ? JSON.parse(message) : message;
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

              await createNotification({
                userId,
                title,
                message: messageText,
                type: "workout",
              });

              console.log(
                `Workout notification created for user ${userId}: ${title}`,
              );
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
