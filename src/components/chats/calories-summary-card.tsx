"use client";

import { Card } from "@/components/ui/card";
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
    <Card className="overflow-hidden border-zinc-200/50 dark:border-zinc-800/50 bg-gradient-to-br from-zinc-50/50 to-white dark:from-zinc-950/50 dark:to-zinc-900/50 backdrop-blur-sm">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">
            Calorías de Hoy
          </h3>
          <span className="text-xs text-zinc-500">
            {new Date(data.date).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>

        {/* Main Calorie Display */}
        <div className="relative">
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              {/* Background circle */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="fill-none stroke-zinc-200 dark:stroke-zinc-800"
                  strokeWidth="12"
                />
                {/* Progress circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className={cn(
                    "fill-none transition-all duration-1000",
                    isOverCalories ? "stroke-red-500" : "stroke-green-500",
                  )}
                  strokeWidth="12"
                  strokeDasharray={`${Math.min(caloriePercentage, 100) * 4.4} 440`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tracking-tight">
                  {consumed.calories}
                </span>
                <span className="text-xs text-zinc-500">
                  de {targets.calories}
                </span>
              </div>
            </div>
          </div>

          {/* Remaining/Over */}
          <div className="text-center mt-4">
            <p
              className={cn(
                "text-sm font-medium",
                isOverCalories
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400",
              )}
            >
              {isOverCalories
                ? `+${Math.abs(remaining)} kcal sobre el objetivo`
                : `${remaining} kcal restantes`}
            </p>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="space-y-3 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
            Macronutrientes
          </h4>

          {/* Protein */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Proteína</span>
              <span className="text-zinc-500">
                {consumed.protein.toFixed(0)}g / {targets.protein}g
              </span>
            </div>
            <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-1000 rounded-full"
                style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Carbohidratos</span>
              <span className="text-zinc-500">
                {consumed.carbs.toFixed(0)}g / {targets.carbs}g
              </span>
            </div>
            <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-1000 rounded-full"
                style={{ width: `${Math.min(carbsPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Grasas</span>
              <span className="text-zinc-500">
                {consumed.fat.toFixed(0)}g / {targets.fat}g
              </span>
            </div>
            <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-1000 rounded-full"
                style={{ width: `${Math.min(fatPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
