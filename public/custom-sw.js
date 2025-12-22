self.addEventListener("push", function (event) {
  if (event.data) {
    try {
      // Try to parse as JSON first
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        vibrate: [100, 50, 100],
        tag: data.tag,
        data: {
          dateOfArrival: Date.now(),
          primaryKey: "2",
          url: data.url,
        },
      };
      event.waitUntil(self.registration.showNotification(data.title, options));
    } catch (e) {
      // If JSON parsing fails, treat as plain text
      const text = event.data.text();
      const options = {
        body: text,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: "1",
        },
      };
      event.waitUntil(self.registration.showNotification("GymRat+", options));
    }
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
});
