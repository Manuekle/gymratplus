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
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold">Calorías de Hoy</h3>
        <span className="text-xs text-zinc-500">
          {new Date(data.date).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      {/* Main Calorie Display */}
      <div className="text-center space-y-0.5">
        <div className="text-2xl font-bold">{consumed.calories}</div>
        <div className="text-xs text-zinc-500">de {targets.calories} kcal</div>
        <div
          className={cn(
            "text-xs font-medium",
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

      {/* Macros - Compact Inline */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span className="text-zinc-500">P:</span>
          <span className="font-medium">{consumed.protein.toFixed(0)}g</span>
          <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-zinc-500">C:</span>
          <span className="font-medium">{consumed.carbs.toFixed(0)}g</span>
          <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-orange-500"
              style={{ width: `${Math.min(carbsPercentage, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-zinc-500">G:</span>
          <span className="font-medium">{consumed.fat.toFixed(0)}g</span>
          <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-amber-500"
              style={{ width: `${Math.min(fatPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
