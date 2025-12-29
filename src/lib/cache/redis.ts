import { Redis } from "@upstash/redis";

// Initialize Redis client
export const redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
        : null;

// Cache wrapper with TTL
export async function getCached<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600, // 1 hour default
): Promise<T> {
    // If Redis is not configured, just fetch
    if (!redis) {
        console.warn("⚠️  Redis not configured, skipping cache");
        return fetcher();
    }

    try {
        // Try to get from cache
        const cached = await redis.get<T>(key);

        if (cached) {
            console.log(`✅ Cache HIT: ${key}`);
            return cached;
        }

        console.log(`❌ Cache MISS: ${key}`);

        // Fetch fresh data
        const fresh = await fetcher();

        // Store in cache
        await redis.setex(key, ttl, JSON.stringify(fresh));

        return fresh;
    } catch (error) {
        console.error(`Cache error for ${key}:`, error);
        // Fallback to fetcher if cache fails
        return fetcher();
    }
}

// Invalidate cache by pattern
export async function invalidateCache(pattern: string) {
    if (!redis) return;

    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(
                `🗑️  Invalidated ${keys.length} cache keys matching: ${pattern}`,
            );
        }
    } catch (error) {
        console.error(`Error invalidating cache for ${pattern}:`, error);
    }
}

// Invalidate specific key
export async function invalidateCacheKey(key: string) {
    if (!redis) return;

    try {
        await redis.del(key);
        console.log(`🗑️  Invalidated cache key: ${key}`);
    } catch (error) {
        console.error(`Error invalidating cache key ${key}:`, error);
    }
}

// Specific cache keys
export const CacheKeys = {
    EXERCISES_ALL: "exercises:all",
    EXERCISES_BY_MUSCLE: (muscle: string) => `exercises:muscle:${muscle}`,
    EXERCISES_BY_DIFFICULTY: (difficulty: string) =>
        `exercises:difficulty:${difficulty}`,
    EXERCISES_FILTERED: (muscle: string, difficulty: string, search: string) =>
        `exercises:${muscle || "all"}:${difficulty || "all"}:${search || "none"}`,
    FOODS_ALL: "foods:all",
    FOODS_BY_CATEGORY: (category: string) => `foods:category:${category}`,
    USER_PROFILE: (userId: string) => `user:profile:${userId}`,
};
