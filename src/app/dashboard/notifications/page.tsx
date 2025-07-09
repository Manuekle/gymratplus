"use client";

import React from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { es } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationItem } from "@/components/notifications/notification-item";
import { useNotifications } from "@/hooks/use-notifications";
import {
  ArrowLeft01Icon,
  FilterAddIcon,
  Notification03Icon,
} from "hugeicons-react";
// import { Icons } from "@/components/icons";
import NotificationSkeleton from "@/components/skeleton/notification-skeleton";

export default function NotificationsPage() {
  const router = useRouter();

  const { notifications, isLoading, markAsRead, unreadCount } =
    useNotifications();

  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);

  const filteredNotifications = React.useMemo(() => {
    if (selectedTypes.length === 0) return notifications;

    return notifications.filter((n) => selectedTypes.includes(n.type));
  }, [notifications, selectedTypes]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const notificationTypes = React.useMemo(() => {
    const types = new Set(notifications.map((n) => n.type));
    return Array.from(types);
  }, [notifications]);

  const groupedNotifications = React.useMemo(() => {
    const groups: Record<string, typeof notifications> = {};

    filteredNotifications.forEach((notification) => {
      const date = format(new Date(notification.createdAt), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });

    return groups;
  }, [filteredNotifications]);

  const formatGroupDate = (date: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");

    if (date === today) return "Hoy";
    if (date === yesterday) return "Ayer";

    return format(new Date(date), "dd MMM yyyy", { locale: es });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="mb-2 text-xs"
          >
            <ArrowLeft01Icon className="h-4 w-4 mr-2" /> Volver
          </Button>
        </div>
      </div>
      <div className="flex md:flex-row flex-col md:items-center items-start md:gap-0 gap-4 justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold  tracking-heading">
            Notificaciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus notificaciones y alertas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="text-xs px-6">
                <FilterAddIcon className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {notificationTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                  className="text-xs md:text-sm capitalize"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {unreadCount > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => markAsRead("all")}
              className="text-xs"
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-2">
          <TabsTrigger className="text-sm" value="all">
            Todas
          </TabsTrigger>
          <TabsTrigger value="unread" disabled={unreadCount === 0}>
            No leídas {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader className="px-4 border-b">
              <CardTitle className="text-2xl tracking-heading font-semibold">
                Todas las notificaciones
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Historial de todas tus notificaciones y alertas
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <NotificationSkeleton cantidad={8} />
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-12 space-y-3">
                  <Notification03Icon className="h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="font-medium text-sm">No hay notificaciones</h3>
                  <p className="text-xs text-muted-foreground text-center max-w-sm">
                    No tienes notificaciones en este momento. Las nuevas
                    notificaciones aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div>
                  {Object.entries(groupedNotifications).map(
                    ([date, notifications]) => (
                      <div key={date}>
                        <div className="px-4 py-2 text-center text-lg font-semibold  tracking-heading border border-b border-t border-l-0 border-r-0">
                          {formatGroupDate(date)}
                        </div>
                        <div className="divide-y">
                          {notifications.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onMarkAsRead={markAsRead}
                            />
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-4">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-2xl tracking-heading font-semibold">
                Notificaciones no leídas
              </CardTitle>
              <CardDescription>
                Notificaciones que aún no has revisado
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <NotificationSkeleton cantidad={8} />
              ) : filteredNotifications.filter((n) => !n.read).length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 space-y-3">
                  <Notification03Icon className="h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="font-medium">
                    No hay notificaciones sin leer
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Has leído todas tus notificaciones. ¡Buen trabajo!
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                      />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
