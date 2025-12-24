"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  // Convertir el objeto meals a un array
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
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-[-0.04em]">
          Plan Nutricional
        </h3>
        <Badge variant="outline" className="capitalize text-xs">
          {plan.goal.replace("_", " ")}
        </Badge>
      </div>

      {/* Summary */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 p-4 rounded-lg">
        <p className="text-sm font-medium capitalize mb-2">
          {plan.dietaryType}
        </p>
        <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <span>{plan.calories} kcal/día</span>
          <span>•</span>
          <span>{plan.mealsPerDay} comidas/día</span>
        </div>
        {plan.macros && (
          <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 mt-2">
            <span>P: {plan.macros.protein}</span>
            <span>C: {plan.macros.carbs}</span>
            <span>G: {plan.macros.fat}</span>
          </div>
        )}
      </div>

      {/* Meals Tabs */}
      {mealsArray.length > 0 && (
        <Tabs defaultValue={mealsArray[0].key} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            {mealsArray.map((meal) => (
              <TabsTrigger
                key={meal.key}
                value={meal.key}
                className="text-xs py-2"
              >
                {meal.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {mealsArray.map((meal) => (
            <TabsContent key={meal.key} value={meal.key}>
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-semibold text-primary">
                    {meal.name}
                  </h5>
                  <span className="text-xs text-zinc-500">
                    {meal.calories} kcal
                  </span>
                </div>
                <div className="space-y-1.5">
                  {meal.entries?.map((entry, idx) => {
                    const totalCals = Math.round(
                      (entry.food.calories * entry.quantity) /
                      entry.food.serving,
                    );
                    const totalProtein = Math.round(
                      (entry.food.protein * entry.quantity) /
                      entry.food.serving,
                    );
                    const totalCarbs = Math.round(
                      (entry.food.carbs * entry.quantity) / entry.food.serving,
                    );
                    const totalFat = Math.round(
                      (entry.food.fat * entry.quantity) / entry.food.serving,
                    );

                    return (
                      <div
                        key={idx}
                        className="text-xs bg-white dark:bg-zinc-900 p-2 rounded"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium flex-1">
                            {entry.food.name} ({entry.quantity}g)
                          </span>
                          <span className="text-zinc-500 shrink-0 text-[11px]">
                            {totalCals} kcal
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1">
                          <span>P: {totalProtein}g</span>
                          <span>•</span>
                          <span>C: {totalCarbs}g</span>
                          <span>•</span>
                          <span>G: {totalFat}g</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Fallback */}
      {mealsArray.length === 0 && plan.description && (
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