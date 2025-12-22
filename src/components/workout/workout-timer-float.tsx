"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { Icons } from "@/components/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  PauseIcon,
  PlayIcon,
  Cancel01Icon,
  ArrowExpandIcon,
} from "@hugeicons/core-free-icons";

interface WorkoutTimerFloatProps {
  workoutSessionId: string;
  startTime: Date;
  onComplete: () => void;
}

export default function WorkoutTimerFloat({
  workoutSessionId,
  startTime,
  onComplete,
}: WorkoutTimerFloatProps) {
  const router = useRouter();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeRef = useRef<number>(0);

  // Iniciar el temporizador
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const pauseOffset = pauseTimeRef.current || 0;
        const elapsed =
          Math.floor((now.getTime() - startTime.getTime()) / 1000) -
          pauseOffset;
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime, isPaused]);

  // Formatear tiempo en formato mm:ss
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Pausar/reanudar el temporizador
  const togglePause = () => {
    if (isPaused) {
      // Reanudar
      setIsPaused(false);
    } else {
      // Pausar
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        pauseTimeRef.current += 1; // Añadir el tiempo de pausa
      }
      setIsPaused(true);
    }
  };

  // Finalizar el entrenamiento
  const completeWorkout = async () => {
    setIsCompleting(true);
    try {
      // Calcular duración en minutos
      const duration = Math.round(elapsedTime / 60);

      const response = await fetch("/api/workout-session/complete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutSessionId,
          duration,
        }),
      });

      if (response.ok) {
        toast.success("¡Entrenamiento completado!", {
          description: `Duración: ${formatTime(elapsedTime)}`,
        });

        onComplete();
        router.push("/dashboard/workout/history");
      } else {
        throw new Error("Error al completar el entrenamiento");
      }
    } catch (error) {
      console.error("Error al completar entrenamiento:", error);
      toast.error("Error", {
        description: `No se pudo completar el entrenamiento`,
      });
    } finally {
      setIsCompleting(false);
      setShowConfirmDialog(false);
    }
  };

  // Descartar el entrenamiento
  const discardWorkout = async () => {
    setIsDiscarding(true);
    try {
      const response = await fetch(`/api/workout-session/${workoutSessionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Entrenamiento descartado", {
          description: "Se ha eliminado la sesión de entrenamiento",
        });

        router.push("/dashboard/workout");
      } else {
        throw new Error("Error al descartar el entrenamiento");
      }
    } catch (error) {
      console.error("Error al descartar entrenamiento:", error);

      toast.error("Error", {
        description: `No se pudo descartar el entrenamiento`,
      });
    } finally {
      setIsDiscarding(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <motion.div
      animate={{ scale: isMinimized ? 0.8 : 1 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div
        className={`bg-foreground p-4 transition 
          ${
            isMinimized
              ? "rounded-full flex items-center justify-center cursor-pointer"
              : "w-64 rounded-lg"
          }`}
        onClick={isMinimized ? () => setIsMinimized(false) : undefined}
      >
        {isMinimized ? (
          <div className="text-xl text-white dark:text-black font-semibold  px-4 w-fit">
            {formatTime(elapsedTime)}
          </div>
        ) : (
          // <span>hola</span>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  size={14}
                  className="text-white dark:text-black"
                />
                <span className="font-medium text-xs text-white dark:text-black">
                  Tiempo de entrenamiento
                </span>
              </div>
              <Button
                size="icon"
                className="p-1 rounded-sm"
                onClick={() => setIsMinimized(true)}
              >
                <HugeiconsIcon
                  icon={ArrowExpandIcon}
                  size={14}
                  className="text-white dark:text-black"
                />
              </Button>
            </div>

            <div className="text-center">
              <div className="text-2xl font-semibold  text-white dark:text-black">
                {formatTime(elapsedTime)}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                size="default"
                variant="default"
                className="p-1"
                onClick={togglePause}
              >
                {isPaused ? (
                  <HugeiconsIcon
                    icon={PlayIcon}
                    size={16}
                    className="text-white dark:text-black"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={PauseIcon}
                    size={16}
                    className="text-white dark:text-black"
                  />
                )}
              </Button>

              <Button
                size="default"
                className="text-xs px-4 bg-destructive dark:bg-[#BB020B] dark:text-white hover:bg-destructive/80"
                onClick={() => setShowConfirmDialog(true)}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Diálogo de confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] overflow-y-auto pt-4 sm:pt-8 px-4 sm:px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-heading text-center">
              ¿Terminar entrenamiento?
            </DialogTitle>
            <DialogDescription className="text-xs text-center text-muted-foreground">
              Elige qué deseas hacer con la sesión actual.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-4 space-y-1">
            <span className="text-xs text-muted-foreground font-medium">
              Tiempo Total
            </span>
            <div className="text-4xl font-bold tracking-[-0.04em]">
              {formatTime(elapsedTime)}
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-3 w-full pt-2">
            <Button
              size="default"
              variant="destructive"
              className="flex-1 text-xs"
              onClick={discardWorkout}
              disabled={isCompleting || isDiscarding}
            >
              {isDiscarding ? (
                <Icons.spinner className="h-4 w-4 animate-spin ml-2" />
              ) : null}
              Descartar
            </Button>
            <Button
              size="default"
              variant="default"
              onClick={completeWorkout}
              disabled={isCompleting || isDiscarding}
              className="flex-1 text-xs"
            >
              {isCompleting ? (
                <Icons.spinner className="h-4 w-4 animate-spin ml-2" />
              ) : null}
              Completar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
