"use client";

import type React from "react";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/utils";
import { toast } from "sonner";
import { Icons } from "../icons";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface WorkoutExerciseProps {
  workoutId: string;
  isOpen: boolean;
  onClose: () => void;
  days: string[];
  existingExercises?: { id: string; exerciseId: string }[];
  onExerciseAdded?: () => void; // Callback para notificar al componente padre
  selectedDay?: string; // Día seleccionado por defecto
}

export default function WorkoutExercise({
  workoutId,
  isOpen,
  onClose,
  days,
  existingExercises = [],
  onExerciseAdded,
  selectedDay = "",
}: WorkoutExerciseProps) {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<string>(selectedDay);
  const [isLoading, setIsLoading] = useState(false);
  const [exerciseData, setExerciseData] = useState({
    sets: 0,
    reps: 0,
    restTime: 0,
  });

  // Actualizar el día seleccionado cuando cambia el prop
  useEffect(() => {
    if (selectedDay) {
      setCurrentDay(selectedDay);
    }
  }, [selectedDay]);

  const fetchExercises = useCallback(async () => {
    try {
      const res = await fetch("/api/exercises", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setExercises(data);
      } else {
        console.error("Error fetching exercises:", await res.text());
        toast.error("Error al cargar ejercicios");
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error("Error al cargar ejercicios");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchExercises();

      // Si no hay día seleccionado, establecer el primero por defecto
      if (!currentDay && days.length > 0 && days[0]) {
        setCurrentDay(days[0]);
      }
    }
  }, [isOpen, fetchExercises, days, currentDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedExercise) {
      toast.error("Selecciona un ejercicio", {
        description: "Debes seleccionar un ejercicio para continuar",
      });
      return;
    }
    if (!currentDay) {
      toast.error("Selecciona un día", {
        description: "Debes seleccionar un día para continuar",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Enviando datos:", {
        workoutId,
        exerciseId: selectedExercise,
        ...exerciseData,
        notes: currentDay,
      });

      const res = await fetch(`/api/workouts/${workoutId}/exercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          exerciseId: selectedExercise,
          ...exerciseData,
          notes: currentDay,
        }),
      });

      if (res.ok) {
        toast.success("Ejercicio agregado", {
          description:
            "El ejercicio se ha agregado correctamente al entrenamiento",
        });

        // Limpiar el formulario
        setExerciseData({
          sets: 0,
          reps: 0,
          restTime: 0,
        });
        setSelectedExercise(null);

        // Cerrar el diálogo
        onClose();

        // Notificar al componente padre para que actualice los datos
        if (onExerciseAdded) {
          onExerciseAdded();
        }

        // Forzar la revalidación de la ruta actual
        router.refresh();

        // Revalidar la ruta específica a través de la API
        try {
          await fetch(`/api/revalidate?path=/workouts/${workoutId}`, {
            method: "POST",
            headers: {
              "Cache-Control": "no-cache",
            },
          });
        } catch (error) {
          console.error("Error revalidating path:", error);
        }
      } else {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        toast.error(errorData.error || "Error al guardar el ejercicio", {
          description:
            errorData.details || "Verifica los datos e intenta nuevamente",
        });
      }
    } catch (error) {
      console.error("Error al guardar el ejercicio:", error);
      toast.error("Error al guardar el ejercicio", {
        description: "Ha ocurrido un error al intentar guardar el ejercicio",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isExerciseSelected = (exerciseId: string) => {
    return (
      existingExercises?.some((ex) => ex.exerciseId === exerciseId) ?? false
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto pt-8 xl:pt-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-heading">
            Añadir Nuevo Ejercicio
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Selecciona el día y el ejercicio que deseas agregar
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Selección de día */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Selecciona el día:</Label>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <Badge
                    key={day}
                    variant={currentDay === day ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-4 py-1 text-xs transition-colors",
                      currentDay === day &&
                        "bg-primary text-primary-foreground",
                    )}
                    onClick={() => setCurrentDay(day)}
                  >
                    {day}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Selección de ejercicio */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Selecciona el ejercicio:
              </Label>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(
                    exercises.reduce<Record<string, Exercise[]>>(
                      (acc, exercise) => {
                        // Ensure exercise has a muscleGroup before proceeding
                        if (exercise && exercise.muscleGroup) {
                          const muscleGroup = exercise.muscleGroup;
                          if (!acc[muscleGroup]) {
                            acc[muscleGroup] = [];
                          }
                          acc[muscleGroup].push(exercise);
                        }
                        return acc;
                      },
                      {},
                    ),
                  ).map(([muscleGroup, groupExercises]) => (
                    <div key={muscleGroup} className="space-y-2">
                      <h3 className="text-xs capitalize tracking-heading font-semibold  text-muted-foreground">
                        {muscleGroup}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {groupExercises.map((exercise) => {
                          const isSelected = selectedExercise === exercise.id;
                          const isDisabled = isExerciseSelected(exercise.id);

                          return (
                            <div
                              key={exercise.id}
                              onClick={() =>
                                !isDisabled && setSelectedExercise(exercise.id)
                              }
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer border border-border",
                                isSelected
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                  : "bg-background hover:bg-secondary",
                                isDisabled &&
                                  "bg-red-100 text-red-700 cursor-not-allowed opacity-50",
                              )}
                              title={
                                isDisabled
                                  ? "Este ejercicio ya está en el entrenamiento"
                                  : ""
                              }
                            >
                              <span>{exercise.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Detalles del ejercicio */}
            {selectedExercise && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sets" className="text-xs md:text-xs">
                      Series
                    </Label>
                    <Input
                      id="sets"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="1"
                      className="text-xs md:text-xs"
                      placeholder="Sets"
                      value={exerciseData.sets || ""}
                      onChange={(e) =>
                        setExerciseData({
                          ...exerciseData,
                          sets: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reps" className="text-xs md:text-xs">
                      Repeticiones
                    </Label>
                    <Input
                      id="reps"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="1"
                      className="text-xs md:text-xs"
                      placeholder="Reps"
                      value={exerciseData.reps || ""}
                      onChange={(e) =>
                        setExerciseData({
                          ...exerciseData,
                          reps: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restTime" className="text-xs md:text-xs">
                      Descanso (s)
                    </Label>
                    <Input
                      id="restTime"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      className="text-xs md:text-xs"
                      placeholder="Descanso"
                      value={exerciseData.restTime || ""}
                      onChange={(e) =>
                        setExerciseData({
                          ...exerciseData,
                          restTime: Number.parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              size="sm"
              type="submit"
              className="text-xs"
              disabled={!selectedExercise || !currentDay || isLoading}
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Guardando
                </>
              ) : (
                "Guardar ejercicio"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
