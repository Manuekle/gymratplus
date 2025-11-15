"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import type { Notification } from "@prisma/client";

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string | "all") => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  deleteAllNotifications: () => Promise<boolean>;
  refetch: () => void;
  onNewNotifications?: (newNotifications: Notification[]) => void;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

// Singleton para el polling - solo una instancia activa
let globalPollingInterval: NodeJS.Timeout | null = null;
const globalSubscribers = new Set<(notifications: Notification[]) => void>();
let cachedNotifications: Notification[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 10000; // 10 segundos de cache para tiempo real
const POLLING_INTERVAL = 15000; // 15 segundos - polling en tiempo real

async function fetchNotificationsFromAPI(
  forceRefresh = false,
): Promise<Notification[]> {
  const now = Date.now();

  // Solo usar cache si no se fuerza refresh y está disponible y es reciente
  if (
    !forceRefresh &&
    cachedNotifications.length > 0 &&
    now - lastFetchTime < CACHE_DURATION
  ) {
    return cachedNotifications;
  }

  const response = await fetch("/api/notifications", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store", // No usar cache del navegador, siempre obtener datos frescos
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  const data = await response.json();
  cachedNotifications = data;
  lastFetchTime = now;
  return data;
}

function startGlobalPolling(
  onUpdate: (notifications: Notification[]) => void,
): (() => void) | null {
  if (globalPollingInterval) {
    return null; // Ya está corriendo
  }

  const poll = async () => {
    if (document.hidden) return; // No hacer polling si la página no está visible

    try {
      // Forzar refresh en polling para detectar nuevas notificaciones
      const notifications = await fetchNotificationsFromAPI(true);
      // Notificar a todos los suscriptores
      globalSubscribers.forEach((subscriber) => subscriber(notifications));
      onUpdate(notifications);
    } catch {
      // Do nothing
    }
  };

  // Poll inicial
  poll();

  // Configurar polling con intervalo
  globalPollingInterval = setInterval(poll, POLLING_INTERVAL);

  // Poll cuando la página vuelve a estar visible
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      poll();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Cleanup function
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

function stopGlobalPolling() {
  if (globalPollingInterval) {
    clearInterval(globalPollingInterval);
    globalPollingInterval = null;
  }
}

interface NotificationsProviderProps {
  children: ReactNode;
  onNewNotifications?: (newNotifications: Notification[]) => void;
}

export function NotificationsProvider({
  children,
  onNewNotifications,
}: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousNotificationIdsRef = useRef<Set<string>>(new Set());
  const cleanupRef = useRef<(() => void) | null>(null);
  const isInitialLoadRef = useRef(true);
  const onNewNotificationsRef = useRef(onNewNotifications);

  // Actualizar la referencia cuando cambia onNewNotifications
  useEffect(() => {
    onNewNotificationsRef.current = onNewNotifications;
  }, [onNewNotifications]);

  const updateNotifications = useCallback(
    (newNotifications: Notification[]) => {
      const newNotificationIds = new Set(newNotifications.map((n) => n.id));
      const previousIds = previousNotificationIdsRef.current;

      // Detectar nuevas notificaciones
      if (previousIds.size > 0 && onNewNotificationsRef.current) {
        const newOnes = newNotifications.filter((n) => !previousIds.has(n.id));
        if (newOnes.length > 0) {
          onNewNotificationsRef.current(newOnes);

          // Mostrar notificaciones del navegador para nuevas notificaciones
          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
              newOnes.forEach((notification) => {
                new Notification(notification.title, {
                  body: notification.message,
                  icon: "/favicon.ico",
                  badge: "/favicon.ico",
                  tag: notification.id,
                });
              });
            }
          }
        }
      }

      // Actualizar siempre en la carga inicial, o si hay cambios en IDs
      const currentIds = Array.from(newNotificationIds).sort().join(",");
      const previousIdsStr = Array.from(previousIds).sort().join(",");

      // Si es carga inicial o hay cambios, actualizar
      if (isInitialLoadRef.current || currentIds !== previousIdsStr) {
        previousNotificationIdsRef.current = newNotificationIds;
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter((n) => !n.read).length);
      } else {
        // Si no hay cambios en IDs, verificar si hay cambios en el estado de lectura
        // usando una comparación más simple
        setNotifications((prev) => {
          const prevReadStatus = prev
            .map((n) => `${n.id}:${n.read}`)
            .sort()
            .join(",");
          const newReadStatus = newNotifications
            .map((n) => `${n.id}:${n.read}`)
            .sort()
            .join(",");

          if (prevReadStatus !== newReadStatus) {
            setUnreadCount(newNotifications.filter((n) => !n.read).length);
            return newNotifications;
          }
          return prev;
        });
      }
    },
    [],
  );

  const fetchNotifications = useCallback(
    async (silent = false, forceRefresh = false) => {
      try {
        if (!silent) {
          setIsLoading(true);
          setError(null);
        }

        // Forzar refresh cuando se llama explícitamente (no desde cache)
        const data = await fetchNotificationsFromAPI(forceRefresh || !silent);

        // Actualizar notificaciones (siempre actualiza en carga inicial)
        updateNotifications(data);
        setError(null);

        // Marcar que la carga inicial terminó
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        // Asegurar que el estado se actualice incluso si hay error
        if (!silent) {
          setNotifications([]);
          setUnreadCount(0);
        }
        // Marcar que la carga inicial terminó incluso con error
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [updateNotifications],
  );

  const markAsRead = useCallback(
    async (id: string | "all") => {
      // Optimistic update
      if (id === "all") {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        if (id === "all") {
          await fetch("/api/notifications", { method: "PATCH" });
        } else {
          const response = await fetch(`/api/notifications/${id}`, {
            method: "PATCH",
          });
          // Si la notificación no existe (404), no es un error crítico
          if (response.status === 404) {
            // Remover de la lista local si no existe
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            return true;
          }
          if (!response.ok) {
            throw new Error("Failed to mark as read");
          }
        }
        await fetchNotifications(true); // Refrescar para sincronizar
        return true;
      } catch {
        await fetchNotifications(true); // Revertir
        return false;
      }
    },
    [fetchNotifications],
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      const notificationToDelete = notifications.find((n) => n.id === id);
      const wasUnread = notificationToDelete && !notificationToDelete.read;

      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await fetch(`/api/notifications/${id}`, { method: "DELETE" });
        await fetchNotifications(true);
        return true;
      } catch {
        await fetchNotifications(true);
        return false;
      }
    },
    [notifications, fetchNotifications],
  );

  const deleteAllNotifications = useCallback(async () => {
    try {
      await fetch("/api/notifications", { method: "DELETE" });
      setNotifications([]);
      setUnreadCount(0);
      return true;
    } catch {
      return false;
    }
  }, []);

  const refetch = useCallback(() => {
    fetchNotifications(false, true); // Forzar refresh al refetch
  }, [fetchNotifications]);

  useEffect(() => {
    // Cargar inicialmente
    fetchNotifications();

    // Iniciar polling global si no está activo
    if (!globalPollingInterval) {
      const cleanup = startGlobalPolling(updateNotifications);
      if (cleanup) {
        cleanupRef.current = cleanup;
      }
    }

    // Suscribirse a actualizaciones
    globalSubscribers.add(updateNotifications);

    return () => {
      globalSubscribers.delete(updateNotifications);
      // Solo detener polling si no hay más suscriptores
      if (globalSubscribers.size === 0 && cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
        stopGlobalPolling();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez en el montaje

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        deleteNotification,
        deleteAllNotifications,
        refetch,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationsContext must be used within NotificationsProvider",
    );
  }
  return context;
}
