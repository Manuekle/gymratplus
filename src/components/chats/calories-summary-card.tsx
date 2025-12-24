"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  SteakIcon,
  RiceBowl01Icon,
  FrenchFries02Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

  const remaining = targets.calories - consumed.calories;

  return (
    <Card className="w-full min-w-[300px] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold leading-none">Resumen Diario</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(data.date).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
              Meta
            </span>
            <span className="text-sm font-bold tabular-nums">{targets.calories}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Rings/Stats */}
        <div className="flex items-center gap-6">
          <div className="flex-1 space-y-1">
            <div className="text-4xl font-black tracking-tighter tabular-nums leading-none">
              {consumed.calories}
              <span className="text-sm font-medium text-muted-foreground ml-1">kcal</span>
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {remaining > 0
                ? `${remaining} kcal restantes`
                : `${Math.abs(remaining)} kcal extra`}
            </p>
          </div>
          <div className="w-24 h-2 bg-primary/10 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                remaining < 0 ? "bg-red-500" : "bg-primary"
              )}
              style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          {/* Protein */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-blue-500">
              <HugeiconsIcon icon={SteakIcon} className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wide">Prot</span>
            </div>
            <div className="h-1.5 w-full bg-blue-500/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold tabular-nums">{consumed.protein.toFixed(0)}g</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">/ {targets.protein}</span>
            </div>
          </div>

          {/* Carbs */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-orange-500">
              <HugeiconsIcon icon={RiceBowl01Icon} className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wide">Carb</span>
            </div>
            <div className="h-1.5 w-full bg-orange-500/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${Math.min(carbsPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold tabular-nums">{consumed.carbs.toFixed(0)}g</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">/ {targets.carbs}</span>
            </div>
          </div>

          {/* Fat */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-yellow-500">
              <HugeiconsIcon icon={FrenchFries02Icon} className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wide">Grasa</span>
            </div>
            <div className="h-1.5 w-full bg-yellow-500/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full transition-all"
                style={{ width: `${Math.min(fatPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold tabular-nums">{consumed.fat.toFixed(0)}g</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">/ {targets.fat}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

  );
}
