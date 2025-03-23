import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const NotificationSkeleton = ({ cantidad = 5 }) => {
  // Limitamos la cantidad máxima a 10
  const cantidadNotificaciones = Math.min(cantidad, 10);

  // Array para las diferentes indicaciones de tiempo
  const tiempoVariaciones = [
    "h-3 w-28", // "hace 33 minutos"
    "h-3 w-36", // "hace alrededor de 1 hora"
  ];

  return (
    <div className="w-full space-y-4 py-4">
      {Array.from({ length: cantidadNotificaciones }).map((_, index) => (
        <div key={index} className="flex items-start space-x-3 py-4 border-b">
          <div className="flex-shrink-0 mt-1 px-4">
            <Skeleton className="h-6 w-6 rounded-full " />
          </div>
          <div className="flex-1 space-y-2 px-4">
            <Skeleton className="h-5 w-48 " />
            <Skeleton className="h-4 w-64 " />
            <Skeleton
              className={`${
                tiempoVariaciones[index % tiempoVariaciones.length]
              } `}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
