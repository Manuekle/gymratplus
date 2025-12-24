"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/utils";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
  muscleGroup: string;
}

interface WorkoutDay {
  day: string;
  exercises: Exercise[];
}

interface WorkoutPlanCardProps {
  plan: {
    focus: string;
    daysPerWeek: number;
    durationMinutes: number;
    difficulty: string;
    description?: string;
    days?: WorkoutDay[];
  };
  onSave?: () => void;
  isSaved?: boolean;
}

export function WorkoutPlanCard({
  plan,
  onSave,
  isSaved,
}: WorkoutPlanCardProps) {
  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-[-0.04em]">
          Plan de Entrenamiento
        </h3>
        <Badge variant="outline" className="capitalize text-xs">
          {plan.difficulty}
        </Badge>
      </div>

      {/* Summary */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 p-4 rounded-lg">
        <p className="text-sm font-medium capitalize mb-2">{plan.focus}</p>
        <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <span>{plan.daysPerWeek} días/semana</span>
          <span>•</span>
          <span>{plan.durationMinutes} min/sesión</span>
        </div>
      </div>

      {/* Workout Days Tabs */}
      {plan.days && plan.days.length > 0 && (
        <Tabs defaultValue="0" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-auto">
            {plan.days.map((day, index) => {
              // Extraer el grupo muscular del nombre del día (ej: "Día 1 - Piernas" -> "Piernas")
              const muscleGroup = day.day.includes(" - ")
                ? day.day.split(" - ")[1]
                : day.day;

              return (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  className="text-xs py-2"
                >
                  {muscleGroup}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {plan.days.map((workoutDay, dayIndex) => (
            <TabsContent key={dayIndex} value={dayIndex.toString()}>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 p-3 rounded-lg">
                <h5 className="text-xs font-semibold text-primary mb-2">
                  {workoutDay.day}
                </h5>
                <div className="space-y-1.5">
                  {workoutDay.exercises.map((exercise, exIndex) => (
                    <div
                      key={exercise.id || exIndex}
                      className="text-xs bg-white dark:bg-zinc-900 p-2 rounded"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium flex-1">
                          {exercise.name}
                        </span>
                        <span className="text-zinc-500 shrink-0">
                          {exercise.sets}×{exercise.reps}
                        </span>
                      </div>
                      {exercise.notes && (
                        <p className="text-zinc-500 mt-0.5 text-[11px]">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Fallback */}
      {(!plan.days || plan.days.length === 0) && plan.description && (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 p-3 rounded-lg">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {plan.description}
          </p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end py-4">
        <Button
          variant="default"
          size="default"
          onClick={onSave}
          disabled={isSaved}
          className={cn("text-xs", isSaved && "bg-green-800 text-white")}
        >
          {isSaved ? "Guardado" : "Guardar Plan"}
        </Button>
      </div>
    </div>
  );
}
