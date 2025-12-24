"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SteakIcon,
  RiceBowl01Icon,
  FrenchFries02Icon,
} from "@hugeicons/core-free-icons";

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
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl tracking-[-0.04em] font-semibold">
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
      <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/50 p-6 rounded-xl text-center">
        <div className="text-3xl font-bold tracking-tight">
          {consumed.calories}
        </div>
        <div className="text-xs text-zinc-500 mt-1">
          de {targets.calories} kcal
        </div>
        <div
          className={cn(
            "text-sm font-medium mt-3",
            isOverCalories
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400",
          )}
        >
          {isOverCalories
            ? `+${Math.abs(remaining)} kcal sobre el objetivo`
            : `${remaining} kcal restantes`}
        </div>
      </div>

      {/* Macros Grid */}
      <div>
        <h4 className="text-xl tracking-[-0.04em] font-semibold mb-3">
          Macronutrientes
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {/* Protein */}
          <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-zinc-900/20 border-zinc-200/50 dark:border-zinc-800/50">
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={SteakIcon}
                    className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Proteína</div>
                  <div className="text-sm font-semibold">
                    {consumed.protein.toFixed(0)}g
                  </div>
                  <div className="text-xs text-zinc-400">
                    / {targets.protein}g
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carbs */}
          <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-zinc-900/20 border-zinc-200/50 dark:border-zinc-800/50">
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={RiceBowl01Icon}
                    className="h-5 w-5 text-orange-600 dark:text-orange-400"
                  />
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Carbos</div>
                  <div className="text-sm font-semibold">
                    {consumed.carbs.toFixed(0)}g
                  </div>
                  <div className="text-xs text-zinc-400">
                    / {targets.carbs}g
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all duration-1000"
                    style={{ width: `${Math.min(carbsPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fat */}
          <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-zinc-900/20 border-zinc-200/50 dark:border-zinc-800/50">
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={FrenchFries02Icon}
                    className="h-5 w-5 text-amber-600 dark:text-amber-400"
                  />
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Grasas</div>
                  <div className="text-sm font-semibold">
                    {consumed.fat.toFixed(0)}g
                  </div>
                  <div className="text-xs text-zinc-400">/ {targets.fat}g</div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-1000"
                    style={{ width: `${Math.min(fatPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
