"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { useState } from "react";

interface FoodEntry {
  foodId: string;
  quantity: number;
  food: {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving: number;
    category: string;
  };
}

interface MealData {
  mealType: string;
  entries: FoodEntry[];
  calories: number;
}

interface NutritionPlanCardProps {
  plan: {
    calories: number;
    goal: string;
    mealsPerDay: number;
    dietaryType: string;
    description?: string;
    macros?: {
      protein: string;
      carbs: string;
      fat: string;
      description?: string;
    };
    meals?: {
      breakfast?: MealData;
      lunch?: MealData;
      dinner?: MealData;
      snacks?: MealData;
      [key: string]: MealData | undefined;
    };
  };
  onSave?: () => void;
  isSaved?: boolean;
}

const mealNames: { [key: string]: string } = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  dinner: "Cena",
  snacks: "Snacks",
};

export function NutritionPlanCard({
  plan,
  onSave,
  isSaved,
}: NutritionPlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const mealsArray = plan.meals
    ? Object.entries(plan.meals)
        .filter(([_, meal]) => meal !== undefined)
        .map(([key, meal]) => ({
          key,
          name: mealNames[key] || key,
          ...meal,
        }))
    : [];

  // Flatten all entries for display
  const allEntries = mealsArray.flatMap(
    (meal) =>
      meal.entries?.map((entry, idx) => ({
        ...entry,
        mealName: meal.name,
        isFirstInMeal: idx === 0,
        mealKey: meal.key,
      })) || [],
  );

  const displayedEntries = isExpanded ? allEntries : allEntries.slice(0, 6);
  const hasMore = allEntries.length > 6;

  return (
    <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl tracking-[-0.04em] font-semibold">
          Plan Nutricional
        </h3>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
          {plan.goal.replace("_", " ")}
        </span>
      </div>

      {/* Summary - Responsive Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs animate-in slide-in-from-bottom-3 duration-500 delay-100">
        <span className="capitalize px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
          {plan.dietaryType}
        </span>
        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
          {plan.calories} kcal/día
        </span>
        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
          {plan.mealsPerDay} comidas
        </span>
        {plan.macros && (
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
            P:{plan.macros.protein} C:{plan.macros.carbs} G:{plan.macros.fat}
          </span>
        )}
      </div>

      {/* Meals - Responsive Table */}
      {displayedEntries.length > 0 && (
        <div className="overflow-x-auto -mx-1 animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <table className="w-full text-xs min-w-[300px]">
            <thead>
              <tr className="text-left text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <th className="font-medium py-2 px-1">Comida</th>
                <th className="font-medium py-2 px-1">Alimento</th>
                <th className="font-medium py-2 px-1 text-right">kcal</th>
                <th className="font-medium py-2 px-1 text-right hidden sm:table-cell">
                  P
                </th>
                <th className="font-medium py-2 px-1 text-right hidden sm:table-cell">
                  C
                </th>
                <th className="font-medium py-2 px-1 text-right hidden sm:table-cell">
                  G
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedEntries.map((entry, index) => {
                const totalCals = Math.round(
                  (entry.food.calories * entry.quantity) / entry.food.serving,
                );
                const totalProtein = Math.round(
                  (entry.food.protein * entry.quantity) / entry.food.serving,
                );
                const totalCarbs = Math.round(
                  (entry.food.carbs * entry.quantity) / entry.food.serving,
                );
                const totalFat = Math.round(
                  (entry.food.fat * entry.quantity) / entry.food.serving,
                );

                return (
                  <tr
                    key={`${entry.mealKey}-${index}`}
                    className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors duration-150"
                    style={{
                      animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <td className="py-2 px-1 text-zinc-500 dark:text-zinc-400">
                      {entry.isFirstInMeal ? entry.mealName : ""}
                    </td>
                    <td className="py-2 px-1">
                      <div className="flex flex-col">
                        <span>{entry.food.name}</span>
                        <span className="text-zinc-400 dark:text-zinc-500 text-xs">
                          {entry.quantity}g
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-1 text-right font-medium tabular-nums">
                      {totalCals}
                    </td>
                    <td className="py-2 px-1 text-right hidden sm:table-cell text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {totalProtein}g
                    </td>
                    <td className="py-2 px-1 text-right hidden sm:table-cell text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {totalCarbs}g
                    </td>
                    <td className="py-2 px-1 text-right hidden sm:table-cell text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {totalFat}g
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Show More/Less Button */}
          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 py-2 transition-colors duration-200"
            >
              {isExpanded ? "Ver menos" : `Ver ${allEntries.length - 6} más...`}
            </button>
          )}
        </div>
      )}

      {/* Fallback */}
      {mealsArray.length === 0 && plan.description && (
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
            "text-xs",
            isSaved &&
              "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800",
          )}
        >
          {isSaved ? "Guardado" : "Guardar Plan"}
        </Button>
      </div>
    </div>
  );
}
