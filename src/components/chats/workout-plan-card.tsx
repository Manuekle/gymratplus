"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { useState } from "react";

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
  const [isExpanded, setIsExpanded] = useState(false);

  // Show first 5 exercises by default
  const allExercises = plan.days?.flatMap((day, dayIndex) =>
    day.exercises.map((ex, exIndex) => ({
      ...ex,
      dayLabel: day.day.includes(" - ") ? day.day.split(" - ")[1] : day.day,
      isFirstInDay: exIndex === 0,
      dayIndex,
      exIndex,
    }))
  ) || [];

  const displayedExercises = isExpanded ? allExercises : allExercises.slice(0, 5);
  const hasMore = allExercises.length > 5;

  return (
    <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold">Plan de Entrenamiento</h3>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
          {plan.difficulty}
        </span>
      </div>

      {/* Summary - Responsive Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs animate-in slide-in-from-bottom-3 duration-500 delay-100">
        <span className="capitalize px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
          {plan.focus}
        </span>
        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
          {plan.daysPerWeek} días/semana
        </span>
        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
          {plan.durationMinutes} min
        </span>
      </div>

      {/* Exercises - Responsive Table */}
      {displayedExercises.length > 0 && (
        <div className="overflow-x-auto -mx-1 animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <table className="w-full text-xs min-w-[280px]">
            <thead>
              <tr className="text-left text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <th className="font-medium py-2 px-1">Día</th>
                <th className="font-medium py-2 px-1">Ejercicio</th>
                <th className="font-medium py-2 px-1 text-right whitespace-nowrap">
                  Series×Reps
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedExercises.map((exercise, index) => (
                <tr
                  key={`${exercise.dayIndex}-${exercise.exIndex}`}
                  className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors duration-150"
                  style={{
                    animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <td className="py-2 px-1 text-zinc-500 dark:text-zinc-400 align-top">
                    {exercise.isFirstInDay ? exercise.dayLabel : ""}
                  </td>
                  <td className="py-2 px-1">
                    <div className="flex flex-col">
                      <span>{exercise.name}</span>
                      {exercise.notes && (
                        <span className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">
                          {exercise.notes}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-1 text-right whitespace-nowrap font-medium tabular-nums">
                    {exercise.sets}×{exercise.reps}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Show More/Less Button */}
          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 py-2 transition-colors duration-200"
            >
              {isExpanded ? "Ver menos" : `Ver ${allExercises.length - 5} más...`}
            </button>
          )}
        </div>
      )}

      {/* Fallback */}
      {(!plan.days || plan.days.length === 0) && plan.description && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 animate-in fade-in duration-300">
          {plan.description}
        </p>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-1 animate-in slide-in-from-bottom-5 duration-500 delay-300">
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={isSaved}
          className={cn(
            "text-xs h-8 transition-all duration-200 hover:scale-105 active:scale-95",
            isSaved && "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800",
          )}
        >
          {isSaved ? "✓ Guardado" : "Guardar Plan"}
        </Button>
      </div>
    </div>
  );
}
