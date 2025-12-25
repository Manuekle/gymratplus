"use client";

import { Button } from "@/components/ui/button";
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
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Plan de Entrenamiento</h3>
        <span className="text-[11px] text-zinc-500 capitalize">
          {plan.difficulty}
        </span>
      </div>

      {/* Summary - Inline */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
        <span className="capitalize">{plan.focus}</span>
        <span>•</span>
        <span>{plan.daysPerWeek} días/semana</span>
        <span>•</span>
        <span>{plan.durationMinutes} min</span>
      </div>

      {/* Exercises - Responsive Table */}
      {plan.days && plan.days.length > 0 && (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-[11px] min-w-[280px]">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="font-medium py-1 px-1">Día</th>
                <th className="font-medium py-1 px-1">Ejercicio</th>
                <th className="font-medium py-1 px-1 text-right">Series×Reps</th>
              </tr>
            </thead>
            <tbody>
              {plan.days.map((workoutDay, dayIndex) =>
                workoutDay.exercises.map((exercise, exIndex) => {
                  const dayLabel = workoutDay.day.includes(" - ")
                    ? workoutDay.day.split(" - ")[1]
                    : workoutDay.day;

                  return (
                    <tr
                      key={`${dayIndex}-${exIndex}`}
                      className="border-t border-zinc-100 dark:border-zinc-800/50"
                    >
                      <td className="py-1 px-1 text-zinc-500 align-top">
                        {exIndex === 0 ? dayLabel : ""}
                      </td>
                      <td className="py-1 px-1">
                        {exercise.name}
                        {exercise.notes && (
                          <span className="text-zinc-400 ml-1 text-[10px]">
                            ({exercise.notes})
                          </span>
                        )}
                      </td>
                      <td className="py-1 px-1 text-right whitespace-nowrap">
                        {exercise.sets}×{exercise.reps}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Fallback */}
      {(!plan.days || plan.days.length === 0) && plan.description && (
        <p className="text-[11px] text-zinc-500">{plan.description}</p>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={isSaved}
          className={cn("text-xs h-7", isSaved && "bg-green-800 text-white")}
        >
          {isSaved ? "Guardado" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
