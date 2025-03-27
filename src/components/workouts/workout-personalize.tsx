// WorkoutPersonalize.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { ScrollArea } from "../ui/scroll-area";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from "hugeicons-react";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface DayExercise {
  exerciseId: string;
  day: string;
}

export function WorkoutPersonalize() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<DayExercise[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [name, setName] = useState("");
  const [currentDay, setCurrentDay] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch("/api/exercises");
        if (!response.ok) {
          throw new Error("Failed to fetch exercises");
        }
        const data = await response.json();
        setExercises(data);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };
    fetchExercises();
  }, []);

  const handleAddDay = () => {
    if (currentDay && !days.includes(currentDay)) {
      setDays([...days, currentDay]);
      setCurrentDay("");
    }
  };

  const handleDeleteDay = (dayToDelete: string) => {
    setDays(days.filter((day) => day !== dayToDelete));
    setSelectedExercises(
      selectedExercises.filter((ex) => ex.day !== dayToDelete)
    );
    if (currentDay === dayToDelete) {
      setCurrentDay("");
    }
  };

  const handleExerciseSelection = (exerciseId: string) => {
    if (!currentDay) {
      toast.error("Por favor, selecciona un día primero");
      return;
    }

    const existingIndex = selectedExercises.findIndex(
      (ex) => ex.exerciseId === exerciseId && ex.day === currentDay
    );

    if (existingIndex >= 0) {
      setSelectedExercises(
        selectedExercises.filter((_, index) => index !== existingIndex)
      );
    } else {
      setSelectedExercises([
        ...selectedExercises,
        { exerciseId, day: currentDay },
      ]);
    }
  };

  const handleNextDay = () => {
    const currentIndex = days.indexOf(currentDay);
    const nextIndex = (currentIndex + 1) % days.length;
    setCurrentDay(days[nextIndex]);
  };

  const handlePreviousDay = () => {
    const currentIndex = days.indexOf(currentDay);
    const previousIndex =
      currentIndex === 0 ? days.length - 1 : currentIndex - 1;
    setCurrentDay(days[previousIndex]);
  };

  const handleSubmit = async () => {
    if (days.length === 0) {
      toast.error("Por favor, agrega al menos un día");
      return;
    }

    if (selectedExercises.length === 0) {
      toast.error("Por favor, selecciona al menos un ejercicio");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/personalized-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseIds: selectedExercises,
          name: name || "Entrenamiento Personalizado",
          days,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || "Failed to create personalized workout"
        );
      }

      toast.success("Entrenamiento creado con éxito");
      window.location.reload();
    } catch (error) {
      console.error("Error creating personalized workout:", error);
      toast.error("Error al crear el entrenamiento");
    } finally {
      setSubmitting(false);
    }
  };

  const isExerciseSelected = (exerciseId: string) => {
    return selectedExercises.some(
      (ex) => ex.exerciseId === exerciseId && ex.day === currentDay
    );
  };

  const muscleGroups = [
    "all",
    ...new Set(exercises.map((exercise) => exercise.muscleGroup)),
  ];

  const filteredExercises =
    muscleFilter === "all"
      ? exercises
      : exercises.filter((exercise) => exercise.muscleGroup === muscleFilter);

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="text-xs" size="sm" variant="outline">
            Personalizar rutina
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="pt-2">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Crea tu rutina personalizada
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Sigue los pasos para crear tu plan de entrenamiento
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm" htmlFor="workout-name">
                  Nombre del entrenamiento
                </Label>
                <Input
                  className="text-xs md:text-sm"
                  id="workout-name"
                  placeholder="Ej: Mi rutina de hipertrofia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm" htmlFor="day-name">
                  Nombre del día
                </Label>
                <div className="flex gap-2">
                  <Input
                    className="text-xs md:text-sm"
                    id="day-name"
                    placeholder="Ej: Día de pecho"
                    value={currentDay}
                    onChange={(e) => setCurrentDay(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="text-xs"
                    onClick={handleAddDay}
                    disabled={!currentDay}
                  >
                    Agregar día
                  </Button>
                </div>
              </div>
              {days.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Días agregados:</Label>
                  <div className="flex flex-wrap gap-2">
                    {days.map((day) => (
                      <div
                        key={day}
                        className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                          currentDay === day
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary"
                        }`}
                      >
                        <span
                          onClick={() => setCurrentDay(day)}
                          className="cursor-pointer"
                        >
                          {day}
                        </span>
                        <button
                          onClick={() => handleDeleteDay(day)}
                          className="hover:text-destructive"
                        >
                          <Cancel01Icon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => setStep(2)}
                disabled={days.length === 0}
              >
                Siguiente
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs md:text-sm">
                    Selecciona ejercicios para: {currentDay}
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePreviousDay}
                      className="h-7 w-7 p-0"
                    >
                      <ArrowLeft01Icon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleNextDay}
                      className="h-7 w-7 p-0"
                    >
                      <ArrowRight01Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                  <SelectTrigger className="w-full text-xs md:text-sm capitalize">
                    <SelectValue placeholder="Filtrar por grupo muscular" />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((group) => (
                      <SelectItem
                        className="text-xs md:text-sm capitalize"
                        key={group}
                        value={group}
                      >
                        {group === "all" ? "Todos" : group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-[300px] mt-0 pr-4">
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(
                    filteredExercises.reduce((acc, exercise) => {
                      if (!acc[exercise.muscleGroup]) {
                        acc[exercise.muscleGroup] = [];
                      }
                      acc[exercise.muscleGroup].push(exercise);
                      return acc;
                    }, {} as Record<string, Exercise[]>)
                  ).map(([muscleGroup, groupExercises]) => (
                    <div key={muscleGroup} className="space-y-2">
                      <h3 className="text-sm capitalize tracking-tight font-bold text-muted-foreground">
                        {muscleGroup}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {groupExercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            onClick={() => handleExerciseSelection(exercise.id)}
                            className={`
                              flex items-center gap-1.5 px-3 py-1.5 
                              rounded-full text-xs font-medium 
                              transition-colors duration-200
                              cursor-pointer
                              border border-border
                              ${
                                isExerciseSelected(exercise.id)
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                  : "bg-background hover:bg-secondary"
                              }
                            `}
                          >
                            <span>{exercise.name}</span>
                            {isExerciseSelected(exercise.id) && (
                              <Cancel01Icon className="h-3 w-3 text-current" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => setStep(1)}
                >
                  Anterior
                </Button>
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={() => setStep(3)}
                  disabled={selectedExercises.length === 0}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label className="text-xs md:text-sm">
                Resumen del entrenamiento
              </Label>

              <Tabs defaultValue={days[0]} className="w-full">
                <TabsList className="flex flex-wrap h-auto gap-4">
                  {days.map((day) => (
                    <TabsTrigger
                      key={day}
                      value={day}
                      className="text-xs flex-1"
                    >
                      {day}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {days.map((day) => (
                  <TabsContent key={day} value={day}>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercises
                        .filter((ex) => ex.day === day)
                        .map((ex) => {
                          const exercise = exercises.find(
                            (e) => e.id === ex.exerciseId
                          );
                          return (
                            <div
                              key={ex.exerciseId}
                              className="flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs"
                            >
                              <span className="font-medium">
                                {exercise?.name}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="flex justify-between pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => setStep(2)}
                >
                  Anterior
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  className="text-xs"
                  disabled={submitting || selectedExercises.length === 0}
                >
                  {submitting ? (
                    <>
                      <Icons.spinner className="h-2 w-2 animate-spin" />
                      Generando
                    </>
                  ) : (
                    "Generar rutina"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
