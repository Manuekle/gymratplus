"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Notification01Icon,
  NotificationOff01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager({ className }: { className?: string }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      console.log("PushManager: Service Worker supported");

      // Check if controller is active
      if (navigator.serviceWorker.controller) {
        console.log("PushManager: Active service worker controller found");
      } else {
        console.log("PushManager: No active service worker controller");
      }

      navigator.serviceWorker.ready
        .then((reg) => {
          console.log("PushManager: Service Worker ready", reg);
          setRegistration(reg);
          reg.pushManager.getSubscription().then((sub) => {
            console.log("PushManager: Existing subscription", sub);
            if (
              sub &&
              !(sub.expirationTime && Date.now() > sub.expirationTime)
            ) {
              setSubscription(sub);
              setIsSubscribed(true);
            }
          });
        })
        .catch((err) => {
          console.error(
            "PushManager: Error waiting for Service Worker ready",
            err,
          );
        });

      // List all registrations
      navigator.serviceWorker.getRegistrations().then((regs) => {
        console.log("PushManager: All registrations", regs);
      });
    } else {
      console.log("PushManager: Service Worker NOT supported or not in window");
    }
  }, []);

  const subscribeToPush = async () => {
    if (!registration) {
      toast.error("Service Worker no registrado");
      return;
    }

    try {
      const response = await fetch("/api/push/vapid");
      const { publicKey } = await response.json();

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      setSubscription(sub);
      setIsSubscribed(true);

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sub),
      });

      toast.success("Notificaciones activadas");
    } catch (error) {
      console.error("Error subscribing to push", error);
      toast.error("Error al activar notificaciones");
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    await subscription.unsubscribe();
    setSubscription(null);
    setIsSubscribed(false);
    toast.success("Notificaciones desactivadas");
  };

  if (!isSubscribed) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={subscribeToPush}
        className={className}
      >
        <HugeiconsIcon icon={Notification01Icon} className="mr-2 h-4 w-4" />
        Activar Notificaciones
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={unsubscribeFromPush}
      className={className}
    >
      <HugeiconsIcon icon={NotificationOff01Icon} className="mr-2 h-4 w-4" />
      Desactivar Notificaciones
    </Button>
  );
}
