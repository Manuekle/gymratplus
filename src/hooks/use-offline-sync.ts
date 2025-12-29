"use client";

import { useEffect, useState } from "react";
import {
    cacheExercises,
    cacheFoods,
    needsSync,
} from "@/lib/offline/indexeddb";

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    useEffect(() => {
        // Check online status
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            // Auto-sync when coming back online
            syncData();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Initial sync on mount if needed
        checkAndSync();

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const checkAndSync = async () => {
        const exercisesNeedSync = await needsSync("exercises_last_sync");
        const foodsNeedSync = await needsSync("foods_last_sync");

        if (exercisesNeedSync || foodsNeedSync) {
            await syncData();
        }
    };

    const syncData = async () => {
        if (!isOnline) {
            console.log("⚠️  Offline - skipping sync");
            return;
        }

        setIsSyncing(true);
        try {
            // Fetch and cache exercises
            const exercisesRes = await fetch("/api/exercises");
            if (exercisesRes.ok) {
                const exercises = await exercisesRes.json();
                await cacheExercises(exercises);
                console.log(`✅ Cached ${exercises.length} exercises`);
            }

            // Fetch and cache foods
            const foodsRes = await fetch("/api/foods/all");
            if (foodsRes.ok) {
                const foods = await foodsRes.json();
                await cacheFoods(foods);
                console.log(`✅ Cached ${foods.length} foods`);
            }

            setLastSyncTime(new Date());
            console.log("✅ Data synced to IndexedDB");
        } catch (error) {
            console.error("❌ Sync failed:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    return { isOnline, isSyncing, syncData, lastSyncTime };
}
