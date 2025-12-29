import { openDB, DBSchema, IDBPDatabase } from "idb";

interface GymRatDB extends DBSchema {
    exercises: {
        key: string;
        value: {
            id: string;
            name: string;
            muscleGroup: string;
            description: string;
            difficulty: string;
            equipment: string;
        };
    };
    foods: {
        key: string;
        value: {
            id: string;
            name: string;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
            category: string;
            serving: number;
        };
    };
    workouts: {
        key: string;
        value: any;
    };
    metadata: {
        key: string;
        value: {
            key: string;
            lastSync: number;
        };
    };
}

let db: IDBPDatabase<GymRatDB> | null = null;

export async function initDB() {
    if (db) return db;

    db = await openDB<GymRatDB>("gymratplus", 1, {
        upgrade(database) {
            // Create object stores
            if (!database.objectStoreNames.contains("exercises")) {
                database.createObjectStore("exercises", { keyPath: "id" });
            }
            if (!database.objectStoreNames.contains("foods")) {
                database.createObjectStore("foods", { keyPath: "id" });
            }
            if (!database.objectStoreNames.contains("workouts")) {
                database.createObjectStore("workouts", { keyPath: "id" });
            }
            if (!database.objectStoreNames.contains("metadata")) {
                database.createObjectStore("metadata", { keyPath: "key" });
            }
        },
    });

    return db;
}

// Cache exercises in IndexedDB
export async function cacheExercises(exercises: any[]) {
    const database = await initDB();
    const tx = database.transaction("exercises", "readwrite");

    await Promise.all(exercises.map((exercise) => tx.store.put(exercise)));

    await tx.done;

    // Update last sync time
    await setMetadata("exercises_last_sync", Date.now());
}

// Get exercises from IndexedDB
export async function getExercisesOffline() {
    const database = await initDB();
    return database.getAll("exercises");
}

// Cache foods in IndexedDB
export async function cacheFoods(foods: any[]) {
    const database = await initDB();
    const tx = database.transaction("foods", "readwrite");

    await Promise.all(foods.map((food) => tx.store.put(food)));

    await tx.done;

    // Update last sync time
    await setMetadata("foods_last_sync", Date.now());
}

// Get foods from IndexedDB
export async function getFoodsOffline() {
    const database = await initDB();
    return database.getAll("foods");
}

// Set metadata
async function setMetadata(key: string, lastSync: number) {
    const database = await initDB();
    await database.put("metadata", { key, lastSync });
}

// Get metadata
export async function getMetadata(key: string) {
    const database = await initDB();
    return database.get("metadata", key);
}

// Check if data needs sync (older than 1 hour)
export async function needsSync(key: string): Promise<boolean> {
    const metadata = await getMetadata(key);
    if (!metadata) return true;

    const oneHour = 60 * 60 * 1000;
    return Date.now() - metadata.lastSync > oneHour;
}
