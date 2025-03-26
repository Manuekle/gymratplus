"use client";

import { useState, useEffect } from "react";
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
import { ArrowLeft01Icon } from "hugeicons-react"; // Usando tus iconos
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import WorkoutTimerFloat from "@/components/workout-timer-float";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

// Componente de spinner (ajusta según tus componentes)
const Spinner = () => (
  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
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

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(
    null
  );
  const [notes, setNotes] = useState("");
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

  const [pendingUpdates, setPendingUpdates] = useState<
    Record<string, Partial<Set>>
  >({});
  const [debounceTimers, setDebounceTimers] = useState<
    Record<string, NodeJS.Timeout>
  >({});

  // Cargar la sesión de entrenamiento activa
  useEffect(() => {
    const fetchActiveWorkout = async () => {
      try {
        const response = await fetch("/api/workout-session/active");
        if (response.ok) {
          const data: WorkoutSession = await response.json();
          setWorkoutSession(data);
          setNotes(data.notes || "");
          setStartTime(new Date(data.createdAt));
        } else {
          // No hay sesión activa, redirigir
          toast.error("No hay entrenamiento activo", {
            description: "Serás redirigido para iniciar uno nuevo",
          });
          setTimeout(() => router.push("/dashboard/workout"), 2000);
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

  // Manejar el temporizador de descanso
  useEffect(() => {
    if (!restTimer.active) return;

    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev.timeLeft <= 1) {
          clearInterval(interval);
          return { ...prev, active: false, timeLeft: 0 };
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
      0
    );

    const completedSets = workoutSession.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((set) => set.completed).length,
      0
    );

    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  };

  // Iniciar temporizador de descanso
  const startRestTimer = (exerciseId: string, restTime: number) => {
    // Reproducir sonido al iniciar el descanso
    const audio = new Audio("/sounds/timer-start.mp3");
    audio.play().catch((e) => console.log("Error playing sound:", e));

    setRestTimer({
      active: true,
      timeLeft: restTime,
      exerciseId,
    });
  };

  // Formatear tiempo en formato mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Actualizar un set
  const updateSet = async (
    setId: string,
    data: Partial<Set>,
    immediate = false
  ) => {
    // Cancelar cualquier temporizador existente para este setId
    if (debounceTimers[setId]) {
      clearTimeout(debounceTimers[setId]);
    }

    // Actualizar inmediatamente la UI para una experiencia más fluida
    setWorkoutSession((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.exercises = updated.exercises.map((ex) => {
        const updatedEx = { ...ex };
        updatedEx.sets = updatedEx.sets.map((set) => {
          if (set.id === setId) {
            return { ...set, ...data };
          }
          return set;
        });
        return updatedEx;
      });
      return updated;
    });

    // Si es una actualización de "completed", enviar inmediatamente
    if (immediate || data.completed !== undefined) {
      try {
        // Combinar con actualizaciones pendientes
        const combinedData = {
          ...pendingUpdates[setId],
          ...data,
        };

        // Limpiar actualizaciones pendientes para este set
        setPendingUpdates((prev) => {
          const updated = { ...prev };
          delete updated[setId];
          return updated;
        });

        const response = await fetch("/api/workout-session/set", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setId, ...combinedData }),
        });

        // Si se marca como completado, iniciar temporizador de descanso
        if (response.ok && data.completed) {
          const exercise = workoutSession?.exercises.find((ex) =>
            ex.sets.some((set) => set.id === setId)
          );

          if (exercise) {
            const exerciseData = workoutSession!.exercises.find(
              (ex) => ex.id === exercise.id
            );
            const restTime = exerciseData?.exercise?.restTime || 60;
            startRestTimer(exercise.id, restTime);
          }
        }
      } catch (error) {
        console.error("Error al actualizar set:", error);
      }
      return;
    }

    // Almacenar la actualización pendiente
    setPendingUpdates((prev) => ({
      ...prev,
      [setId]: { ...(prev[setId] || {}), ...data },
    }));

    // Configurar un temporizador para enviar la actualización después de un retraso
    const timer = setTimeout(async () => {
      try {
        const dataToSend = pendingUpdates[setId];
        if (!dataToSend) return;

        // Limpiar actualizaciones pendientes para este set
        setPendingUpdates((prev) => {
          const updated = { ...prev };
          delete updated[setId];
          return updated;
        });

        await fetch("/api/workout-session/set", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setId, ...dataToSend }),
        });
      } catch (error) {
        console.error("Error al actualizar set:", error);
      }
    }, 1000); // Esperar 1 segundo después del último cambio

    setDebounceTimers((prev) => ({
      ...prev,
      [setId]: timer,
    }));
  };

  // Completar un ejercicio
  const completeExercise = async (exerciseSessionId: string) => {
    try {
      const response = await fetch("/api/workout-session/exercise", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseSessionId, completed: true }),
      });

      if (response.ok) {
        // Actualizar el estado local
        setWorkoutSession((prev) => {
          if (!prev) return prev;
          const updated = { ...prev };
          updated.exercises = updated.exercises.map((ex) => {
            if (ex.id === exerciseSessionId) {
              return {
                ...ex,
                completed: true,
                sets: ex.sets.map((set) => ({ ...set, completed: true })),
              };
            }
            return ex;
          });
          return updated;
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

  // Completar el entrenamiento
  const completeWorkout = async () => {
    if (!workoutSession) return;

    setSaving(true);
    try {
      // Guardar las notas
      await fetch("/api/workout-session/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutSessionId: workoutSession.id,
          notes,
        }),
      });

      toast.success("Notas guardadas", {
        description: "Las notas del entrenamiento han sido guardadas",
      });
      setSaving(false);
    } catch (error) {
      console.error("Error al guardar notas:", error);
      setSaving(false);
    }
  };

  useEffect(() => {
    // Limpiar todos los temporizadores al desmontar el componente
    return () => {
      Object.values(debounceTimers).forEach((timer) => clearTimeout(timer));
    };
  }, [debounceTimers]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Título y botón */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>

        {/* Grid de ejercicios */}
        <Card className="grid grid-cols-3 gap-4 px-4">
          {Array(9) // Generar 9 tarjetas de ejercicios (ajusta según sea necesario)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-4 space-y-4 col-span-3 md:col-span-1">
                {/* Título y botón */}
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>

                {/* Info de ejercicio */}
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />

                {/* Sets */}
                <div className="space-y-2">
                  {Array(3) // Para cada set dentro del ejercicio
                    .fill(0)
                    .map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6" /> {/* Número de set */}
                        <Skeleton className="h-8 w-16 rounded-md" />{" "}
                        {/* Peso */}
                        <Skeleton className="h-8 w-16 rounded-md" />{" "}
                        {/* Reps */}
                      </div>
                    ))}
                </div>
              </Card>
            ))}
        </Card>
      </div>
    );
  }

  if (!workoutSession) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold mb-4">No hay entrenamiento activo</h2>
        <Button onClick={() => router.push("/dashboard/workout")}>
          Iniciar un entrenamiento
        </Button>
      </div>
    );
  }

  console.log(workoutSession);

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
      <div className="pt-4">
        <div className="mb-4 flex justify-between w-full items-center">
          <Button
            variant="outline"
            className="text-xs"
            size="sm"
            onClick={() => router.push("/dashboard/workout")}
          >
            <ArrowLeft01Icon className="mr-2 h-4 w-4" /> Volver a la lista
          </Button>
        </div>
        <div className="border rounded-lg p-4 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex flex-col gap-1 w-full">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {workoutSession.notes}
              </CardTitle>
              <CardDescription className="text-xs">
                Entrenamiento en progreso
              </CardDescription>
            </div>
            <Button
              onClick={completeWorkout}
              disabled={saving}
              size="sm"
              className="text-xs"
            >
              {saving ? <Spinner /> : null}
              Guardar notas
            </Button>
          </div>

          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>
          <div className="pb-6">
            <h3 className="text-xs md:text-sm font-medium mb-2">Notas</h3>
            <Textarea
              className="w-full text-xs md:text-sm"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añade notas sobre tu entrenamiento..."
            />
          </div>
          {restTimer.active && (
            <div className="bg-foreground p-4 rounded-lg text-center mb-6 transform transition-all duration-300 ease-in">
              <h3 className="text-md  mb-2 text-white dark:text-black">
                Tiempo de descanso
              </h3>
              <div className="text-3xl font-bold text-white dark:text-black">
                {formatTime(restTimer.timeLeft)}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs "
                onClick={() =>
                  setRestTimer({ active: false, timeLeft: 0, exerciseId: null })
                }
              >
                Omitir
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {workoutSession.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className={`
              ${exercise.completed ? "opacity-70" : "border py-4 rounded-lg"}
              ${
                restTimer.exerciseId === exercise.id
                  ? "border-zinc-300 shadow-sm"
                  : "border py-4 rounded-lg"
              }
            `}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row justify-start md:justify-between items-start gap-4 md:gap-0 md:items-center">
                    <div>
                      <CardTitle className="text-md tracking-tight font-bold">
                        {exercise.exercise.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {exercise.exercise.muscleGroup} |{" "}
                        {exercise.exercise.equipment}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {exercise.completed ? (
                        <Badge
                          variant="outline"
                          className="text-white bg-green-700"
                        >
                          Completado
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => completeExercise(exercise.id)}
                        >
                          Marcar como completado
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 items-center font-medium text-sm">
                      {/* <div className="col-span-1"></div> */}
                      <div className="col-span-1">Set</div>
                      <div className="col-span-1">Peso (kg)</div>
                      <div className="col-span-1">Reps</div>
                      {/* <div className="col-span-3">Estado</div> */}
                    </div>

                    {exercise.sets.map((set) => (
                      <div
                        key={set.id}
                        className="grid grid-cols-3 gap-2 items-center"
                      >
                        {/* <div className="col-span-1">
                          <Checkbox
                            checked={set.completed}
                            onCheckedChange={(checked) =>
                              updateSet(
                                set.id,
                                { completed: checked === true },
                                true
                              )
                            }
                            disabled={exercise.completed}
                          />
                        </div> */}
                        <div className="col-span-1 text-sm">
                          {set.setNumber}
                          {set.isDropSet && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            placeholder="Peso"
                            min="0"
                            value={set.weight || ""}
                            onChange={(e) =>
                              updateSet(set.id, {
                                weight:
                                  Number.parseFloat(e.target.value) || null,
                              })
                            }
                            onBlur={() => {
                              if (pendingUpdates[set.id]) {
                                updateSet(set.id, {}, true); // Forzar envío al perder el foco
                              }
                            }}
                            disabled={exercise.completed || set.completed}
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            placeholder="Reps"
                            min="0"
                            value={set.reps || ""}
                            onChange={(e) =>
                              updateSet(set.id, {
                                reps: Number.parseInt(e.target.value) || null,
                              })
                            }
                            onBlur={() => {
                              if (pendingUpdates[set.id]) {
                                updateSet(set.id, {}, true); // Forzar envío al perder el foco
                              }
                            }}
                            disabled={exercise.completed || set.completed}
                            className="text-sm"
                          />
                        </div>
                        {/* <div className="col-span-3 text-sm">
                          {set.completed ? (
                            <Badge variant="outline" className="bg-green-50">
                              Completado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50">
                              Pendiente
                            </Badge>
                          )}
                          {set.isDropSet && (
                            <span className="ml-2 text-red-500 text-xs">
                              Drop Set
                            </span>
                          )}
                        </div> */}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
