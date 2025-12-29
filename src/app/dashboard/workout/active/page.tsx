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
import { ArrowLeft01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { calculate1RM, calculateVolume } from "@/lib/utils/1rm-calculator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Spinner = () => (
  <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full" />
);

interface WorkoutSession {
  id: string;
  notes: string;
  createdAt: string;
  workoutMode: "simple" | "intermediate" | "advanced";
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  exercise: {
    id: string; // Added id
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
  rir?: number | null;
  tempo?: string | null;
  completed: boolean;
  isDropSet?: boolean;
}

interface InputValue {
  weight?: string;
  reps?: string;
  rir?: string;
  tempo?: string;
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
  const [lastStats, setLastStats] = useState<Record<string, { weight: number; reps: number; setNumber: number }[]>>({});

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
            rir: set.rir?.toString() || "", // Initialize RIR
            tempo: set.tempo || "3-0-1", // Initialize Tempo
          };
        });
      });
      setInputValues(initialInputValues);

      // Fetch last session stats for comparison
      const exerciseIds = workoutSession.exercises.map(e => e.exercise.id).join(",");
      if (exerciseIds) {
        fetch(`/api/workout-session/last?exerciseIds=${exerciseIds}`)
          .then(res => res.json())
          .then(stats => {
            if (!stats.error) setLastStats(stats);
          })
          .catch(err => console.error("Error creating stats", err));
      }
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
    async (setId: string, exerciseId: string, data: Partial<Set>) => {
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
      field: "weight" | "reps" | "rir" | "tempo",
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
      const newRir = field === "rir" ? value : currentValues.rir || "";
      const newTempo = field === "tempo" ? value : currentValues.tempo || "";

      // 4. Crear el nuevo timer de debounce
      const newTimer = setTimeout(() => {
        // Lógica de conversión: convertir a null si está vacío, o a número
        const numericWeight =
          newWeight === "" ? null : parseFloat(newWeight) || null;
        const numericReps =
          newReps === "" ? null : parseInt(newReps, 10) || null;
        const numericRir = newRir === "" ? null : parseInt(newRir, 10);

        // Llamar a la API si hay al menos un valor válido (peso o repeticiones)
        // O si estamos actualizando RIR o Tempo
        if (
          numericWeight !== null ||
          numericReps !== null ||
          value === "" ||
          field === "rir" ||
          field === "tempo"
        ) {
          updateSet(setId, exerciseId, {
            weight: numericWeight,
            reps: numericReps,
            rir: numericRir,
            tempo: newTempo || null,
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
      <Card className="flex flex-col items-center justify-center min-h-[60vh] p-4 md:p-8 text-center gap-4">
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
      </Card>
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
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-2xl font-semibold tracking-heading">
                {workoutSession.notes || "Sesión de Entrenamiento"}
              </CardTitle>
              <Badge
                variant="outline"
                className={`text-xs ${workoutSession.workoutMode === "simple"
                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    : workoutSession.workoutMode === "intermediate"
                      ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                      : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                  }`}
              >
                {workoutSession.workoutMode === "simple"
                  ? "Principiante"
                  : workoutSession.workoutMode === "intermediate"
                    ? "Intermedio"
                    : "Avanzado"}
              </Badge>
            </div>
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
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg tracking-heading font-semibold">
                        {exercise.exercise.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {exercise.exercise.muscleGroup} |{" "}
                          {exercise.exercise.equipment}
                        </p>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                          Vol: {calculateVolume(exercise.sets as any)}kg
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
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
                        className="text-xs w-full"
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
                  {/* Conditional headers based on workout mode */}
                  {workoutSession.workoutMode === "simple" ? (
                    <div className="grid grid-cols-8 gap-2 items-center font-medium text-xs text-muted-foreground pb-1 border-b">
                      <div className="col-span-1">Set</div>
                      <div className="col-span-3">Peso (kg)</div>
                      <div className="col-span-2">Reps</div>
                      <div className="col-span-2 text-right">1RM</div>
                    </div>
                  ) : workoutSession.workoutMode === "intermediate" ? (
                    <div className="grid grid-cols-10 gap-2 items-center font-medium text-xs text-muted-foreground pb-1 border-b">
                      <div className="col-span-1">Set</div>
                      <div className="col-span-3">Peso (kg)</div>
                      <div className="col-span-2">Reps</div>
                      <div className="col-span-2">RIR</div>
                      <div className="col-span-2 text-right">1RM</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 gap-2 items-center font-medium text-xs text-muted-foreground pb-1 border-b">
                      <div className="col-span-1">Set</div>
                      <div className="col-span-2">Peso (kg)</div>
                      <div className="col-span-2">Reps</div>
                      <div className="col-span-2">RIR</div>
                      <div className="col-span-3">Tempo</div>
                      <div className="col-span-2 text-right">1RM</div>
                    </div>
                  )}

                  {exercise.sets.map((set) => {
                    const currentVal = inputValues[set.id] || {};
                    const currentWeight = currentVal.weight !== undefined ? parseFloat(currentVal.weight) : (set.weight || 0);
                    const currentReps = currentVal.reps !== undefined ? parseInt(currentVal.reps) : (set.reps || 0);
                    const est1RM = calculate1RM(currentWeight, currentReps);

                    // Overload Check
                    const lastSetStats = lastStats[exercise.exercise.id]?.find(s => s.setNumber === set.setNumber);
                    const isImproved = lastSetStats && (currentWeight > lastSetStats.weight || (currentWeight === lastSetStats.weight && currentReps > lastSetStats.reps));

                    return (
                      <div
                        key={set.id}
                        className={`grid gap-2 items-center ${workoutSession.workoutMode === "simple"
                          ? "grid-cols-8"
                          : workoutSession.workoutMode === "intermediate"
                            ? "grid-cols-10"
                            : "grid-cols-12"
                          }`}
                      >
                        <div className="col-span-1 text-xs font-medium flex items-center gap-1.5 direction-col">
                          <div className="flex items-center gap-1">
                            <span>{set.setNumber}</span>
                            {set.isDropSet && (
                              <span className="text-destructive font-bold">*</span>
                            )}
                          </div>
                          {lastSetStats && (
                            <div className="text-[9px] text-muted-foreground whitespace-nowrap hidden sm:block">
                              Last: {lastSetStats.weight}x{lastSetStats.reps}
                            </div>
                          )}
                          {isUpdating[set.id] && (
                            <div className="ml-1">
                              <Spinner />
                            </div>
                          )}
                        </div>

                        {/* Weight input - always shown */}
                        <div className={workoutSession.workoutMode === "simple" ? "col-span-3" : workoutSession.workoutMode === "intermediate" ? "col-span-3" : "col-span-2"}>
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
                            className={`text-xs h-9 px-2 ${isImproved ? 'border-green-500 ring-1 ring-green-500/20' : ''}`}
                          />
                        </div>

                        {/* Reps input - always shown */}
                        <div className="col-span-2">
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0"
                            value={inputValues[set.id]?.reps ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || /^\d*$/.test(value)) {
                                handleInputChange(
                                  set.id,
                                  exercise.id,
                                  "reps",
                                  value,
                                );
                              }
                            }}
                            disabled={exercise.completed || isUpdating[set.id]}
                            className="text-xs h-9 px-2"
                          />
                        </div>

                        {/* RIR - shown for intermediate and advanced */}
                        {(workoutSession.workoutMode === "intermediate" || workoutSession.workoutMode === "advanced") && (
                          <div className="col-span-2">
                            <Select
                              value={inputValues[set.id]?.rir ?? set.rir?.toString() ?? ""}
                              onValueChange={(val) => handleInputChange(set.id, exercise.id, "rir", val)}
                              disabled={exercise.completed || isUpdating[set.id]}
                            >
                              <SelectTrigger className="h-9 text-xs px-2">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                {[0, 1, 2, 3, 4].map((r) => (
                                  <SelectItem key={r} value={r.toString()} className="text-xs">
                                    {r === 0 ? "0 (Fallo)" : r === 4 ? "4+" : r}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Tempo - shown only for advanced */}
                        {workoutSession.workoutMode === "advanced" && (
                          <div className="col-span-3">
                            <Input
                              type="text"
                              placeholder="3-0-1"
                              className="text-xs h-9 px-2"
                              value={inputValues[set.id]?.tempo ?? ""}
                              onChange={(e) => {
                                handleInputChange(set.id, exercise.id, "tempo", e.target.value);
                              }}
                              disabled={exercise.completed || isUpdating[set.id]}
                            />
                          </div>
                        )}

                        {/* 1RM - always shown */}
                        <div className="col-span-2 text-right">
                          {est1RM > 0 && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-bold text-primary">{est1RM}</span>
                              {(set.rir !== undefined && set.rir !== null && set.rir >= 3) && (
                                <div className="flex items-center text-[10px] text-green-500 animate-pulse">
                                  <HugeiconsIcon icon={ArrowUp01Icon} className="h-3 w-3 mr-0.5" />
                                  <span>Subir</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
