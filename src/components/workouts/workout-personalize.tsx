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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useWorkouts } from "@/hooks/use-workouts";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface DayExercise {
  exerciseId: string;
  day: string;
  sets: number;
  reps: number;
  restTime: number;
}

type WorkoutType =
  | "hipertrofia"
  | "fuerza"
  | "perdida_grasa"
  | "resistencia"
  | "movilidad"
  | "estandar"
  | "custom";

const workoutConfigs: Record<
  Exclude<WorkoutType, "custom">,
  {
    sets: number;
    reps: number;
    restTime: number;
  }
> = {
  estandar: {
    sets: 3,
    reps: 10,
    restTime: 180,
  },
  hipertrofia: {
    sets: 4,
    reps: 12,
    restTime: 90,
  },
  fuerza: {
    sets: 5,
    reps: 5,
    restTime: 180,
  },
  perdida_grasa: {
    sets: 3,
    reps: 15,
    restTime: 45,
  },
  resistencia: {
    sets: 3,
    reps: 20,
    restTime: 30,
  },
  movilidad: {
    sets: 2,
    reps: 15,
    restTime: 60,
  },
};

export function WorkoutPersonalize() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<DayExercise[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [name, setName] = useState("");
  const [currentDay, setCurrentDay] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [workoutType, setWorkoutType] = useState<WorkoutType>("estandar");
  const [customSets, setCustomSets] = useState<number>(3);
  const [customReps, setCustomReps] = useState<number>(10);
  const [customRestTime, setCustomRestTime] = useState<number>(180);
  const [open, setOpen] = useState(false);
  const { refreshWorkouts } = useWorkouts();

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
      selectedExercises.filter((ex) => ex.day !== dayToDelete),
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
      (ex) => ex.exerciseId === exerciseId && ex.day === currentDay,
    );

    if (existingIndex >= 0) {
      setSelectedExercises(
        selectedExercises.filter((_, index) => index !== existingIndex),
      );
    } else {
      const config =
        workoutType === "custom"
          ? {
              sets: customSets,
              reps: customReps,
              restTime: customRestTime,
            }
          : workoutConfigs[workoutType];

      setSelectedExercises([
        ...selectedExercises,
        {
          exerciseId,
          day: currentDay,
          sets: config.sets,
          reps: config.reps,
          restTime: config.restTime,
        },
      ]);
    }
  };

  const handleNextDay = () => {
    const currentIndex = days.indexOf(currentDay);
    const nextIndex = (currentIndex + 1) % days.length;
    const nextDay = days[nextIndex];
    if (nextDay) {
      setCurrentDay(nextDay);
    }
  };

  const handlePreviousDay = () => {
    const currentIndex = days.indexOf(currentDay);
    const previousIndex =
      currentIndex === 0 ? days.length - 1 : currentIndex - 1;
    const previousDay = days[previousIndex];
    if (previousDay) {
      setCurrentDay(previousDay);
    }
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
          workoutType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            errorData.details ||
            "Failed to create personalized workout",
        );
      }

      toast.success("Entrenamiento creado con éxito");
      await refreshWorkouts();
      setOpen(false);
      setStep(1);
      setName("");
      setCurrentDay("");
      setDays([]);
      setSelectedExercises([]);
      setWorkoutType("estandar");
      setCustomSets(3);
      setCustomReps(10);
      setCustomRestTime(180);
    } catch (error) {
      console.error("Error creating personalized workout:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al crear el entrenamiento";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const isExerciseSelected = (exerciseId: string) => {
    return selectedExercises.some(
      (ex) => ex.exerciseId === exerciseId && ex.day === currentDay,
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="text-xs" size="default" variant="outline">
            Personalizar rutina
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm max-h-[900px] overflow-y-auto pt-8 xl:pt-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader className="">
            <DialogTitle className="text-2xl font-semibold  tracking-heading">
              Crea tu rutina personalizada
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Sigue los pasos para crear tu plan de entrenamiento
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-xs" htmlFor="workout-name">
                  Nombre del entrenamiento
                </Label>
                <Input
                  className="text-xs md:text-xs"
                  id="workout-name"
                  placeholder="Ej: Mi rutina de hipertrofia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-xs" htmlFor="workout-type">
                  Tipo de entrenamiento
                </Label>
                <Select
                  value={workoutType}
                  onValueChange={(value: WorkoutType) => setWorkoutType(value)}
                >
                  <SelectTrigger className="w-full text-xs md:text-xs">
                    <SelectValue placeholder="Selecciona el tipo de entrenamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="text-xs md:text-xs" value="estandar">
                      Estándar (3x10 - 3min descanso)
                    </SelectItem>
                    <SelectItem
                      className="text-xs md:text-xs"
                      value="hipertrofia"
                    >
                      Hipertrofia (6-12 repeticiones por serie)
                    </SelectItem>
                    <SelectItem className="text-xs md:text-xs" value="fuerza">
                      Fuerza (1-6 repeticiones por serie)
                    </SelectItem>
                    <SelectItem
                      className="text-xs md:text-xs"
                      value="perdida_grasa"
                    >
                      Pérdida de grasa (Rutinas con alta intensidad)
                    </SelectItem>
                    <SelectItem
                      className="text-xs md:text-xs"
                      value="resistencia"
                    >
                      Resistencia (más de 12 repeticiones)
                    </SelectItem>
                    <SelectItem
                      className="text-xs md:text-xs"
                      value="movilidad"
                    >
                      Movilidad y flexibilidad
                    </SelectItem>
                    <SelectItem className="text-xs md:text-xs" value="custom">
                      Personalizado (configura series, reps y tiempo)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {workoutType === "custom" && (
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Series"
                    className="text-xs"
                    value={customSets}
                    onChange={(e) =>
                      setCustomSets(parseInt(e.target.value) || 1)
                    }
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Reps"
                    className="text-xs"
                    value={customReps}
                    onChange={(e) =>
                      setCustomReps(parseInt(e.target.value) || 1)
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    placeholder="Descanso (s)"
                    className="text-xs"
                    value={customRestTime}
                    onChange={(e) =>
                      setCustomRestTime(parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs md:text-xs" htmlFor="day-name">
                  Nombre del día
                </Label>
                <div className="flex gap-2">
                  <Input
                    className="text-xs md:text-xs"
                    id="day-name"
                    placeholder="Ej: Día de pecho"
                    value={currentDay}
                    onChange={(e) => setCurrentDay(e.target.value)}
                  />
                  <Button
                    size="default"
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
                  <Label className="text-xs md:text-xs">Días agregados:</Label>
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
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            className="h-3 w-3"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button
                size="default"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  if (days.length > 0 && !currentDay) {
                    setCurrentDay(days[0] ?? "");
                  }
                  setStep(2);
                }}
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
                  <Label className="text-xs md:text-xs">
                    Selecciona ejercicios para: {currentDay}
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      size="default"
                      variant="outline"
                      onClick={handlePreviousDay}
                      className="h-7 w-7 p-0"
                    >
                      <HugeiconsIcon
                        icon={ArrowLeft01Icon}
                        className="h-4 w-4"
                      />
                    </Button>
                    <Button
                      size="default"
                      variant="outline"
                      onClick={handleNextDay}
                      className="h-7 w-7 p-0"
                    >
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="h-4 w-4"
                      />
                    </Button>
                  </div>
                </div>
                <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                  <SelectTrigger className="w-full text-xs md:text-xs capitalize">
                    <SelectValue placeholder="Filtrar por grupo muscular" />
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((group) => (
                      <SelectItem
                        className="text-xs md:text-xs capitalize"
                        key={group}
                        value={group}
                      >
                        {group === "all" ? "Todos" : group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <ScrollArea className="h-[300px] mt-0 pr-4">
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(
                      (filteredExercises as Exercise[]).reduce<
                        Record<string, Exercise[]>
                      >((acc, exercise) => {
                        const muscleGroup = exercise.muscleGroup || "other";
                        if (!acc[muscleGroup]) {
                          acc[muscleGroup] = [];
                        }
                        acc[muscleGroup].push(exercise);
                        return acc;
                      }, {}),
                    ).map(([muscleGroup, groupExercises]) => (
                      <div key={muscleGroup} className="space-y-2">
                        <h3 className="text-xs capitalize tracking-heading font-semibold  text-muted-foreground">
                          {muscleGroup}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {groupExercises.map((exercise) => (
                            <div
                              key={exercise.id}
                              onClick={() =>
                                handleExerciseSelection(exercise.id)
                              }
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
                                <HugeiconsIcon
                                  icon={Cancel01Icon}
                                  className="h-3 w-3 text-current"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex justify-between">
                <Button
                  size="default"
                  variant="outline"
                  className="text-xs"
                  onClick={() => setStep(1)}
                >
                  Anterior
                </Button>
                <Button
                  size="default"
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
              <Label className="text-xs md:text-xs">
                Resumen del entrenamiento
              </Label>

              <Tabs defaultValue={days[0] || ""} className="w-full">
                <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:flex md:flex-wrap h-auto gap-2 sm:gap-4">
                  {days.map((day) => (
                    <TabsTrigger
                      key={day}
                      value={day}
                      className="text-xs md:flex-1"
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
                            (e) => e.id === ex.exerciseId,
                          );
                          return (
                            <div
                              key={ex.exerciseId}
                              className="flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs"
                            >
                              <span className="font-medium">
                                {exercise?.name} ({ex.sets}x{ex.reps} -{" "}
                                {ex.restTime}s)
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
                  size="default"
                  variant="outline"
                  className="text-xs"
                  onClick={() => setStep(2)}
                >
                  Anterior
                </Button>
                <Button
                  size="default"
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
