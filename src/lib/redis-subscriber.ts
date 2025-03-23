import { Redis } from "@upstash/redis";
import { createNotification } from "@/lib/notification-service";

// Create a separate Redis client for subscriptions
export const subscriberClient = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

export const NOTIFICATION_CHANNEL = "notifications";
export const WATER_INTAKE_CHANNEL = "water-intake"; // Make sure this is exported

// Initialize the subscriber
export async function initNotificationSubscriber() {
  try {
    // Subscribe to general notifications
    await subscriberClient.subscribe(
      NOTIFICATION_CHANNEL,
      async (message: string) => {
        try {
          const data = JSON.parse(message);
          const { userId, notification } = data;

          if (userId && notification) {
            // Create a notification in the database
            await createNotification({
              userId,
              title: notification.title,
              message: notification.message,
              type: notification.type,
            });

            console.log(
              `Notification created for user ${userId}: ${notification.title}`
            );
          }
        } catch (error) {
          console.error("Error processing notification message:", error);
        }
      }
    );

    // Subscribe to water intake updates
    await subscriberClient.subscribe(WATER_INTAKE_CHANNEL, async (message) => {
      try {
        const data = JSON.parse(message);
        const { userId, intake, targetIntake } = data;

        if (userId && intake && targetIntake) {
          // Check if user reached their water goal
          if (intake >= targetIntake) {
            await createNotification({
              userId,
              title: "Meta de agua alcanzada",
              message:
                "¡Felicidades! Has alcanzado tu meta diaria de consumo de agua.",
              type: "water",
            });

            console.log(`Water goal notification created for user ${userId}`);
          }
        }
      } catch (error) {
        console.error("Error processing water intake message:", error);
      }
    });

    console.log("Redis subscribers initialized");
  } catch (error) {
    console.error("Failed to initialize Redis subscribers:", error);
  }
}
