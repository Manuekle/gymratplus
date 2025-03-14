"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AddMealLogButton } from "./add-meal-log-button";
import {
  Clock02Icon,
  Delete02Icon,
  KitchenUtensilsIcon,
} from "hugeicons-react";

type MealPlanItem = {
  id: string;
  mealType: string;
  time: string | null;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes: string | null;
  food: {
    id: string;
    name: string;
    serving: number;
  } | null;
  recipe: {
    id: string;
    name: string;
    servings: number;
  } | null;
};

type NutritionDay = {
  id: string;
  dayNumber: number;
  dayName: string | null;
  meals: MealPlanItem[];
};

type NutritionPlan = {
  id: string;
  name: string;
  targetCalories: number | null;
  targetProtein: number | null;
  targetCarbs: number | null;
  targetFat: number | null;
  days: NutritionDay[];
};

export function NutritionPlanMeals({ plan }: { plan: NutritionPlan }) {
  // Extraer todas las comidas de todos los días
  const allMeals = plan.days.flatMap((day) => day.meals);
  const [mealItems, setMealItems] = useState<MealPlanItem[]>(allMeals || []);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMealItem = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este registro?")) {
      return;
    }

    setDeletingId(id);

    try {
      // Encontrar el día al que pertenece esta comida
      const day = plan.days.find((d) => d.meals.some((m) => m.id === id));
      if (!day) {
        throw new Error("No se encontró el día al que pertenece esta comida");
      }

      const response = await fetch(
        `/api/nutrition-plans/${plan.id}/days/${day.dayNumber}/meals/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar la comida");
      }

      setMealItems(mealItems.filter((meal) => meal.id !== id));

      toast.success("Comida eliminada", {
        description: "La comida ha sido eliminada correctamente",
      });
    } catch (error) {
      console.error("Error deleting meal:", error);
      toast.error("Error", {
        description: "No se pudo eliminar la comida",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Agrupar comidas por tipo
  const mealsByType = {
    desayuno: mealItems.filter((meal) => meal.mealType === "desayuno"),
    almuerzo: mealItems.filter((meal) => meal.mealType === "almuerzo"),
    cena: mealItems.filter((meal) => meal.mealType === "cena"),
    snack: mealItems.filter((meal) => meal.mealType === "snack"),
  };

  // Calcular totales por tipo de comida
  const calculateTotals = (meals: MealPlanItem[]) => {
    return meals.reduce(
      (acc, meal) => {
        return {
          calories: acc.calories + meal.calories,
          protein: acc.protein + meal.protein,
          carbs: acc.carbs + meal.carbs,
          fat: acc.fat + meal.fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const totalsByType = {
    desayuno: calculateTotals(mealsByType.desayuno),
    almuerzo: calculateTotals(mealsByType.almuerzo),
    cena: calculateTotals(mealsByType.cena),
    snack: calculateTotals(mealsByType.snack),
  };

  // Calcular totales generales
  const overallTotals = calculateTotals(mealItems);

  // Calcular porcentajes de objetivos
  const calculatePercentage = (value: number, target: number | null) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((value / target) * 100), 100);
  };

  const caloriesPercentage = calculatePercentage(
    overallTotals.calories,
    plan.targetCalories
  );
  const proteinPercentage = calculatePercentage(
    overallTotals.protein,
    plan.targetProtein
  );
  const carbsPercentage = calculatePercentage(
    overallTotals.carbs,
    plan.targetCarbs
  );
  const fatPercentage = calculatePercentage(overallTotals.fat, plan.targetFat);

  const renderMealList = (meals: MealPlanItem[], mealType: string) => {
    if (meals.length === 0) {
      return (
        <div className="text-center border rounded-lg space-y-4 py-32">
          <p className="text-muted-foreground text-sm">
            No hay comidas registradas para este tipo
          </p>
          <AddMealLogButton
            selectedDate={undefined}
            defaultMealType={
              mealType as "desayuno" | "almuerzo" | "cena" | "snack"
            }
            planId={plan.id}
            buttonText="Registrar comida"
          />
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {meals.map((meal) => (
          <Card key={meal.id}>
            <CardHeader className="py-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    {meal.food?.name || meal.recipe?.name}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Clock02Icon className="h-3 w-3 mr-1" />
                    {meal.time
                      ? format(new Date(meal.time), "d MMM yyyy, HH:mm", {
                          locale: es,
                        })
                      : "Sin hora"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => deleteMealItem(meal.id)}
                  disabled={deletingId === meal.id}
                >
                  <Delete02Icon className="h-4 w-4" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex items-center text-sm">
                <KitchenUtensilsIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {meal.quantity} {meal.food ? `g` : `porción(es)`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Calorías:</span>
                  <span className="ml-1 font-medium">{meal.calories}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">P:</span>
                  <span className="ml-1 font-medium">
                    {meal.protein.toFixed(1)}g
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">C:</span>
                  <span className="ml-1 font-medium">
                    {meal.carbs.toFixed(1)}g
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">G:</span>
                  <span className="ml-1 font-medium">
                    {meal.fat.toFixed(1)}g
                  </span>
                </div>
              </div>
              {meal.notes && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>{meal.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-bold">Comidas del Plan</h3>
        {/* <AddMealLogButton planId={plan.id} /> */}
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Progreso de Objetivos Nutricionales</CardTitle>
          <CardDescription>
            Seguimiento de tus objetivos diarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Calorías</span>
                <span>
                  {overallTotals.calories} / {plan.targetCalories || "?"} kcal
                </span>
              </div>
              <Progress value={caloriesPercentage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Proteínas</span>
                <span>
                  {overallTotals.protein.toFixed(1)} /{" "}
                  {plan.targetProtein || "?"} g
                </span>
              </div>
              <Progress value={proteinPercentage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Carbohidratos</span>
                <span>
                  {overallTotals.carbs.toFixed(1)} / {plan.targetCarbs || "?"} g
                </span>
              </div>
              <Progress value={carbsPercentage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Grasas</span>
                <span>
                  {overallTotals.fat.toFixed(1)} / {plan.targetFat || "?"} g
                </span>
              </div>
              <Progress value={fatPercentage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="desayuno" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="desayuno">Desayuno</TabsTrigger>
          <TabsTrigger value="almuerzo">Almuerzo</TabsTrigger>
          <TabsTrigger value="cena">Cena</TabsTrigger>
          <TabsTrigger value="snack">Snacks</TabsTrigger>
        </TabsList>

        <TabsContent value="desayuno" className="mt-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm">Totales de Desayuno</h4>
              <AddMealLogButton
                selectedDate={undefined}
                defaultMealType="desayuno"
                planId={plan.id}
              />
            </div>
            <div className="grid grid-cols-4 gap-4 py-4 bg-muted/20 rounded-lg text-sm">
              <div>
                <span className="text-muted-foreground">Calorías:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.desayuno.calories} kcal
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Proteínas:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.desayuno.protein.toFixed(1)} g
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Carbos:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.desayuno.carbs.toFixed(1)} g
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Grasas:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.desayuno.fat.toFixed(1)} g
                </span>
              </div>
            </div>
          </div>
          {renderMealList(mealsByType.desayuno, "desayuno")}
        </TabsContent>

        <TabsContent value="almuerzo" className="mt-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm">Totales de Almuerzo</h4>
              <AddMealLogButton
                selectedDate={undefined}
                defaultMealType="almuerzo"
                planId={plan.id}
              />
            </div>
            <div className="grid grid-cols-4 gap-4 py-4 bg-muted/20 rounded-lg text-sm">
              <div>
                <span className="text-muted-foreground">Calorías:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.almuerzo.calories} kcal
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Proteínas:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.almuerzo.protein.toFixed(1)} g
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Carbos:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.almuerzo.carbs.toFixed(1)} g
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Grasas:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.almuerzo.fat.toFixed(1)} g
                </span>
              </div>
            </div>
          </div>
          {renderMealList(mealsByType.almuerzo, "almuerzo")}
        </TabsContent>

        <TabsContent value="cena" className="mt-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm">Totales de Cena</h4>
              <AddMealLogButton
                selectedDate={undefined}
                defaultMealType="cena"
                planId={plan.id}
              />
            </div>
            <div className="grid grid-cols-4 gap-4 py-4 bg-muted/20 rounded-lg text-sm">
              <div>
                <span className="text-muted-foreground">Calorías:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.cena.calories} kcal
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Proteínas:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.cena.protein.toFixed(1)} g
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Carbos:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.cena.carbs.toFixed(1)} g
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Grasas:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.cena.fat.toFixed(1)} g
                </span>
              </div>
            </div>
          </div>
          {renderMealList(mealsByType.cena, "cena")}
        </TabsContent>

        <TabsContent value="snack" className="mt-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-sm">Totales de Snacks</h4>
              <AddMealLogButton
                selectedDate={undefined}
                defaultMealType="snack"
                planId={plan.id}
              />
            </div>
            <div className="grid grid-cols-4 gap-4 py-4 bg-muted/20 rounded-lg text-sm">
              <div>
                <span className="text-muted-foreground">Calorías:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.snack.calories} kcal
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Proteínas:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.snack.protein.toFixed(1)} g
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Carbos:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.snack.carbs.toFixed(1)} g
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Grasas:</span>
                <span className="ml-1 font-medium">
                  {totalsByType.snack.fat.toFixed(1)} g
                </span>
              </div>
            </div>
          </div>
          {renderMealList(mealsByType.snack, "snack")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
