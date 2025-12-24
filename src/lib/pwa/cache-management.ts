/**
 * PWA Cache Management Utility
 * Provides functions to clear service worker cache and force updates
 */

export interface CacheClearResult {
  success: boolean;
  message: string;
  clearedCaches?: string[];
  error?: string;
}

/**
 * Clears all caches and unregisters service workers
 */
export async function clearAllCaches(): Promise<CacheClearResult> {
  try {
    if (typeof window === "undefined" || !("caches" in window)) {
      return {
        success: false,
        message: "Cache API not supported",
      };
    }

    console.log("[Cache] Starting cache clear...");

    // Get all cache names
    const cacheNames = await caches.keys();
    console.log("[Cache] Found caches:", cacheNames);

    // Delete all caches
    const deletePromises = cacheNames.map((cacheName) => {
      console.log("[Cache] Deleting cache:", cacheName);
      return caches.delete(cacheName);
    });

    await Promise.all(deletePromises);

    console.log("[Cache] All caches cleared successfully");

    return {
      success: true,
      message: `${cacheNames.length} caches cleared`,
      clearedCaches: cacheNames,
    };
  } catch (error) {
    console.error("[Cache] Error clearing caches:", error);
    return {
      success: false,
      message: "Error clearing caches",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Unregisters all service workers
 */
export async function unregisterServiceWorkers(): Promise<CacheClearResult> {
  try {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return {
        success: false,
        message: "Service Worker not supported",
      };
    }

    console.log("[SW] Getting all service worker registrations...");

    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log("[SW] Found registrations:", registrations.length);

    const unregisterPromises = registrations.map((registration) => {
      console.log("[SW] Unregistering:", registration.scope);
      return registration.unregister();
    });

    await Promise.all(unregisterPromises);

    console.log("[SW] All service workers unregistered");

    return {
      success: true,
      message: `${registrations.length} service workers unregistered`,
    };
  } catch (error) {
    console.error("[SW] Error unregistering service workers:", error);
    return {
      success: false,
      message: "Error unregistering service workers",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Clears all caches, unregisters service workers, and reloads the page
 */
export async function fullCacheClear(): Promise<void> {
  console.log("[Cache] Starting full cache clear...");

  // Clear caches
  const cacheResult = await clearAllCaches();
  console.log("[Cache] Cache clear result:", cacheResult);

  // Unregister service workers
  const swResult = await unregisterServiceWorkers();
  console.log("[SW] Unregister result:", swResult);

  // Wait a bit for cleanup to complete
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Reload the page
  console.log("[Cache] Reloading page...");
  window.location.reload();
}

/**
 * Forces service worker update without clearing cache
 */
export async function forceServiceWorkerUpdate(): Promise<CacheClearResult> {
  try {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return {
        success: false,
        message: "Service Worker not supported",
      };
    }

    console.log("[SW] Forcing service worker update...");

    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      return {
        success: false,
        message: "No service worker registered",
      };
    }

    await registration.update();

    console.log("[SW] Service worker update triggered");

    return {
      success: true,
      message: "Service worker update triggered",
    };
  } catch (error) {
    console.error("[SW] Error forcing update:", error);
    return {
      success: false,
      message: "Error forcing service worker update",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Gets information about current caches and service workers
 */
export async function getCacheInfo(): Promise<{
  caches: string[];
  serviceWorkers: number;
  hasController: boolean;
}> {
  const info = {
    caches: [] as string[],
    serviceWorkers: 0,
    hasController: false,
  };

  try {
    if (typeof window !== "undefined") {
      if ("caches" in window) {
        info.caches = await caches.keys();
      }

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        info.serviceWorkers = registrations.length;
        info.hasController = !!navigator.serviceWorker.controller;
      }
    }
  } catch (error) {
    console.error("[Cache] Error getting cache info:", error);
  }

  return info;
}
