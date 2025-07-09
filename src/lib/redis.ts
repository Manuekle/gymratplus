/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Helper functions for water intake tracking
export const WATER_INTAKE_KEY = (userId: string, date: string) =>
  `water:intake:${userId}:${date}`;
export const WATER_HISTORY_KEY = (userId: string) => `water:history:${userId}`;
export const NOTIFICATION_CHANNEL = "notifications";
export const WATER_INTAKE_CHANNEL = "water-intake";
export const WORKOUT_CHANNEL = "workout";

// Store water intake for a specific day
export async function storeWaterIntake(
  userId: string,
  date: string,
  liters: number,
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
  date: string,
): Promise<number> {
  const key = WATER_INTAKE_KEY(userId, date);
  const intake = await redis.get<string>(key);
  return intake ? Number.parseFloat(intake) : 0;
}

// Get water intake history for the last 30 days
export async function getWaterIntakeHistory(
  userId: string,
): Promise<{ date: string; liters: number }[]> {
  try {
    const historyKey = WATER_HISTORY_KEY(userId);
    const history = await redis.zrange(historyKey, 0, -1);

    if (!Array.isArray(history)) {
      return [];
    }

    // Filtrar y procesar elementos
    const result: Array<{ date: string; liters: number }> = [];
    
    for (const item of history) {
      const itemStr = String(item || '');
      if (!itemStr.includes(':')) continue;
      
      const parts = itemStr.split(':');
      if (parts.length < 2) continue;
      
      const date = (parts[0] || '').trim();
      const liters = Number.parseFloat(parts[1] || '');
      
      if (!date || isNaN(liters)) continue;
      
      result.push({ date, liters });
    }
    
    // Ordenar por fecha
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error("Error in getWaterIntakeHistory:", error);
    return [];
  }
}

// Add to notification list instead of publishing
export async function publishNotification(
  userId: string,
  notification: any,
): Promise<void> {
  await redis.lpush(
    NOTIFICATION_CHANNEL,
    JSON.stringify({
      userId,
      notification,
    }),
  );
}

// Add to water intake list
export async function publishWaterIntake(
  userId: string,
  intake: number,
  targetIntake: number,
): Promise<void> {
  await redis.lpush(
    WATER_INTAKE_CHANNEL,
    JSON.stringify({
      userId,
      intake,
      targetIntake,
    }),
  );
}

// Add to workout list
export async function publishWorkout(
  userId: string,
  workoutSessionId: string,
  action: string,
  workoutName: string,
  day?: string,
): Promise<void> {
  await redis.lpush(
    WORKOUT_CHANNEL,
    JSON.stringify({
      userId,
      workoutSessionId,
      action,
      workoutName,
      day,
    }),
  );
}
