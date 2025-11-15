"use client";

import { useEffect, useRef } from "react";
import { useNotificationsContext } from "@/providers/notifications-provider";

/**
 * Componente que actualiza dinámicamente el título de la página
 * agregando el número de notificaciones no leídas, similar a WhatsApp
 * Ejemplo: "(3) Dashboard | GymRat+"
 */
export function DynamicTitle() {
  const { unreadCount } = useNotificationsContext();
  const baseTitleRef = useRef<string | null>(null);

  useEffect(() => {
    // Obtener el título base la primera vez (sin el contador de notificaciones)
    if (!baseTitleRef.current) {
      // Remover cualquier contador existente y guardar el título base
      baseTitleRef.current = document.title.replace(/^\(\d+\)\s*/, "").trim();
    }

    const baseTitle = baseTitleRef.current;

    // Si hay notificaciones no leídas, agregar el contador al inicio
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${baseTitle}`;
    } else {
      // Si no hay notificaciones, usar el título base sin contador
      document.title = baseTitle;
    }
  }, [unreadCount]);

  return null; // Este componente no renderiza nada
}
