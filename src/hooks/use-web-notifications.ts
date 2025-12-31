"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useWebNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const subscribeToPush = useCallback(async () => {
        try {
            if (!("serviceWorker" in navigator)) return;

            const registration = await navigator.serviceWorker.ready;

            // Get VAPID public key
            const response = await fetch("/api/push/vapid");
            const { publicKey } = await response.json();

            if (!publicKey) {
                console.error("No VAPID public key found");
                return;
            }

            // Convert VAPID key for subscription
            const convertedVapidKey = urlBase64ToUint8Array(publicKey);

            // Subscribe (or get existing subscription)
            let sub = await registration.pushManager.getSubscription();

            if (!sub) {
                sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey,
                });
            }

            setSubscription(sub);

            // Send subscription to backend
            await fetch("/api/push/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sub),
            });

            toast.success("Notificaciones activadas correctamente");
        } catch (error) {
            console.error("Failed to subscribe to push notifications:", error);
            toast.error("Error al activar notificaciones push");
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!("Notification" in window)) {
            toast.error("Tu navegador no soporta notificaciones");
            return;
        }

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === "granted") {
            await subscribeToPush();
        }
    }, [subscribeToPush]);

    return {
        permission,
        requestPermission,
        canShow: permission === "default",
        subscription,
    };
}

// Utility to convert VAPID key
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
