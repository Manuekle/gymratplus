"use client";

import { useState } from "react";
import type { Notification } from "@prisma/client";
import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  showDeleteButton?: boolean;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  showDeleteButton = true,
}: NotificationItemProps) {
  const [isMarking, setIsMarking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
  const x = useMotionValue(0);
  const deleteButtonWidth = 80;
  // Threshold: necesita deslizar al menos 60% del ancho del botón para confirmar eliminación
  const deleteThreshold = deleteButtonWidth * 0.6;

  // Opacidad del botón de eliminar - aparece gradualmente
  const deleteOpacity = useTransform(
    x,
    [-deleteButtonWidth, -deleteButtonWidth * 0.5, 0],
    [1, 0.5, 0],
  );

  // Escala del icono de eliminar para feedback visual
  const deleteIconScale = useTransform(
    x,
    [-deleteButtonWidth, -deleteThreshold, -deleteThreshold * 0.5, 0],
    [1.2, 1.1, 1, 1],
  );

  // Opacidad del contenido mientras se desliza
  const contentOpacity = useTransform(
    x,
    [-deleteButtonWidth, -deleteButtonWidth * 0.5, 0],
    [0.7, 0.85, 1],
  );

  const handleClick = async (e: React.MouseEvent) => {
    // No marcar como leída si se hace click en el botón de eliminar
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    // Si showDeleteButton es false, significa que viene del popover
    // En ese caso, solo marcar como leída
    if (!showDeleteButton) {
      if (notification.read) return;

      setIsMarking(true);
      const success = await onMarkAsRead(notification.id);
      if (!success) {
        toast.error("Error al marcar la notificación como leída");
      }
      setIsMarking(false);
      return;
    }

    // Comportamiento normal: solo marcar como leída
    if (notification.read) return;

    setIsMarking(true);
    const success = await onMarkAsRead(notification.id);
    if (!success) {
      toast.error("Error al marcar la notificación como leída");
    }
    setIsMarking(false);
  };

  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!onDelete) return;

    setIsDeleting(true);
    const success = await onDelete(notification.id);
    if (success) {
      toast.success("Mensaje borrado");
    } else {
      toast.error("Error al eliminar la notificación");
    }
    setIsDeleting(false);
    // Resetear posición después de eliminar
    x.set(0);
  };

  const handleDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (!isMobile) return;

    // Solo permitir deslizar hacia la izquierda (valores negativos)
    // Si intenta deslizar hacia la derecha, no actualizar x (no se mueve visualmente)
    if (info.offset.x > 0) {
      return;
    }

    // No permitir deslizar más allá del ancho completo del botón de eliminar
    const currentX = info.offset.x;
    if (currentX < -deleteButtonWidth) {
      return;
    }

    // Actualizar el valor de x mientras se arrastra (solo hacia la izquierda)
    if (onDelete) {
      x.set(Math.max(-deleteButtonWidth, currentX));
    }
  };

  const handleDragEnd = async (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (!isMobile) return;

    const currentX = info.offset.x;
    const velocity = info.velocity.x;

    // Si desliza hacia la derecha, marcar como leída
    if (currentX > 30 && !notification.read) {
      setIsMarking(true);
      await onMarkAsRead(notification.id);
      setIsMarking(false);
      x.set(0);
      return;
    }

    // Si no hay onDelete, no hacer nada más
    if (!onDelete) {
      x.set(0);
      return;
    }

    // Swipe hacia la izquierda para eliminar
    // Considerar tanto la posición como la velocidad del swipe
    const shouldDelete =
      currentX < -deleteThreshold ||
      (currentX < -deleteButtonWidth * 0.3 && velocity < -500);

    if (shouldDelete) {
      // Swipe suficiente para eliminar - animar hasta el final con spring suave
      x.set(-deleteButtonWidth);
      // Esperar a que la animación termine antes de eliminar
      await new Promise((resolve) => setTimeout(resolve, 200));
      await handleDelete();
    } else {
      // Volver a la posición original con animación spring suave
      x.set(0);
    }
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

  const content = (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors group relative rounded-lg",
        notification.read ? "opacity-60" : "",
        isMarking && "opacity-50",
        !showDeleteButton && "w-full",
      )}
    >
      <div className="flex-shrink-0 text-xl">{getTypeIcon()}</div>
      <div className="flex-grow min-w-0 overflow-hidden">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              "text-xs truncate",
              notification.read
                ? "text-muted-foreground"
                : "font-medium text-foreground",
            )}
          >
            {notification.title}
          </h4>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 truncate">
          {notification.message}
        </p>
      </div>
      {showDeleteButton && !isMobile && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",
            isHovered && "opacity-100",
            isDeleting && "opacity-50",
          )}
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <HugeiconsIcon
            icon={Delete02Icon}
            className="h-4 w-4 text-destructive"
          />
        </Button>
      )}
    </div>
  );

  // En móvil con swipe to delete
  if (isMobile && onDelete && showDeleteButton) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{
          opacity: 0,
          x: -100,
          height: 0,
          marginTop: 0,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
          transition: {
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
            height: { duration: 0.3 },
            opacity: { duration: 0.2 },
          },
        }}
        transition={{
          layout: { duration: 0.3, ease: "easeInOut" },
          opacity: { duration: 0.2 },
          y: { duration: 0.2 },
        }}
        className="relative overflow-hidden w-full"
      >
        {/* Botón de eliminar detrás */}
        <motion.div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-destructive z-0"
          style={{
            width: deleteButtonWidth,
            opacity: deleteOpacity,
          }}
        >
          <motion.div
            style={{
              scale: deleteIconScale,
            }}
            className="flex items-center justify-center w-full h-full"
          >
            <HugeiconsIcon
              icon={Delete02Icon}
              className="h-7 w-7 text-white drop-shadow-sm"
            />
          </motion.div>
        </motion.div>
        {/* Contenido deslizable */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -deleteButtonWidth, right: 0 }}
          dragElastic={0}
          dragMomentum={false}
          dragDirectionLock={true}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{
            x,
            opacity: contentOpacity,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
            mass: 0.8,
          }}
          className="relative bg-background z-10"
        >
          {content}
        </motion.div>
      </motion.div>
    );
  }

  // En web o sin swipe
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        x: -100,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        transition: {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
          height: { duration: 0.3 },
          opacity: { duration: 0.2 },
        },
      }}
      transition={{
        layout: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2 },
        y: { duration: 0.2 },
      }}
      className="mb-2"
    >
      {content}
    </motion.div>
  );
}
