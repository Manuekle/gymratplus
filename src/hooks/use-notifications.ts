"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Notification } from "@prisma/client";

interface UseNotificationsOptions {
  /** Intervalo de polling en milisegundos (default: 30000 = 30s) */
  pollingInterval?: number;
  /** Si debe hacer polling automático (default: true) */
  enablePolling?: boolean;
  /** Callback cuando se detectan nuevas notificaciones */
  onNewNotifications?: (newNotifications: Notification[]) => void;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    pollingInterval = 120000, // 2 minutos (reducido de 30s para evitar demasiadas queries)
    enablePolling = true,
    onNewNotifications,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousNotificationIdsRef = useRef<Set<string>>(new Set());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setIsLoading(true);
        }

        // Usar cache con revalidación para reducir queries innecesarias
        const response = await fetch("/api/notifications", {
          next: { revalidate: 60 }, // Cache por 60 segundos
          headers: {
            "Cache-Control": "max-age=60",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        const newNotificationIds = new Set<string>(
          data.map((n: Notification) => n.id),
        );
        const previousIds = previousNotificationIdsRef.current;

        // Detectar nuevas notificaciones solo si hay cambios reales
        if (previousIds.size > 0 && onNewNotifications) {
          const newNotifications = data.filter(
            (n: Notification) => !previousIds.has(n.id),
          );
          if (newNotifications.length > 0) {
            onNewNotifications(newNotifications);
          }
        }

        // Solo actualizar estado si hay cambios
        const currentIds = Array.from(newNotificationIds).sort().join(",");
        const previousIdsStr = Array.from(previousIds).sort().join(",");

        if (currentIds !== previousIdsStr) {
          previousNotificationIdsRef.current = newNotificationIds;
          setNotifications(data);
          setUnreadCount(
            data.filter((notification: Notification) => !notification.read)
              .length,
          );
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [onNewNotifications],
  );

  // Alias for fetchNotifications to match the expected interface
  const refetch = useCallback(
    () => fetchNotifications(false),
    [fetchNotifications],
  );

  const markAsRead = useCallback(
    async (id: string | "all") => {
      // Optimistic update
      if (id === "all") {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true })),
        );
        setUnreadCount(0);
      } else {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        if (id === "all") {
          const response = await fetch("/api/notifications", {
            method: "PATCH",
          });

          if (!response.ok) {
            throw new Error("Failed to mark all notifications as read");
          }
        } else {
          const response = await fetch(`/api/notifications/${id}`, {
            method: "PATCH",
          });

          if (!response.ok) {
            throw new Error("Failed to mark notification as read");
          }
        }
        return true;
      } catch (err) {
        // Revertir en caso de error
        await fetchNotifications(true);
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      }
    },
    [fetchNotifications],
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      // Guardar la notificación para poder revertir si falla
      const notificationToDelete = notifications.find((n) => n.id === id);
      const wasUnread = notificationToDelete && !notificationToDelete.read;

      // Optimistic update
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id),
      );
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        const response = await fetch(`/api/notifications/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete notification");
        }

        return true;
      } catch (err) {
        // Revertir en caso de error
        if (notificationToDelete) {
          setNotifications((prev) =>
            [...prev, notificationToDelete].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
          );
          if (wasUnread) {
            setUnreadCount((prev) => prev + 1);
          }
        }
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      }
    },
    [notifications],
  );

  const deleteAllNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete all notifications");
      }

      setNotifications([]);
      setUnreadCount(0);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return false;
    }
  }, []);

  // Polling automático
  useEffect(() => {
    // Cargar inicialmente
    fetchNotifications();

    if (!enablePolling) return;

    // Configurar polling solo cuando la página está visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Limpiar intervalo cuando la página no está visible
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else {
        // Recargar inmediatamente cuando la página vuelve a estar visible
        fetchNotifications(true);
        // Reiniciar polling
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(
            () => fetchNotifications(true),
            pollingInterval,
          );
        }
      }
    };

    // Configurar listener de visibilidad
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Iniciar polling solo si la página está visible
    if (!document.hidden) {
      pollingIntervalRef.current = setInterval(
        () => fetchNotifications(true),
        pollingInterval,
      );
    }

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchNotifications, enablePolling, pollingInterval]);

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetch,
  };
}
