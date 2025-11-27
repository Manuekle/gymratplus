"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

const truncateText = (text: string, maxLength: number = 20): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";

type Exercise = {
  id: string;
  name: string;
  notes?: string;
  sets: number;
  reps: number | string;
  restTime: number;
};

type Day = {
  day: string;
  exercises: Exercise[];
};

type WorkoutProps = {
  id: string;
  name: string;
  description: string;
  days: Day[];
};

export default function StartWorkout({ workout }: { workout: WorkoutProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeWorkoutExists, setActiveWorkoutExists] = useState(false);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  const workoutData = workout;
  const days = useMemo(() => workoutData.days || [], [workoutData.days]);

  // Verificar si existe una sesión activa cuando se abre el diálogo
  const checkActiveWorkout = async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/workout-session/active");
      if (response.ok) {
        const data = await response.json();
        setActiveWorkoutExists(true);
        setActiveWorkoutId(data.id);
      } else {
        setActiveWorkoutExists(false);
        setActiveWorkoutId(null);
      }
    } catch (error) {
      console.error("Error al verificar entrenamiento activo:", error);
      setActiveWorkoutExists(false);
    } finally {
      setChecking(false);
    }
  };

  // Cuando se abre el diálogo, verificar si hay una sesión activa
  useEffect(() => {
    if (dialogOpen) {
      checkActiveWorkout();
    }
  }, [dialogOpen]);

  useEffect(() => {
    if (selectedDay) {
      const selectedExercises =
        days.find((d) => d.day === selectedDay)?.exercises || [];
      setExercises(selectedExercises);
    }
  }, [selectedDay, days]);

  const handleStartWorkout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/workout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: selectedDay, exercises }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar los ejercicios");
      }

      const data = await response.json();
      console.log("Entrenamiento iniciado:", data);

      // Cerrar el diálogo explícitamente
      setDialogOpen(false);

      toast.success("Entrenamiento iniciado", {
        description: "Redirigiendo a la página de entrenamiento activo...",
      });

      // Pequeño retraso antes de la redirección para asegurar que el diálogo se cierre
      setTimeout(() => {
        router.push("/dashboard/workout/active");
      }, 500);
    } catch (error) {
      console.error("Error al guardar ejercicios:", error);

      toast.error("Error", {
        description: "Error al iniciar entrenamiento",
      });
      setLoading(false);
    }
  };

  // Función para continuar con el entrenamiento activo
  const continueActiveWorkout = () => {
    // Cerrar el diálogo explícitamente
    setDialogOpen(false);

    toast.error("Continuando entrenamiento", {
      description: "Redirigiendo a tu entrenamiento activo...",
    });

    // Pequeño retraso antes de la redirección
    setTimeout(() => {
      router.push("/dashboard/workout/active");
    }, 500);
  };

  // Función para finalizar el entrenamiento activo y luego iniciar uno nuevo
  const finishAndStartNew = async () => {
    if (!activeWorkoutId) return;

    setLoading(true);
    try {
      // Completar el entrenamiento activo
      const completeResponse = await fetch("/api/workout-session/complete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutSessionId: activeWorkoutId,
          completed: true,
          notes: "Finalizado automáticamente para iniciar nuevo entrenamiento",
        }),
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(
          errorData.error || "Error al finalizar el entrenamiento activo",
        );
      }

      toast.error("Entrenamiento anterior finalizado", {
        description: "Iniciando nuevo entrenamiento...",
      });

      // Iniciar el nuevo entrenamiento
      const startResponse = await fetch("/api/workout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: selectedDay, exercises }),
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json();
        throw new Error(
          errorData.error || "Error al iniciar nuevo entrenamiento",
        );
      }

      // Cerrar el diálogo explícitamente
      setDialogOpen(false);

      // Pequeño retraso antes de la redirección
      setTimeout(() => {
        router.push("/dashboard/workout/active");
      }, 500);
    } catch (error) {
      console.error("Error:", error);

      toast.error("Error", {
        description: "Error al procesar la operación",
      });
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        // Si se cierra el diálogo, resetear estados
        if (!open) {
          setSelectedDay("");
          setLoading(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="default" variant="default" className="w-full">
          Comenzar rutina
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-4 w-full max-w-[95vw] sm:max-w-md overflow-y-auto overflow-x-hidden pt-8 xl:pt-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold  tracking-heading">
            Selecciona el día de entrenamiento
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Empieza tu rutina con el día de la semana que prefieras
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="flex justify-center py-4">
            <Icons.spinner className="h-6 w-6 animate-spin" />
          </div>
        ) : activeWorkoutExists ? (
          <div className="mb-4 w-full border rounded-lg p-4 flex flex-col">
            <span className="flex items-center gap-2 pb-1 text-destructive">
              <HugeiconsIcon icon={AlertCircleIcon} size={14} />
              <AlertTitle className="text-xs">Entrenamiento activo</AlertTitle>
            </span>
            <AlertDescription className="text-xs text-destructive">
              Ya tienes un entrenamiento en progreso. ¿Qué deseas hacer?
            </AlertDescription>
            <div className="flex flex-col md:flex-row gap-2 max-w-full pt-4">
              <Button
                variant="outline"
                size="default"
                onClick={continueActiveWorkout}
                className="text-xs"
                disabled={loading}
              >
                Continuar entrenamiento actual
              </Button>
              <Button
                size="default"
                variant="destructive"
                onClick={finishAndStartNew}
                className="text-xs"
                disabled={loading || !selectedDay}
              >
                {loading ? (
                  <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Finalizar actual e iniciar nuevo
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-background z-10 pb-2 pt-1">
              <div className="flex flex-wrap overflow-hidden pb-1 gap-1.5">
                {days.map((day: Day) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full border transition-all ${
                      selectedDay === day.day
                        ? "bg-primary/80 dark:bg-primary/20 border-primary/20 text-white dark:text-white font-medium"
                        : "border-border/50 text-black dark:text-white hover:bg-muted/50"
                    }`}
                  >
                    {day.day}
                  </button>
                ))}
              </div>
            </div>
            {selectedDay && (
              <div className="max-h-[400px] w-full overflow-y-auto scroll-hidden">
                <div className="space-y-1 pr-2">
                  {days
                    .find((day: Day) => day.day === selectedDay)
                    ?.exercises.map((exercise: Exercise) => (
                      <div
                        key={exercise.id}
                        className="flex flex-col border-b py-2 last:border-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium text-[13px] flex-1 truncate pr-2">
                            {truncateText(exercise.name)}
                          </h4>
                          <div className="flex items-center gap-3 text-xs flex-shrink-0">
                            <span className="text-muted-foreground whitespace-nowrap">
                              {exercise.sets}×{exercise.reps || "Tiempo"}
                            </span>
                            <span className="font-medium whitespace-nowrap">
                              ⏱️{exercise.restTime}s
                            </span>
                          </div>
                        </div>
                        {exercise.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {exercise.notes}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={handleStartWorkout}
                disabled={loading || !selectedDay}
                className="text-xs w-full"
                size="default"
              >
                {loading ? (
                  <span className="flex flex-row items-center gap-2">
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                    <h1>Iniciando</h1>
                  </span>
                ) : (
                  "Iniciar rutina"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
