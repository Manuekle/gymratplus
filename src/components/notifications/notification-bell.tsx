"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/use-notifications";
import Link from "next/link";

import { ScrollArea } from "../ui/scroll-area";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification02Icon } from "@hugeicons/core-free-icons";

export function NotificationBell() {
  const { notifications, isLoading, unreadCount, markAsRead, refetch } =
    useNotifications();
  const [open, setOpen] = useState(false);

  // Recargar notificaciones cuando se abre el popover
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <HugeiconsIcon icon={Notification02Icon} className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1 py-0 text-[8px] min-w-[18px] min-h-[18px] flex items-center justify-center font-semibold ">
              {unreadCount > 9 ? "+9" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b flex items-center justify-between">
          <h4 className="font-semibold text-sm">Notificaciones</h4>
          {unreadCount > 0 && (
            <Button
              onClick={() => markAsRead("all")}
              variant="ghost"
              size="sm"
              className="text-xs h-8 hidden"
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread" disabled={unreadCount === 0}>
              No leídas {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <NotificationsSkeleton />
            ) : notifications.length > 0 ? (
              <div className="divide-y">
                <ScrollArea className="h-[150px] md:h-[300px]">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                    />
                  ))}
                </ScrollArea>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 space-y-2">
                <HugeiconsIcon icon={Notification02Icon} className="h-10 w-10 text-muted-foreground opacity-40" />
                <p className="text-xs text-muted-foreground text-center">
                  No tienes notificaciones
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread">
            {isLoading ? (
              <NotificationsSkeleton />
            ) : notifications.filter((n) => !n.read).length > 0 ? (
              <div className="divide-y">
                <ScrollArea className="h-[150px] md:h-[300px]">
                  {notifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                      />
                    ))}
                </ScrollArea>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 space-y-2">
                <HugeiconsIcon icon={Notification02Icon} className="h-10 w-10 text-muted-foreground opacity-40" />
                <p className="text-xs md:text-sm text-muted-foreground text-center">
                  No tienes notificaciones sin leer
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="p-2 border-t text-center">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs h-8 w-full text-muted-foreground"
          >
            <Link href="/dashboard/notifications">
              Ver todas las notificaciones
            </Link>
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
