"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertCircleIcon } from "hugeicons-react";

type WorkoutProps = {
  id: string;
  name: string;
  description: string;
  days: { day: string; exercises: any[] }[];
};

export default function StartWorkout({ workout }: { workout: WorkoutProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [exercises, setExercises] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeWorkoutExists, setActiveWorkoutExists] = useState(false);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  const workoutData = workout;
  const days = workoutData.days || [];

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
          errorData.error || "Error al finalizar el entrenamiento activo"
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
          errorData.error || "Error al iniciar nuevo entrenamiento"
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
        <Button className="text-xs text-white bg-[#DE3163] hover:bg-[#DE3163]/90">
          Comenzar rutina
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-4 w-full">
        <DialogHeader>
          <DialogTitle>Selecciona el día de entrenamiento</DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            {workout.name}
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="flex justify-center py-4">
            <Icons.spinner className="h-6 w-6 animate-spin" />
          </div>
        ) : activeWorkoutExists ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Entrenamiento activo</AlertTitle>
            <AlertDescription>
              Ya tienes un entrenamiento en progreso. ¿Qué deseas hacer?
            </AlertDescription>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={continueActiveWorkout}
                className="text-xs"
                disabled={loading}
              >
                Continuar entrenamiento actual
              </Button>
              <Button
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
          </Alert>
        ) : (
          <>
            <div className="flex flex-col space-y-2">
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu entrenamiento" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day: any) => (
                    <SelectItem key={day.day} value={day.day}>
                      <div className="flex items-center">{day.day}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedDay && (
              <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-hide no-scrollbar">
                <div className="grid md:grid-cols-2 gap-6">
                  {days
                    .find((day: any) => day.day === selectedDay)
                    ?.exercises.map((exercise: any) => (
                      <div
                        key={exercise.id}
                        className="border rounded-lg shadow-sm"
                      >
                        <div className="flex items-center p-4 border-b">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">
                              {exercise.name}
                            </h4>
                            {exercise.notes && (
                              <p className="text-xs text-muted-foreground">
                                {exercise.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="p-4 grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Sets
                            </p>
                            <p className="font-semibold text-sm">
                              {exercise.sets}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Reps
                            </p>
                            <p className="font-semibold text-sm">
                              {exercise.reps || "Tiempo"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Descanso
                            </p>
                            <p className="font-semibold flex items-center justify-center gap-1 text-sm">
                              {exercise.restTime}s
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                onClick={handleStartWorkout}
                disabled={loading || !selectedDay}
                className="text-xs"
              >
                {loading ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
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
