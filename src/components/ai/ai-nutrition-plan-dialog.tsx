"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NutritionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nutritionPlan: {
    macros: {
      protein: string;
      carbs: string;
      fat: string;
      description: string;
    };
    meals: {
      breakfast: MealData;
      lunch: MealData;
      dinner: MealData;
      snacks: MealData;
    };
  } | null;
}

interface MealData {
  id: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: Array<{
    id: string;
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
  }>;
}

export function AINutritionPlanDialog({
  open,
  onOpenChange,
  nutritionPlan,
}: NutritionPlanDialogProps) {
  const [saving, setSaving] = useState(false);

  const handleAccept = async () => {
    if (!nutritionPlan) return;

    setSaving(true);
    try {
      // Save each meal to food log
      const today = new Date().toISOString().split("T")[0];

      for (const [mealType, mealData] of Object.entries(nutritionPlan.meals)) {
        for (const entry of mealData.entries) {
          await fetch("/api/food-log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              foodId: entry.foodId,
              quantity: entry.quantity,
              mealType: mealData.mealType,
              date: today,
            }),
          });
        }
      }

      toast.success("¡Plan nutricional guardado en tu registro de hoy!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving nutrition plan:", error);
      toast.error("Error al guardar el plan nutricional");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = () => {
    onOpenChange(false);
    toast.info("Plan descartado");
  };

  if (!nutritionPlan) return null;

  const totalCalories = Object.values(nutritionPlan.meals).reduce(
    (sum, meal) => sum + meal.calories,
    0,
  );

  const getMealTitle = (mealType: string) => {
    const titles: Record<string, string> = {
      breakfast: "🌅 Desayuno",
      lunch: "🍽️ Almuerzo",
      dinner: "🌙 Cena",
      snack: "🍎 Snacks",
    };
    return titles[mealType] || mealType;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-heading">
            Tu Plan Nutricional Personalizado
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {nutritionPlan.macros.description}
          </DialogDescription>
        </DialogHeader>

        {/* Macros Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Cals</p>
            <p className="text-base sm:text-lg font-semibold">
              {totalCalories}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Proteína</p>
            <p className="text-base sm:text-lg font-semibold">
              {nutritionPlan.macros.protein}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Carbos</p>
            <p className="text-base sm:text-lg font-semibold">
              {nutritionPlan.macros.carbs}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Grasas</p>
            <p className="text-base sm:text-lg font-semibold">
              {nutritionPlan.macros.fat}
            </p>
          </div>
        </div>

        <ScrollArea className="h-[50vh] sm:h-[400px]">
          <div className="space-y-4">
            {Object.entries(nutritionPlan.meals).map(([key, meal]) => (
              <Card key={key} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-semibold flex items-center justify-between">
                    <span>{getMealTitle(meal.mealType)}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {meal.calories} kcal
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {meal.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 p-2 bg-muted/30 rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium font-medium truncate">
                          {entry.food.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.quantity}g • {entry.food.category}
                        </p>
                      </div>
                      <div className="text-right text-xs self-start sm:self-auto">
                        <p className="font-medium">
                          {Math.round(
                            (entry.food.calories * entry.quantity) /
                              entry.food.serving,
                          )}{" "}
                          kcal
                        </p>
                        <p className="text-muted-foreground">
                          P:{" "}
                          {Math.round(
                            (entry.food.protein * entry.quantity) /
                              entry.food.serving,
                          )}
                          g
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t text-xs text-muted-foreground flex justify-between">
                    <span>Total:</span>
                    <span>
                      P: {meal.protein}g | C: {meal.carbs}g | G: {meal.fat}g
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={saving}
            className="text-xs"
          >
            Rechazar
          </Button>
          <Button onClick={handleAccept} disabled={saving} className="text-xs">
            {saving ? (
              <>
                <Icons.spinner className="h-3 w-3 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              "Aceptar y guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
