"use client";

import { useState } from "react";
import { PlusCircle, Trash, Clock, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AddMealLogButton } from "./add-meal-dialog";

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
  days: NutritionDay[];
};

export function NutritionPlanDays({ plan }: { plan: NutritionPlan }) {
  const [days, setDays] = useState<NutritionDay[]>(plan.days);
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [newDayNumber, setNewDayNumber] = useState("");
  const [newDayName, setNewDayName] = useState("");

  const addDay = async () => {
    if (!newDayNumber) {
      toast({
        title: "Error",
        description: "El número de día es obligatorio",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/nutrition-plans/${plan.id}/days`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dayNumber: Number.parseInt(newDayNumber),
          dayName: newDayName || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el día");
      }

      const newDay = await response.json();
      setDays([...days, newDay]);
      setIsAddingDay(false);
      setNewDayNumber("");
      setNewDayName("");

      toast({
        title: "Día añadido",
        description: "El día ha sido añadido correctamente al plan",
      });
    } catch (error) {
      console.error("Error adding day:", error);
      toast({
        title: "Error",
        description: "No se pudo añadir el día al plan",
        variant: "destructive",
      });
    }
  };

  const deleteDay = async (dayId: string, dayNumber: number) => {
    if (
      !confirm(`¿Estás seguro de que quieres eliminar el día ${dayNumber}?`)
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/nutrition-plans/${plan.id}/days/${dayNumber}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el día");
      }

      setDays(days.filter((day) => day.id !== dayId));

      toast({
        title: "Día eliminado",
        description: "El día ha sido eliminado correctamente del plan",
      });
    } catch (error) {
      console.error("Error deleting day:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el día del plan",
        variant: "destructive",
      });
    }
  };

  const deleteMeal = async (dayNumber: number, mealId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta comida?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/nutrition-plans/${plan.id}/days/${dayNumber}/meals/${mealId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar la comida");
      }

      setDays(
        days.map((day) => {
          if (day.dayNumber === dayNumber) {
            return {
              ...day,
              meals: day.meals.filter((meal) => meal.id !== mealId),
            };
          }
          return day;
        })
      );

      toast({
        title: "Comida eliminada",
        description: "La comida ha sido eliminada correctamente",
      });
    } catch (error) {
      console.error("Error deleting meal:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la comida",
        variant: "destructive",
      });
    }
  };

  const onMealAdded = (dayNumber: number, newMeal: MealPlanItem) => {
    setDays(
      days.map((day) => {
        if (day.dayNumber === dayNumber) {
          return {
            ...day,
            meals: [...day.meals, newMeal],
          };
        }
        return day;
      })
    );
  };

  const getMealTypeLabel = (mealType: string) => {
    switch (mealType) {
      case "desayuno":
        return "Desayuno";
      case "almuerzo":
        return "Almuerzo";
      case "cena":
        return "Cena";
      case "snack":
        return "Snack";
      default:
        return mealType;
    }
  };

  const calculateDayTotals = (meals: MealPlanItem[]) => {
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

  return (
    <div className="space-y-6 mt-6">
      {days.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No hay días configurados</h3>
          <p className="text-muted-foreground mb-6">
            Añade días a tu plan para comenzar a configurar tus comidas
          </p>
          <Button onClick={() => setIsAddingDay(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Día
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Días del Plan</h3>
            <Button onClick={() => setIsAddingDay(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Día
            </Button>
          </div>

          <Accordion type="multiple" className="w-full">
            {days.map((day) => {
              const dayTotals = calculateDayTotals(day.meals);

              return (
                <AccordionItem
                  key={day.id}
                  value={day.id}
                  className="border rounded-lg mb-4"
                >
                  <AccordionTrigger className="px-4">
                    <div className="flex items-center">
                      <span className="font-medium">Día {day.dayNumber}</span>
                      {day.dayName && (
                        <span className="ml-2 text-muted-foreground">
                          ({day.dayName})
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Calorías:
                          </span>
                          <span className="ml-1 font-medium">
                            {dayTotals.calories} kcal
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Proteínas:
                          </span>
                          <span className="ml-1 font-medium">
                            {dayTotals.protein.toFixed(1)}g
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Carbohidratos:
                          </span>
                          <span className="ml-1 font-medium">
                            {dayTotals.carbs.toFixed(1)}g
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Grasas:</span>
                          <span className="ml-1 font-medium">
                            {dayTotals.fat.toFixed(1)}g
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <AddMealLogButton
                          planId={plan.id}
                          dayNumber={day.dayNumber}
                          onMealAdded={(meal) =>
                            onMealAdded(day.dayNumber, meal)
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteDay(day.id, day.dayNumber)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {day.meals.length === 0 ? (
                      <div className="text-center py-6 border rounded-lg">
                        <p className="text-muted-foreground">
                          No hay comidas configuradas para este día
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {day.meals.map((meal) => (
                          <Card key={meal.id}>
                            <CardHeader className="py-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base">
                                    {meal.food?.name || meal.recipe?.name}
                                  </CardTitle>
                                  <CardDescription className="flex items-center mt-1">
                                    <Badge variant="outline" className="mr-2">
                                      {getMealTypeLabel(meal.mealType)}
                                    </Badge>
                                    {meal.time && (
                                      <span className="flex items-center text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {meal.time}
                                      </span>
                                    )}
                                  </CardDescription>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    deleteMeal(day.dayNumber, meal.id)
                                  }
                                >
                                  <Trash className="h-4 w-4" />
                                  <span className="sr-only">Eliminar</span>
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2">
                              <div className="flex items-center text-sm">
                                <Utensils className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>
                                  {meal.quantity}{" "}
                                  {meal.food ? `g` : `porción(es)`}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Calorías:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {meal.calories}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    P:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {meal.protein.toFixed(1)}g
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    C:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {meal.carbs.toFixed(1)}g
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    G:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {meal.fat.toFixed(1)}g
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </>
      )}

      <Dialog open={isAddingDay} onOpenChange={setIsAddingDay}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Día</DialogTitle>
            <DialogDescription>
              Añade un nuevo día a tu plan de nutrición
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dayNumber" className="text-right">
                Número de Día
              </Label>
              <Input
                id="dayNumber"
                type="number"
                min="1"
                value={newDayNumber}
                onChange={(e) => setNewDayNumber(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dayName" className="text-right">
                Nombre (opcional)
              </Label>
              <Input
                id="dayName"
                placeholder="Ej: Lunes"
                value={newDayName}
                onChange={(e) => setNewDayName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingDay(false)}>
              Cancelar
            </Button>
            <Button onClick={addDay}>Añadir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
