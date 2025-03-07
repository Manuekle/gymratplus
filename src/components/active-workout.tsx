"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft01Icon } from "hugeicons-react"; // Usando tus iconos
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Componente de spinner (ajusta según tus componentes)
const Spinner = () => (
  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
);

export default function ActiveWorkout() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workoutSession, setWorkoutSession] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState<{
    active: boolean;
    timeLeft: number;
    exerciseId: string | null;
  }>({
    active: false,
    timeLeft: 0,
    exerciseId: null,
  });

  const [pendingUpdates, setPendingUpdates] = useState<Record<string, any>>({});
  const [debounceTimers, setDebounceTimers] = useState<
    Record<string, NodeJS.Timeout>
  >({});

  // Cargar la sesión de entrenamiento activa
  useEffect(() => {
    const fetchActiveWorkout = async () => {
      try {
        const response = await fetch("/api/workout-session/active");
        if (response.ok) {
          const data = await response.json();
          setWorkoutSession(data);
          setNotes(data.notes || "");
          setStartTime(new Date(data.createdAt));
        } else {
          // No hay sesión activa, redirigir
          setTimeout(() => router.push("/dashboard/workout"), 2000);
        }
      } catch (error) {
        console.error("Error al cargar el entrenamiento activo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveWorkout();
  }, [router]);

  // Actualizar el tiempo transcurrido
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

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
      (acc: number, ex: any) => acc + ex.sets.length,
      0
    );

    const completedSets = workoutSession.exercises.reduce(
      (acc: number, ex: any) =>
        acc + ex.sets.filter((set: any) => set.completed).length,
      0
    );

    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  };

  // Iniciar temporizador de descanso
  const startRestTimer = (exerciseId: string, restTime: number) => {
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
  const updateSet = async (setId: string, data: any, immediate = false) => {
    // Cancelar cualquier temporizador existente para este setId
    if (debounceTimers[setId]) {
      clearTimeout(debounceTimers[setId]);
    }

    // Actualizar inmediatamente la UI para una experiencia más fluida
    setWorkoutSession((prev: any) => {
      const updated = { ...prev };
      updated.exercises = updated.exercises.map((ex: any) => {
        const updatedEx = { ...ex };
        updatedEx.sets = updatedEx.sets.map((set: any) => {
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
          const exercise = workoutSession.exercises.find((ex: any) =>
            ex.sets.some((set: any) => set.id === setId)
          );

          if (exercise) {
            const exerciseData = workoutSession.exercises.find(
              (ex: any) => ex.id === exercise.id
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
        setWorkoutSession((prev: any) => {
          const updated = { ...prev };
          updated.exercises = updated.exercises.map((ex: any) => {
            if (ex.id === exerciseSessionId) {
              return {
                ...ex,
                completed: true,
                sets: ex.sets.map((set: any) => ({ ...set, completed: true })),
              };
            }
            return ex;
          });
          return updated;
        });
      }
    } catch (error) {
      console.error("Error al completar ejercicio:", error);
    }
  };

  // Completar el entrenamiento
  const completeWorkout = async () => {
    if (!workoutSession || !startTime) return;

    setSaving(true);
    try {
      // Calcular duración en minutos
      const duration = Math.round(elapsedTime / 60);

      const response = await fetch("/api/workout-session/complete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutSessionId: workoutSession.id,
          duration,
          notes,
        }),
      });

      if (response.ok) {
        router.push("/dashboard/workout/history");
      }
    } catch (error) {
      console.error("Error al completar entrenamiento:", error);
    } finally {
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
      <div className="flex justify-center items-center h-64">
        <Spinner />
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

  const progress = calculateProgress();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/workout")}
              className="text-xs"
            >
              <ArrowLeft01Icon className="h-4 w-4 mr-2" /> Volver
            </Button>
          </div>
          <h1 className="text-2xl font-bold">Entrenamiento en progreso</h1>
          <p className="text-muted-foreground">
            Tiempo: {formatTime(elapsedTime)} | Progreso: {progress}%
          </p>
        </div>
        <Button onClick={completeWorkout} disabled={saving}>
          {saving ? <Spinner /> : null}
          Finalizar entrenamiento
        </Button>
      </div>

      <Progress value={progress} className="h-2" />

      {restTimer.active && (
        <div className="bg-primary/10 p-4 rounded-lg text-center">
          <h3 className="text-lg font-medium mb-2">Tiempo de descanso</h3>
          <div className="text-3xl font-bold">
            {formatTime(restTimer.timeLeft)}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() =>
              setRestTimer({ active: false, timeLeft: 0, exerciseId: null })
            }
          >
            Omitir
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {workoutSession.exercises.map((exercise: any) => (
          <Card
            key={exercise.id}
            className={`
              ${exercise.completed ? "opacity-70" : ""}
              ${restTimer.exerciseId === exercise.id ? "border-primary" : ""}
            `}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    {exercise.exercise.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {exercise.exercise.muscleGroup} |{" "}
                    {exercise.exercise.equipment}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {exercise.completed ? (
                    <Badge variant="outline" className="bg-green-100">
                      Completado
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => completeExercise(exercise.id)}
                    >
                      Marcar como completado
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 items-center font-medium text-sm">
                  <div className="col-span-1"></div>
                  <div className="col-span-2">Set</div>
                  <div className="col-span-3">Peso (kg)</div>
                  <div className="col-span-3">Reps</div>
                  <div className="col-span-3">Estado</div>
                </div>

                {exercise.sets.map((set: any) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-1">
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
                    </div>
                    <div className="col-span-2 text-sm">
                      {set.setNumber}
                      {set.isDropSet && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Peso"
                        value={set.weight || ""}
                        onChange={(e) =>
                          updateSet(set.id, {
                            weight: Number.parseFloat(e.target.value) || null,
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
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Reps"
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
                    <div className="col-span-3 text-sm">
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-medium mb-2">Notas</h3>
        <Textarea
          className="w-full"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Añade notas sobre tu entrenamiento..."
        />
      </div>
    </div>
  );
}
