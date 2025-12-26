"use client";

import { cn } from "@/lib/utils/utils";

interface CaloriesSummaryCardProps {
  data: {
    consumed: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    targets: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    date: string;
  };
}

export function CaloriesSummaryCard({ data }: CaloriesSummaryCardProps) {
  const { consumed, targets } = data;

  const caloriePercentage = (consumed.calories / targets.calories) * 100;
  const proteinPercentage = (consumed.protein / targets.protein) * 100;
  const carbsPercentage = (consumed.carbs / targets.carbs) * 100;
  const fatPercentage = (consumed.fat / targets.fat) * 100;

  const isOverCalories = caloriePercentage > 100;
  const remaining = targets.calories - consumed.calories;

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl tracking-[-0.04em] font-semibold">
          Calorías de Hoy
        </h3>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {new Date(data.date).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      {/* Main Calorie Display with Animation */}
      <div className="text-center space-y-1 animate-in zoom-in duration-300 delay-100">
        <div className="text-3xl md:text-4xl font-bold tabular-nums">
          {consumed.calories}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          de {targets.calories} kcal
        </div>
        <div
          className={cn(
            "text-xs font-medium transition-colors duration-300",
            isOverCalories
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400",
          )}
        >
          {isOverCalories
            ? `+${Math.abs(remaining)} kcal`
            : `${remaining} kcal restantes`}
        </div>
      </div>

      {/* Macros - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in slide-in-from-bottom-3 duration-500 delay-200">
        {/* Protein */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Proteína</span>
            <span className="font-medium tabular-nums">
              {consumed.protein.toFixed(0)}g
            </span>
          </div>
          <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-zinc-400 dark:text-zinc-500 text-right tabular-nums">
            {targets.protein.toFixed(0)}g
          </div>
        </div>

        {/* Carbs */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">
              Carbohidratos
            </span>
            <span className="font-medium tabular-nums">
              {consumed.carbs.toFixed(0)}g
            </span>
          </div>
          <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-700 ease-out delay-100"
              style={{ width: `${Math.min(carbsPercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-zinc-400 dark:text-zinc-500 text-right tabular-nums">
            {targets.carbs.toFixed(0)}g
          </div>
        </div>

        {/* Fat */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400">Grasas</span>
            <span className="font-medium tabular-nums">
              {consumed.fat.toFixed(0)}g
            </span>
          </div>
          <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-700 ease-out delay-200"
              style={{ width: `${Math.min(fatPercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-zinc-400 dark:text-zinc-500 text-right tabular-nums">
            {targets.fat.toFixed(0)}g
          </div>
        </div>
      </div>
    </div>
  );
}
