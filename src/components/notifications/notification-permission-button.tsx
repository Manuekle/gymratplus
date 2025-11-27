"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWebNotifications } from "@/hooks/use-web-notifications";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";

export function NotificationPermissionButton() {
  const { permission, requestPermission, canShow } = useWebNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequest = async () => {
    setIsRequesting(true);
    await requestPermission();
    setIsRequesting(false);
  };

  if (permission === "granted" || canShow) {
    return null; // No mostrar si ya tiene permiso
  }

  return (
    <Button
      variant="outline"
      size="default"
      onClick={handleRequest}
      disabled={isRequesting || permission === "denied"}
      className="text-xs"
    >
      <HugeiconsIcon icon={Notification01Icon} className="h-4 w-4 mr-2" />
      {permission === "denied"
        ? "Notificaciones bloqueadas"
        : "Activar notificaciones"}
    </Button>
  );
}
