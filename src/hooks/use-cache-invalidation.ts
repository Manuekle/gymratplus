"use client";

import { invalidateCacheKey, CacheKeys } from "@/lib/cache/redis";

// Hook to invalidate cache when data changes
export function useCacheInvalidation() {
    const invalidateExercises = async () => {
        await invalidateCacheKey(CacheKeys.EXERCISES_ALL);
        console.log("🗑️  Invalidated exercises cache");
    };

    const invalidateFoods = async () => {
        await invalidateCacheKey(CacheKeys.FOODS_ALL);
        console.log("🗑️  Invalidated foods cache");
    };

    const invalidateUserProfile = async (userId: string) => {
        await invalidateCacheKey(CacheKeys.USER_PROFILE(userId));
        console.log(`🗑️  Invalidated profile cache for user ${userId}`);
    };

    return {
        invalidateExercises,
        invalidateFoods,
        invalidateUserProfile,
    };
}
