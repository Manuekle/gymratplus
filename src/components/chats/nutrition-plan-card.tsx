"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
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
    <Card className="w-full min-w-[320px] overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3 border-b bg-muted/30">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold leading-none">Plan Nutricional</h3>
              <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-wider">
                {plan.goal.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium capitalize">
              {plan.dietaryType} • {plan.calories} kcal • {plan.mealsPerDay} comidas
            </p>
          </div>
        </div>

        {/* Macros Summary - Compact & Transparent */}
        {plan.macros && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Proteína", value: plan.macros.protein },
              { label: "Carbos", value: plan.macros.carbs },
              { label: "Grasas", value: plan.macros.fat },
            ].map((macro, i) => (
              <div key={i} className="flex flex-col p-2 rounded-md bg-background border shadow-sm">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5">{macro.label}</span>
                <span className="text-sm font-bold tabular-nums">{macro.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Meals Tabs */}
        {mealsArray.length > 0 ? (
          <Tabs defaultValue={mealsArray[0]?.key} className="w-full">
            <div className="px-4 pt-3">
              <TabsList className="w-full h-9 bg-muted/60 p-1 justify-start">
                {mealsArray.map((meal) => (
                  <TabsTrigger
                    key={meal.key}
                    value={meal.key}
                    className="flex-1 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    {meal.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>


            {mealsArray.map((meal) => (
              <TabsContent key={meal.key} value={meal.key} className="mt-0 p-4 pt-4 animate-in fade-in-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                    Detalle de comida
                  </span>
                  <Badge variant="outline" className="tabular-nums font-mono text-xs">
                    {meal.calories} kcal
                  </Badge>
                </div>
                <div className="space-y-0 border rounded-lg overflow-hidden">
                  {meal.entries?.map((entry, idx) => (
                    <div key={idx} className="flex justify-between text-sm items-center p-3 bg-background border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-semibold">{entry.food.name}</span>
                        <span className="text-xs text-muted-foreground">{entry.quantity}g</span>
                      </div>
                      <span className="text-muted-foreground tabular-nums font-medium text-xs bg-muted/50 px-2 py-1 rounded">
                        {Math.round((entry.food.calories * entry.quantity) / entry.food.serving)} kcal
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="p-6 text-center">
            {plan.description && (
              <p className="text-sm text-muted-foreground italic">
                {plan.description}
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Save Button */}
      <CardFooter className="bg-muted/20 p-3 border-t">
        <Button
          onClick={onSave}
          disabled={isSaved}
          className={cn("w-full font-bold uppercase tracking-wide", isSaved && "bg-green-600 hover:bg-green-700")}
        >
          {isSaved ? "Plan Guardado" : "Guardar Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
