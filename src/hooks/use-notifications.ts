"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { NotificationType } from "@/types/notifications-types";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function useNotifications() {
  const { data: session } = useSession();
  // const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(
    null
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications");

      if (!response.ok) {
        throw new Error("Error al cargar notificaciones");
      }

      const data: Notification[] = await response.json();
      setNotifications(data);

      // Comprobar si hay nuevas notificaciones
      if (data.length > 0 && lastNotificationId !== null) {
        const newNotifications = data.filter(
          (n) => !n.read && n.id !== lastNotificationId
        );

        if (newNotifications.length > 0) {
          const latest = newNotifications[0];
          setLastNotificationId(latest.id);
          alert(`Nueva notificación: ${latest.title}`);

          toast.success(latest.title, {
            description: latest.message,
          });

          // Mostrar toast para la nueva notificación
          // toast({
          //   title: latest.title,
          //   description: latest.message,
          //   action: (
          //     <Button
          //       onClick={() => markAsRead(latest.id)}
          //       variant="outline"
          //       size="sm"
          //     >
          //       Ver
          //     </Button>
          //   ),
          // });
        }
      } else if (data.length > 0 && lastNotificationId === null) {
        // Primera carga, establecer el último ID
        setLastNotificationId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session, lastNotificationId]);

  const markAsRead = useCallback(
    async (id: string | "all") => {
      if (!session?.user) return;

      try {
        if (id === "all") {
          // Marca todas como leídas
          const promises = notifications
            .filter((n) => !n.read)
            .map((n) =>
              fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: n.id }),
              })
            );

          await Promise.all(promises);
        } else {
          // Marca una específica como leída
          await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
        }

        // Actualizar estado local
        if (id === "all") {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } else {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [notifications, session]
  );

  // Cargar notificaciones al montar y sondear periódicamente
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    refetch: fetchNotifications,
  };
}
