"use client";

import { useState } from "react";
import type { Notification } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<boolean>;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const [, setIsMarking] = useState(false);

  const handleClick = async () => {
    if (notification.read) return;

    setIsMarking(true);
    await onMarkAsRead(notification.id);
    setIsMarking(false);
  };

  // Get icon based on notification type and title
  const getTypeIcon = () => {
    switch (notification.type) {
      case "workout":
        // Si el título contiene "racha" o "hito", usar el emoji de fuego
        if (
          notification.title.toLowerCase().includes("racha") ||
          notification.title.toLowerCase().includes("hito")
        ) {
          return "🔥";
        }
        // Para otros tipos de notificaciones de entrenamiento
        return "💪";
      case "meal":
        return "🍟"; // Emoji de papas fritas
      case "water":
        return "💧"; // Emoji de gota de agua
      case "weight":
        return "⚖️"; // Emoji de balanza
      case "goal":
        return "📏"; // Emoji de regla
      default:
        return "⚠️"; // Emoji de alerta
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-start p-4 hover:bg-muted/30 cursor-pointer transition-colors",
        notification.read ? "bg-background" : "bg-muted/20",
      )}
    >
      <div className="flex-shrink-0 mr-3 text-xl">{getTypeIcon()}</div>
      <div className="flex-grow min-w-0">
        <h4
          className={cn(
            "text-sm",
            notification.read ? "font-medium" : "font-semibold",
          )}
        >
          {notification.title}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2 ">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: es,
          })}
        </p>
      </div>
    </div>
  );
}
