"use client";

import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { Notification02Icon } from "hugeicons-react";

interface NotificationIconProps {
  onClick: () => void;
}

export function NotificationIcon({ onClick }: NotificationIconProps) {
  const { unreadCount } = useNotifications();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="relative"
      aria-label={`Notifications ${
        unreadCount > 0 ? `(${unreadCount} unread)` : ""
      }`}
    >
      <Notification02Icon className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#DE3163] text-xs text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Button>
  );
}
