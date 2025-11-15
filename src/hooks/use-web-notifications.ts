"use client";

import { useEffect, useState, useCallback } from "react";

interface UseWebNotificationsOptions {
  onNotificationClick?: (notification: globalThis.Notification) => void;
}

export function useWebNotifications(options?: UseWebNotificationsOptions) {
  const { onNotificationClick } = options || {};
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar si el navegador soporta notificaciones
    if ("Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn("Este navegador no soporta notificaciones");
      return false;
    }

    if (Notification.permission === "granted") {
      setPermission("granted");
      return true;
    }

    if (Notification.permission === "denied") {
      setPermission("denied");
      return false;
    }

    // Solicitar permiso
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, [isSupported]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions): Notification | null => {
      if (!isSupported || permission !== "granted") {
        return null;
      }

      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "gymrat-notification",
        requireInteraction: false,
        ...options,
      });

      // Manejar click en la notificación
      notification.onclick = () => {
        window.focus();
        if (onNotificationClick) {
          onNotificationClick(notification);
        }
        if (options?.data?.url) {
          window.location.href = options.data.url;
        }
        notification.close();
      };

      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    },
    [isSupported, permission, onNotificationClick],
  );

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    canShow: isSupported && permission === "granted",
  };
}
