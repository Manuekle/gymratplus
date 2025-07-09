import { Redis } from "@upstash/redis";
import { createNotification } from "@/lib/notification-service";

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
            const data = JSON.parse(message);
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
          } catch (error) {
            console.error("Error processing notification message:", error);
          }
        }

        // Clear processed notifications
        if (notifications.length > 0) {
          await subscriberClient.ltrim(
            NOTIFICATION_CHANNEL,
            notifications.length,
            -1,
          );
        }
      } catch (error) {
        console.error("Error checking notifications:", error);
      }
    };

    // Check water intake
    const checkWaterIntake = async () => {
      try {
        const intakeUpdates = await subscriberClient.lrange(
          WATER_INTAKE_CHANNEL,
          0,
          -1,
        );

        for (const message of intakeUpdates) {
          try {
            const data = JSON.parse(message);
            const { userId, intake, targetIntake } = data;

            if (userId && intake && targetIntake) {
              if (intake >= targetIntake) {
                await createNotification({
                  userId,
                  title: "Meta de agua alcanzada",
                  message:
                    "¡Felicidades! Has alcanzado tu meta diaria de consumo de agua.",
                  type: "water",
                });

                console.log(
                  `Water goal notification created for user ${userId}`,
                );
              }
            }
          } catch (error) {
            console.error("Error processing water intake message:", error);
          }
        }

        if (intakeUpdates.length > 0) {
          await subscriberClient.ltrim(
            WATER_INTAKE_CHANNEL,
            intakeUpdates.length,
            -1,
          );
        }
      } catch (error) {
        console.error("Error checking water intake:", error);
      }
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
            const data = JSON.parse(message);
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
      } catch (error) {
        console.error("Error checking workout notifications:", error);
      }
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

    console.log("Redis polling initialized with 15-second intervals");

    // Return a function to clean up intervals if needed
    return () => {
      clearInterval(notificationInterval);
      clearInterval(waterIntakeInterval);
      clearInterval(workoutInterval);
    };
  } catch (error) {
    console.error("Failed to initialize Redis polling:", error);
  }
}
