"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";

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
  const mealsArray = plan.meals
    ? Object.entries(plan.meals)
      .filter(([_, meal]) => meal !== undefined)
      .map(([key, meal]) => ({
        key,
        name: mealNames[key] || key,
        ...meal,
      }))
    : [];

  return (
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold">Plan Nutricional</h3>
        <span className="text-xs text-zinc-500 capitalize">
          {plan.goal.replace("_", " ")}
        </span>
      </div>

      {/* Summary - Inline */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
        <span className="capitalize">{plan.dietaryType}</span>
        <span>•</span>
        <span>{plan.calories} kcal/día</span>
        <span>•</span>
        <span>{plan.mealsPerDay} comidas</span>
        {plan.macros && (
          <>
            <span>•</span>
            <span>
              P:{plan.macros.protein} C:{plan.macros.carbs} G:{plan.macros.fat}
            </span>
          </>
        )}
      </div>

      {/* Meals - Responsive Table */}
      {mealsArray.length > 0 && (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs min-w-[300px]">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="font-medium py-1 px-1">Comida</th>
                <th className="font-medium py-1 px-1">Alimento</th>
                <th className="font-medium py-1 px-1 text-right">kcal</th>
                <th className="font-medium py-1 px-1 text-right hidden sm:table-cell">
                  P
                </th>
                <th className="font-medium py-1 px-1 text-right hidden sm:table-cell">
                  C
                </th>
                <th className="font-medium py-1 px-1 text-right hidden sm:table-cell">
                  G
                </th>
              </tr>
            </thead>
            <tbody>
              {mealsArray.map((meal) =>
                meal.entries?.map((entry, idx) => {
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
                      key={`${meal.key}-${idx}`}
                      className="border-t border-zinc-100 dark:border-zinc-800/50"
                    >
                      <td className="py-1 px-1 text-zinc-500">
                        {idx === 0 ? meal.name : ""}
                      </td>
                      <td className="py-1 px-1">
                        {entry.food.name}
                        <span className="text-zinc-400 ml-1">
                          ({entry.quantity}g)
                        </span>
                      </td>
                      <td className="py-1 px-1 text-right">{totalCals}</td>
                      <td className="py-1 px-1 text-right hidden sm:table-cell text-zinc-500">
                        {totalProtein}g
                      </td>
                      <td className="py-1 px-1 text-right hidden sm:table-cell text-zinc-500">
                        {totalCarbs}g
                      </td>
                      <td className="py-1 px-1 text-right hidden sm:table-cell text-zinc-500">
                        {totalFat}g
                      </td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Fallback */}
      {mealsArray.length === 0 && plan.description && (
        <p className="text-xs text-zinc-500">{plan.description}</p>
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
