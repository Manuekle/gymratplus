"use client";

import { useEffect } from "react";

export function PWAInit() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "[PWA] Service Worker registration successful with scope:",
              registration.scope,
            );

            // Check for updates every hour
            setInterval(
              () => {
                registration.update().catch((err) => {
                  console.error("[PWA] Error checking for SW updates:", err);
                });
              },
              60 * 60 * 1000,
            );

            // Listen for updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              console.log("[PWA] New service worker found, installing...");

              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    console.log(
                      "[PWA] New service worker installed, will activate on next page load",
                    );
                    // Optionally, you can show a toast to the user here
                    // toast.info("Nueva versión disponible. Recarga la página para actualizar.");
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.error("[PWA] Service Worker registration failed:", err);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }

      // Handle service worker messages
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("[PWA] Message from service worker:", event.data);
      });

      // Log current service worker status
      if (navigator.serviceWorker.controller) {
        console.log("[PWA] Active service worker controller found");
      } else {
        console.log("[PWA] No active service worker controller");
      }
    } else {
      console.log("[PWA] Service Worker not supported in this browser");
    }
  }, []);

  return null;
}
