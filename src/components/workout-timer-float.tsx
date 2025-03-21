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
import {
  Clock01Icon,
  PauseIcon,
  PlayIcon,
  Cancel01Icon,
  ArrowExpandIcon,
} from "hugeicons-react";
import { Icons } from "./icons";

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
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
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
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  // Descartar el entrenamiento
  const discardWorkout = async () => {
    setLoading(true);
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
      setLoading(false);
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
          <div className="text-xl text-white dark:text-black font-bold px-4 w-fit">
            {formatTime(elapsedTime)}
          </div>
        ) : (
          // <span>hola</span>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock01Icon size={14} className="text-white dark:text-black" />
                <span className="font-medium text-xs text-white dark:text-black">
                  Tiempo de entrenamiento
                </span>
              </div>
              <Button
                className="p-1 rounded-sm"
                onClick={() => setIsMinimized(true)}
              >
                <ArrowExpandIcon
                  size={16}
                  className="text-white dark:text-black"
                />
              </Button>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-white dark:text-black">
                {formatTime(elapsedTime)}
              </div>
            </div>

            <div className="flex justify-between">
              <Button className="p-1" onClick={togglePause}>
                {isPaused ? (
                  <PlayIcon size={16} className="text-white dark:text-black" />
                ) : (
                  <PauseIcon size={16} className="text-white dark:text-black" />
                )}
              </Button>

              <Button
                className="bg-[#DE3163] p-1 rounded-sm"
                onClick={() => setShowConfirmDialog(true)}
              >
                <Cancel01Icon size={16} className="text-white" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Diálogo de confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              ¿Qué deseas hacer con este entrenamiento?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Puedes completar el entrenamiento para guardarlo en tu historial o
              descartarlo completamente.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-2 py-4">
            <div className="text-center mb-2">
              <span className="text-xs text-muted-foreground">
                Tiempo transcurrido
              </span>
              <div className="text-xl font-bold">{formatTime(elapsedTime)}</div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="text-xs"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={completeWorkout}
              disabled={loading}
              className="sm:flex-1 text-xs"
            >
              {loading ? (
                <Icons.spinner className="h-4 w-4 animate-spin ml-2" />
              ) : null}
              Completar entrenamiento
            </Button>
            <Button
              size="sm"
              className="bg-[#DE3163] text-white hover:bg-[#DE3163]/80 text-xs"
              onClick={discardWorkout}
              disabled={loading}
            >
              Descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
