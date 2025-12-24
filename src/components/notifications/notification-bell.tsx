"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationsContext } from "@/providers/notifications-provider";
import Link from "next/link";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  // Función para obtener el emoji según el tipo de notificación
  const getNotificationEmoji = (type: string) => {
    switch (type) {
      case "workout":
        return "💪";
      case "meal":
        return "🍟";
      case "water":
        return "💧";
      case "weight":
        return "⚖️";
      case "goal":
        return "📏";
      case "chat":
        return "💬";
      default:
        return "🔔";
    }
  };

  const { notifications, isLoading, unreadCount, markAsRead, refetch } =
    useNotificationsContext();

  // Detectar nuevas notificaciones y mostrar toasts
  const previousUnreadRef = useRef<number>(0);
  const previousNotificationIdsRef = useRef<Set<string>>(new Set());
  const hasShownInitialRef = useRef(false);

  useEffect(() => {
    // No mostrar toasts en la carga inicial
    if (!hasShownInitialRef.current) {
      const currentIds = new Set(notifications.map((n) => n.id));
      previousNotificationIdsRef.current = currentIds;
      previousUnreadRef.current = unreadCount;
      hasShownInitialRef.current = true;
      return;
    }

    const currentIds = new Set(notifications.map((n) => n.id));
    const previousIds = previousNotificationIdsRef.current;

    // Detectar nuevas notificaciones
    if (previousIds.size > 0) {
      const newNotifications = notifications.filter(
        (n) => !previousIds.has(n.id) && !n.read,
      );

      if (newNotifications.length > 0) {
        // Mostrar toasts para nuevas notificaciones
        newNotifications.slice(0, 3).forEach((notification) => {
          toast.info(notification.title, {
            description: notification.message,
            duration: 5000,
            icon: getNotificationEmoji(notification.type),
          });
        });
      }
    }

    previousNotificationIdsRef.current = currentIds;
    previousUnreadRef.current = unreadCount;
  }, [notifications, unreadCount]);

  // Recargar notificaciones cuando se abre el popover (forzar refresh)
  useEffect(() => {
    if (open) {
      // Forzar refresh al abrir el popover para obtener notificaciones más recientes
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // refetch es estable, no necesita estar en dependencias

  // Manejar marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    const success = await markAsRead("all");
    if (success) {
      toast.success("Todas las notificaciones marcadas como leídas");
    } else {
      toast.error("Error al marcar las notificaciones como leídas");
    }
  };

  // Manejar click en notificación: solo marcar como leída
  const handleNotificationClick = async (id: string) => {
    return await markAsRead(id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <HugeiconsIcon icon={Notification01Icon} className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 py-0 text-xs min-w-[18px] min-h-[18px] flex items-center justify-center font-semibold">
              {unreadCount > 9 ? "+9" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b flex items-center justify-between">
          <h4 className="font-medium text-xs">Notificaciones</h4>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="ghost"
              size="default"
              className="text-xs h-7"
            >
              Marcar todas
            </Button>
          )}
        </div>

        {isLoading ? (
          <NotificationsSkeleton />
        ) : notifications.length > 0 ? (
          <div className="overflow-y-auto max-h-[320px]">
            <div className="divide-y">
              <AnimatePresence mode="popLayout">
                {notifications.slice(0, 4).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleNotificationClick}
                    showDeleteButton={false}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8">
            <HugeiconsIcon
              icon={Notification01Icon}
              className="h-8 w-8 text-muted-foreground opacity-40 mb-2"
            />
            <p className="text-xs text-muted-foreground text-center">
              No tienes notificaciones
            </p>
          </div>
        )}

        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="default"
            asChild
            className="text-xs h-7 w-full"
          >
            <Link href="/dashboard/notifications">Ver todas</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
