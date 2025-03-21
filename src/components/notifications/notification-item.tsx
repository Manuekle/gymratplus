import React from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NotificationType } from "@/types/notifications-types";

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    createdAt: Date;
  };
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "workout":
        return "💪";
      case "goal":
        return "🎯";
      case "meal":
        return "🍽️";
      case "weight":
        return "⚖️";
      case "progress":
        return "📈";
      case "nutrition":
        return "🥗";
      case "water":
        return "💧";
      default:
        return "📣";
    }
  };

  const getBgColor = () => {
    if (notification.read) return "";

    return "bg-muted/40";
  };

  const getTimeAgo = () => {
    return formatDistanceToNow(new Date(notification.createdAt), {
      addSuffix: true,
      locale: es,
    });
  };

  return (
    <div
      className={cn(
        "p-3 flex items-start gap-3 hover:bg-muted/30 transition-colors",
        getBgColor()
      )}
    >
      <div className="text-xl flex-shrink-0 pt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h5 className="font-medium text-sm">{notification.title}</h5>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          {getTimeAgo()}
        </p>
      </div>
      {!notification.read && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-muted"
              >
                <Check className="h-3 w-3" />
                <span className="sr-only">Marcar como leída</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">Marcar como leída</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
