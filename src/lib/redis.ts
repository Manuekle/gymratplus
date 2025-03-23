/* eslint-disable @typescript-eslint/no-explicit-any */

import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

// Helper functions for water intake tracking
export const WATER_INTAKE_KEY = (userId: string, date: string) =>
  `water:intake:${userId}:${date}`;
export const WATER_HISTORY_KEY = (userId: string) => `water:history:${userId}`;
export const NOTIFICATION_CHANNEL = "notifications";
export const WATER_INTAKE_CHANNEL = "water-intake";

// Store water intake for a specific day
export async function storeWaterIntake(
  userId: string,
  date: string,
  liters: number
): Promise<void> {
  const key = WATER_INTAKE_KEY(userId, date);
  await redis.set(key, liters.toString());

  // Store in history (last 30 days)
  const historyKey = WATER_HISTORY_KEY(userId);
  await redis.zadd(historyKey, {
    score: new Date(date).getTime(),
    member: `${date}:${liters}`,
  });

  // Keep only last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  await redis.zremrangebyscore(historyKey, 0, thirtyDaysAgo.getTime());
}

// Get water intake for a specific day
export async function getWaterIntake(
  userId: string,
  date: string
): Promise<number> {
  const key = WATER_INTAKE_KEY(userId, date);
  const intake = await redis.get<string>(key);
  return intake ? Number.parseFloat(intake) : 0;
}

// Get water intake history for the last 30 days
export async function getWaterIntakeHistory(
  userId: string
): Promise<{ date: string; liters: number }[]> {
  try {
    const historyKey = WATER_HISTORY_KEY(userId);
    const history = await redis.zrange<string[]>(historyKey, 0, -1);

    if (!history || !Array.isArray(history)) {
      return [];
    }

    return history
      .map((item) => {
        try {
          const [date, litersStr] = item.split(":");
          return {
            date,
            liters: Number.parseFloat(litersStr),
          };
        } catch (e) {
          console.error("Error parsing history item:", item, e);
          return null;
        }
      })
      .filter((item) => item !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error("Error in getWaterIntakeHistory:", error);
    return [];
  }
}

// Publish a notification
export async function publishNotification(
  userId: string,
  notification: any
): Promise<void> {
  await redis.publish(
    NOTIFICATION_CHANNEL,
    JSON.stringify({
      userId,
      notification,
    })
  );
}
