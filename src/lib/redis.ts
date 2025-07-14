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
interface WaterIntakeEntry {
  date: string;  // YYYY-MM-DD format
  liters: number;
}

export async function getWaterIntakeHistory(
  userId: string,
): Promise<WaterIntakeEntry[]> {
  const historyKey = WATER_HISTORY_KEY(userId);
  
  try {
    // Get all entries from the sorted set
    const history = await redis.zrange(historyKey, 0, -1);

    if (!Array.isArray(history)) {
      return [];
    }

    const result: WaterIntakeEntry[] = [];
    const dateSet = new Set<string>(); // To track unique dates
    
    // Process each history entry
    for (const item of history) {
      try {
        const itemStr = String(item || '').trim();
        if (!itemStr) continue;
        
        // Expected format: "YYYY-MM-DD:liters"
        const separatorIndex = itemStr.lastIndexOf(':');
        if (separatorIndex === -1) continue;
        
        const date = itemStr.slice(0, separatorIndex).trim();
        const litersStr = itemStr.slice(separatorIndex + 1).trim();
        const liters = Number.parseFloat(litersStr);
        
        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
        
        // Validate liters is a positive number
        if (isNaN(liters) || liters < 0) continue;
        
        // Only keep the most recent entry for each date
        if (!dateSet.has(date)) {
          dateSet.add(date);
          result.push({ date, liters });
        }
      } catch (error) {
        console.error('Error processing history entry:', item, error);
        continue;
      }
    }
    
    // Sort by date in ascending order
    return result.sort((a, b) => a.date.localeCompare(b.date));
    
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
