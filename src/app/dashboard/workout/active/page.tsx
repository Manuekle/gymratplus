"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import WorkoutTimerFloat from "@/components/workout/workout-timer-float";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

const Spinner = () => (
  <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full" />
);

interface WorkoutSession {
  id: string;
  notes: string;
  createdAt: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  exercise: {
    name: string;
    muscleGroup: string;
    equipment: string;
    restTime?: number;
  };
  completed: boolean;
  sets: Set[];
}

interface Set {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  isDropSet?: boolean;
}

interface InputValue {
  weight?: string;
  reps?: string;
}

const DEBOUNCE_DELAY = 1000; // 1 segundo de retraso para el guardado

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(
    null,
  );
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [restTimer, setRestTimer] = useState<{
    active: boolean;
    timeLeft: number;
    exerciseId: string | null;
  }>({
    active: false,
    timeLeft: 0,
    exerciseId: null,
  });

  // Usamos ref para los timers de debounce para no recrear la función
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  // Solo se necesita el estado para indicar al usuario que se está actualizando
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [inputValues, setInputValues] = useState<Record<string, InputValue>>(
    {},
  );

  // Ref para almacenar peticiones fallidas que necesitan reintento
  const failedRequests = useRef<
    Array<{
      setId: string;
      exerciseId: string;
      data: Partial<Set>;
    }>
  >([]);

  // Cargar la sesión de entrenamiento activa
  useEffect(() => {
    const fetchActiveWorkout = async () => {
      try {
        const response = await fetch("/api/workout-session/active");
        if (response.ok) {
          const data: WorkoutSession = await response.json();
          setWorkoutSession(data);
          setStartTime(new Date(data.createdAt));
        } else {
          toast.error("No hay entrenamiento activo", {
            description: "Serás redirigido para iniciar uno nuevo",
          });
          // Utiliza router.replace para no dejar la página activa en el historial
          setTimeout(() => router.replace("/dashboard/workout"), 2000);
        }
      } catch (error) {
        console.error("Error al cargar el entrenamiento activo:", error);
        toast.error("Error", {
          description: "No se pudo cargar el entrenamiento activo",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActiveWorkout();
  }, [router]);

  // Inicializar valores de input cuando se carga el workout
  useEffect(() => {
    if (workoutSession) {
      const initialInputValues: Record<string, InputValue> = {};
      workoutSession.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          initialInputValues[set.id] = {
            weight: set.weight?.toString() || "",
            reps: set.reps?.toString() || "",
          };
        });
      });
      setInputValues(initialInputValues);
    }
  }, [workoutSession]);

  // Formatear tiempo en formato mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Envía la actualización del set a la API y maneja el estado local.
   * También inicia el temporizador de descanso si el set tiene datos.
   */
  const updateSet = useCallback(
    async (
      setId: string,
      exerciseId: string,
      data: Partial<Set>,
    ) => {
      setIsUpdating((prev) => ({ ...prev, [setId]: true }));

      try {
        const response = await fetch("/api/workout-session/set", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setId, ...data }),
        });

        // Si la respuesta es 401 (no autorizado), mostrar error
        if (response.status === 401) {
          failedRequests.current.push({ setId, exerciseId, data });
          toast.error("Error de autenticación", {
            description: "Por favor, recarga la página e intenta de nuevo.",
          });
          setIsUpdating((prev) => ({ ...prev, [setId]: false }));
          return;
        }

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        if (response.ok) {
          setWorkoutSession((prev) => {
            if (!prev) return prev;

            const newWorkoutSession = {
              ...prev,
              exercises: prev.exercises.map((ex) => ({
                ...ex,
                sets: ex.sets.map((set) =>
                  set.id === setId ? { ...set, ...data } : set,
                ),
              })),
            };

            // Lógica para marcar como completado si hay peso o reps
            const currentExercise = newWorkoutSession.exercises.find(
              (ex) => ex.id === exerciseId,
            );
            const currentSet = currentExercise?.sets.find(
              (set) => set.id === setId,
            );
            const setCompleted = !!(
              currentSet?.weight !== null &&
              currentSet?.weight !== undefined &&
              currentSet?.reps !== null &&
              currentSet?.reps !== undefined
            );

            // Si el set se ha completado, iniciar el temporizador de descanso
            if (setCompleted) {
              const restTime = currentExercise?.exercise.restTime;
              if (restTime && restTime > 0) {
                setRestTimer({
                  active: true,
                  timeLeft: restTime,
                  exerciseId: exerciseId,
                });
              }

              // Marcar el set como completado en el estado local después de guardar en DB
              newWorkoutSession.exercises = newWorkoutSession.exercises.map(
                (ex) => ({
                  ...ex,
                  sets: ex.sets.map((set) =>
                    set.id === setId ? { ...set, completed: true } : set,
                  ),
                }),
              );
            }
            return newWorkoutSession;
          });
        }
      } catch (error) {
        console.error("Error updating set:", error);
        toast.error("Error", {
          description: "No se pudo actualizar el set",
        });
      } finally {
        setIsUpdating((prev) => ({ ...prev, [setId]: false }));
      }
    },
    [],
  );

  // Reintentar peticiones fallidas cuando la página vuelve al foreground
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        // Reintentar peticiones fallidas
        if (failedRequests.current.length > 0) {
          const requestsToRetry = [...failedRequests.current];
          failedRequests.current = [];

          for (const request of requestsToRetry) {
            try {
              await updateSet(request.setId, request.exerciseId, request.data);
            } catch (error) {
              console.error("Error reintentando petición:", error);
              // Si falla de nuevo, volver a agregar a la cola
              failedRequests.current.push(request);
            }
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [updateSet]);

  // Limpiar temporizadores al desmontar
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Manejar el temporizador de descanso
  useEffect(() => {
    if (!restTimer.active) return;

    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev.timeLeft <= 1) {
          clearInterval(interval);
          // Opcional: mostrar un toast o sonido al terminar el descanso
          toast.info("¡Descanso terminado!", {
            description: "Es hora de tu siguiente set.",
            duration: 3000,
          });
          return { ...prev, active: false, timeLeft: 0, exerciseId: null };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.active]);

  // Calcular el progreso del entrenamiento
  const calculateProgress = () => {
    if (!workoutSession) return 0;

    const totalSets = workoutSession.exercises.reduce(
      (acc, ex) => acc + ex.sets.length,
      0,
    );

    const completedSets = workoutSession.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((set) => set.completed).length,
      0,
    );

    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  };

  /**
   * Maneja el cambio de input con debounce para llamadas a la API.
   */
  const handleInputChange = useCallback(
    (
      setId: string,
      exerciseId: string,
      field: "weight" | "reps",
      value: string,
    ) => {
      // 1. Limpiar el timer anterior si existe
      if (debounceTimers.current[setId]) {
        clearTimeout(debounceTimers.current[setId]);
      }

      // 2. Establecer el nuevo valor local inmediatamente
      setInputValues((prev) => ({
        ...prev,
        [setId]: {
          ...prev[setId],
          [field]: value,
        },
      }));

      // 3. Obtener el valor de peso y reps para el set, incluyendo el nuevo cambio
      const currentValues = inputValues[setId] || {};
      const newWeight = field === "weight" ? value : currentValues.weight || "";
      const newReps = field === "reps" ? value : currentValues.reps || "";

      // 4. Crear el nuevo timer de debounce
      const newTimer = setTimeout(() => {
        // Lógica de conversión: convertir a null si está vacío, o a número
        const numericWeight =
          newWeight === "" ? null : parseFloat(newWeight) || null;
        const numericReps =
          newReps === "" ? null : parseInt(newReps, 10) || null;

        // Llamar a la API si hay al menos un valor válido (peso o repeticiones)
        if (
          numericWeight !== null ||
          numericReps !== null ||
          value === "" // Esto permite guardar un campo como null si se borra
        ) {
          updateSet(setId, exerciseId, {
            weight: numericWeight,
            reps: numericReps,
          });
        }
      }, DEBOUNCE_DELAY);

      debounceTimers.current[setId] = newTimer;
    },
    [inputValues, updateSet], // Dependencia de inputValues para obtener los valores cruzados
  );

  // Completar un ejercicio
  const completeExercise = async (exerciseSessionId: string) => {
    try {
      const response = await fetch("/api/workout-session/exercise", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseSessionId, completed: true }),
      });

      if (response.ok) {
        setWorkoutSession((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            exercises: prev.exercises.map((ex) => {
              if (ex.id === exerciseSessionId) {
                return {
                  ...ex,
                  completed: true,
                  sets: ex.sets.map((set) => ({ ...set, completed: true })),
                };
              }
              return ex;
            }),
          };
        });

        toast.success("Ejercicio completado", {
          description: "Se ha marcado el ejercicio como completado",
        });
      }
    } catch (error) {
      console.error("Error al completar ejercicio:", error);
      toast.error("Error", {
        description: "No se pudo completar el ejercicio",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-32 md:w-48" />
        </div>

        <div className="border rounded-lg p-4 md:p-6 shadow-sm bg-card">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="space-y-2 w-full">
              <Skeleton className="h-7 md:h-8 w-48 md:w-64" />
              <Skeleton className="h-3 md:h-4 w-32 md:w-40" />
            </div>
          </div>

          <div className="mb-6">
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((exercise) => (
              <Card key={exercise} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-28 md:w-32" />
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground font-medium">
                    <div>Set</div>
                    <div>Peso (kg)</div>
                    <div>Reps</div>
                  </div>

                  {[1, 2, 3].map((set) => (
                    <div
                      key={set}
                      className="grid grid-cols-3 gap-2 items-center"
                    >
                      <Skeleton className="h-6 w-6" />
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!workoutSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 md:p-8 text-center gap-4">
        <h2 className="text-3xl font-semibold tracking-[-0.04em]">
          No hay entrenamiento activo
        </h2>
        <Button
          onClick={() => router.push("/dashboard/workout")}
          size="default"
          className="text-xs"
        >
          Iniciar un entrenamiento
        </Button>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div>
      {startTime && (
        <WorkoutTimerFloat
          workoutSessionId={workoutSession.id}
          startTime={startTime}
          onComplete={() => router.push("/dashboard/workout/history")}
        />
      )}
      <div className="mb-4 flex justify-between w-full items-center">
        <Button
          variant="outline"
          className="md:w-auto w-full text-xs"
          size="default"
          onClick={() => router.push("/dashboard/workout")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />{" "}
          Volver a la lista
        </Button>
      </div>

      <div className="border rounded-lg p-4 md:p-6 shadow-sm bg-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col gap-1 w-full">
            <CardTitle className="text-2xl font-semibold tracking-heading">
              {workoutSession.notes || "Sesión de Entrenamiento"}
            </CardTitle>
            <CardDescription className="text-xs">
              Entrenamiento en progreso
            </CardDescription>
          </div>
        </div>

        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        {restTimer.active && (
          <div className="bg-primary text-primary-foreground p-4 md:p-6 rounded-lg text-center mb-6 transform transition-all duration-300 ease-in shadow-md">
            <h3 className="text-xs md:text-xs font-medium mb-2">
              Tiempo de descanso
            </h3>
            <div className="text-2xl md:text-3xl font-semibold mb-3">
              {formatTime(restTimer.timeLeft)}
            </div>
            <Button
              variant="secondary"
              size="default"
              className="text-xs"
              onClick={() =>
                setRestTimer({ active: false, timeLeft: 0, exerciseId: null })
              }
            >
              Omitir
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {workoutSession.exercises.map((exercise) => (
            <Card
              key={exercise.id}
              className={`${exercise.completed ? "opacity-70" : ""} ${restTimer.exerciseId === exercise.id
                ? "border border-primary shadow-md"
                : ""
                }`}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3">
                  <div>
                    <CardTitle className="text-lg tracking-heading font-semibold">
                      {exercise.exercise.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {exercise.exercise.muscleGroup} |{" "}
                      {exercise.exercise.equipment}
                    </p>
                  </div>
                  <div className="flex items-center justify-end">
                    {exercise.completed ? (
                      <Badge
                        variant="outline"
                        className="bg-green-600 text-white border-green-600 hover:bg-green-600/90"
                      >
                        Completado
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="default"
                        className="text-xs w-full md:w-auto"
                        onClick={() => completeExercise(exercise.id)}
                      >
                        Marcar como completado
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-0">
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 items-center font-medium text-xs text-muted-foreground pb-1 border-b">
                    <div className="col-span-1">Set</div>
                    <div className="col-span-1">Peso (kg)</div>
                    <div className="col-span-1">Reps</div>
                  </div>

                  {exercise.sets.map((set) => (
                    <div
                      key={set.id}
                      className="grid grid-cols-3 gap-2 items-center"
                    >
                      <div className="col-span-1 text-xs font-medium flex items-center gap-1.5">
                        <span>{set.setNumber}</span>
                        {set.isDropSet && (
                          <span className="text-destructive font-bold">*</span>
                        )}
                        {isUpdating[set.id] && (
                          <div className="ml-1">
                            <Spinner />
                          </div>
                        )}
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*[.,]?[0-9]*"
                          placeholder="0"
                          value={inputValues[set.id]?.weight ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d*[.,]?\d*$/.test(value)) {
                              handleInputChange(
                                set.id,
                                exercise.id,
                                "weight",
                                value.replace(",", "."),
                              );
                            }
                          }}
                          disabled={exercise.completed || isUpdating[set.id]}
                          className="text-xs h-9"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="0"
                          value={inputValues[set.id]?.reps ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d+$/.test(value)) {
                              handleInputChange(
                                set.id,
                                exercise.id,
                                "reps",
                                value,
                              );
                            }
                          }}
                          disabled={exercise.completed || isUpdating[set.id]}
                          className="text-xs h-9"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
