"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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
import { ArrowExpandIcon } from "@hugeicons/core-free-icons";

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
      layout
      animate={{
        scale: isMinimized ? 1 : 1,
        opacity: 1,
        y: 0,
      }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.div
        layout
        className={`relative overflow-hidden backdrop-blur-md border shadow-lg
          ${
            isMinimized
              ? "rounded-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 cursor-pointer hover:shadow-xl"
              : "w-64 rounded-3xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
          }`}
        onClick={isMinimized ? () => setIsMinimized(false) : undefined}
        style={{ borderRadius: isMinimized ? 9999 : 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isMinimized ? (
            <motion.div
              layout
              key="minimized"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="px-4 py-2 flex items-center gap-2.5"
            >
              <div
                className={`w-2 h-2 rounded-full ${isPaused ? "bg-amber-500" : "bg-emerald-500"}`}
              />
              <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 tabular-nums tracking-[-0.02em]">
                {formatTime(elapsedTime)}
              </div>
            </motion.div>
          ) : (
            <motion.div
              layout
              key="expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="p-4 w-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-amber-500" : "bg-emerald-500"}`}
                  />
                  <span className="text-xs font-semibold tracking-[-0.02em] text-zinc-500 dark:text-zinc-400">
                    {isPaused ? "Pausado" : "Activo"}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 -mr-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(true);
                  }}
                >
                  <HugeiconsIcon
                    icon={ArrowExpandIcon}
                    size={14}
                    className="rotate-45"
                  />
                </Button>
              </div>

              <div className="flex justify-center mb-6">
                <div className="text-4xl font-semibold text-zinc-900 dark:text-zinc-50 tabular-nums tracking-[-0.02em]er">
                  {formatTime(elapsedTime)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePause();
                  }}
                >
                  {isPaused ? "Reanudar" : "Pausar"}
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 rounded-lg text-white text-xs font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirmDialog(true);
                  }}
                >
                  Terminar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
            <div className="text-3xl font-semibold tracking-[-0.02em]er tabular-nums">
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
