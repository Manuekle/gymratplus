// Cache version - increment this to force cache updates
const CACHE_VERSION = "v1.0.0";

self.addEventListener("push", function (event) {
  console.log("[SW] Push event received", event);

  if (event.data) {
    try {
      // Try to parse as JSON first
      const data = event.data.json();
      console.log("[SW] Push notification data:", data);

      const options = {
        body: data.body,
        icon: "/icons/favicon-192x192.png",
        badge: "/icons/favicon-72x72.png",
        vibrate: [100, 50, 100],
        tag: data.tag,
        requireInteraction: false,
        data: {
          dateOfArrival: Date.now(),
          primaryKey: "2",
          url: data.url || "/dashboard/notifications",
        },
      };

      event.waitUntil(
        self.registration
          .showNotification(data.title, options)
          .then(() => {
            console.log("[SW] Notification shown successfully");
          })
          .catch((error) => {
            console.error("[SW] Error showing notification:", error);
          }),
      );
    } catch (e) {
      console.error("[SW] Error parsing push data:", e);
      // If JSON parsing fails, treat as plain text
      const text = event.data.text();
      const options = {
        body: text,
        icon: "/icons/favicon-192x192.png",
        badge: "/icons/favicon-72x72.png",
        vibrate: [100, 50, 100],
        requireInteraction: false,
        data: {
          dateOfArrival: Date.now(),
          primaryKey: "1",
          url: "/dashboard/notifications",
        },
      };

      event.waitUntil(
        self.registration
          .showNotification("GymRat+", options)
          .catch((error) => {
            console.error("[SW] Error showing fallback notification:", error);
          }),
      );
    }
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("[SW] Notification click received:", event.notification);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/dashboard/notifications";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error("[SW] Error handling notification click:", error);
      }),
  );
});

// Install event - cache version management
self.addEventListener("install", function (event) {
  console.log("[SW] Installing service worker version:", CACHE_VERSION);
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener("activate", function (event) {
  console.log("[SW] Activating service worker version:", CACHE_VERSION);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches that don't match current version
            if (
              cacheName.includes("gymrat") &&
              !cacheName.includes(CACHE_VERSION)
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("[SW] Service worker activated, claiming clients");
        return self.clients.claim();
      }),
  );
});
