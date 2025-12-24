import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const NotificationSkeleton = ({ cantidad = 5 }) => {
  // Limitamos la cantidad máxima a 10
  const cantidadNotificaciones = Math.min(cantidad, 10);

  return (
    <Card className="overflow-hidden p-0">
      {Array.from({ length: cantidadNotificaciones }).map((_, index) => (
        <div
          key={index}
          className={`flex items-center gap-4 p-3.5 ${index > 0 ? 'border-t' : ''}`}
        >
          <div className="flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </Card>
  );
};

export default NotificationSkeleton;
