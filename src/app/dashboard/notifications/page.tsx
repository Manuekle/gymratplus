"use client";

import React from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { es } from "date-fns/locale";
import { AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationItem } from "@/components/notifications/notification-item";

import { useNotificationsContext } from "@/providers/notifications-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// import { Icons } from "@/components/icons";
import NotificationSkeleton from "@/components/skeleton/notification-skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  FilterAddIcon,
  Notification03Icon,
} from "@hugeicons/core-free-icons";
import { PushNotificationManager } from "@/components/pwa/push-manager";

export default function NotificationsPage() {
  const router = useRouter();

  const {
    notifications,
    isLoading,
    markAsRead,
    deleteNotification,
    deleteAllNotifications,
    unreadCount,
  } = useNotificationsContext();

  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] =
    React.useState(false);

  const filteredNotifications = React.useMemo(() => {
    if (selectedTypes.length === 0) return notifications;

    return notifications.filter((n) => selectedTypes.includes(n.type));
  }, [notifications, selectedTypes]);

  const notificationTypeLabels: Record<
    string,
    { label: string; emoji: string }
  > = {
    system: { label: "Sistema", emoji: "⚙️" },
    workout: { label: "Entrenamiento", emoji: "💪" },
    meal: { label: "Comida", emoji: "🍽️" },
    water: { label: "Agua", emoji: "💧" },
    weight: { label: "Peso", emoji: "⚖️" },
    goal: { label: "Objetivo", emoji: "🎯" },
  };

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
        <div className="w-full md:w-auto">
          <Button
            variant="outline"
            size="default"
            onClick={() => router.push("/dashboard")}
            className="mb-2 text-xs w-full md:w-auto text-left"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />{" "}
            Volver al dashboard
          </Button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold tracking-heading">
              Notificaciones
            </h1>
            <p className="text-xs text-muted-foreground">
              Gestiona tus notificaciones y alertas
            </p>
          </div>
          <PushNotificationManager />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="default" variant="outline" className="text-xs">
                <HugeiconsIcon icon={FilterAddIcon} className="mr-2 h-4 w-4" />
                Filtrar
                {selectedTypes.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
                    {selectedTypes.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {notificationTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                  className="text-xs capitalize"
                >
                  <span className="flex items-center gap-2">
                    <span>{notificationTypeLabels[type]?.emoji || "🔔"}</span>
                    <span>
                      {notificationTypeLabels[type]?.label ||
                        type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  </span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {notifications.length > 0 && (
            <>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={async () => {
                    const success = await markAsRead("all");
                    if (success) {
                      toast.success(
                        "Todas las notificaciones marcadas como leídas",
                      );
                    }
                  }}
                  className="text-xs"
                >
                  Marcar todas como leídas
                </Button>
              )}
              <Button
                variant="destructive"
                size="default"
                onClick={() => setIsDeleteAllDialogOpen(true)}
                className="text-xs"
              >
                Borrar todas
              </Button>
            </>
          )}
        </div>
      </div>

      <AlertDialog
        open={isDeleteAllDialogOpen}
        onOpenChange={setIsDeleteAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-semibold tracking-heading">
              ¿Eliminar todas las notificaciones?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              ¿Estás seguro de que quieres eliminar todas las notificaciones?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const success = await deleteAllNotifications();
                if (success) {
                  toast.success("Todas las notificaciones eliminadas");
                  setIsDeleteAllDialogOpen(false);
                } else {
                  toast.error("Error al eliminar las notificaciones");
                }
              }}
              className="text-xs bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs defaultValue="all" className="w-full">
        <div className="w-full max-w-md overflow-x-auto md:overflow-visible">
          <TabsList className="inline-flex flex-wrap h-auto gap-1.5 sm:gap-2 p-1.5 w-full sm:w-auto min-w-0">
            <TabsTrigger className="text-xs flex-shrink-0" value="all">
              Todas
            </TabsTrigger>
            <TabsTrigger
              className="text-xs flex-shrink-0"
              value="unread"
              disabled={unreadCount === 0}
            >
              No leídas {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all">
          {isLoading ? (
            <NotificationSkeleton cantidad={8} />
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              title="No hay notificaciones"
              description="No tienes notificaciones en este momento"
              icon={
                <HugeiconsIcon
                  icon={Notification03Icon}
                  className="h-10 w-10 text-muted-foreground opacity-30"
                />
              }
            />
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {Object.entries(groupedNotifications).map(
                ([date, notifications]) => (
                  <div key={date}>
                    <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30 border-b">
                      {formatGroupDate(date)}
                    </div>
                    <div className="divide-y">
                      <AnimatePresence mode="popLayout">
                        {notifications.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={markAsRead}
                            onDelete={deleteNotification}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-4">
          {isLoading ? (
            <NotificationSkeleton cantidad={8} />
          ) : filteredNotifications.filter((n) => !n.read).length === 0 ? (
            <EmptyState
              title="No hay notificaciones sin leer"
              description="Has leído todas tus notificaciones"
              icon={
                <HugeiconsIcon
                  icon={Notification03Icon}
                  className="h-10 w-10 text-muted-foreground opacity-30"
                />
              }
            />
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="divide-y">
                <AnimatePresence mode="popLayout">
                  {filteredNotifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
