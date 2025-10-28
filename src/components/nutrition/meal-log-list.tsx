"use client";

// import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";

type MealLog = {
  id: string;
  mealType: string;
  consumedAt: string;
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

type MealLogListProps = {
  mealLogs: MealLog[];
  loading: boolean;
  onMealLogDeleted: (id: string) => void;
  selectedDate?: Date;
};

export function MealLogList({ mealLogs, loading }: MealLogListProps) {
  // Removed unused deletingId state

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

  // const deleteMealLog = async (id: string) => {
  //   if (!confirm("¿Estás seguro de que quieres eliminar este registro?")) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`/api/meal-logs/${id}`, {
  //       method: "DELETE",
  //     });

  //     if (!response.ok) {
  //       throw new Error("Error al eliminar el registro");
  //     }

  //     onMealLogDeleted(id);

  //     toast.success("Registro eliminado", {
  //       description: "El registro de comida ha sido eliminado correctamente",
  //     });
  //   } catch (error) {
  //     console.error("Error deleting meal log:", error);
  //     toast.error("Error", {
  //       description: "No se pudo eliminar el registro de comida",
  //     });
  //   } finally {
  //     setDeletingId(null);
  //   }
  // };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (mealLogs.length === 0) {
    return (
      <div className="text-center py-14">
        <h3 className="text-sm font-medium mb-2">
          No hay comidas registradas para esta fecha.
        </h3>
        <p className="text-xs text-muted-foreground mb-6">
          Registra tus comidas para llevar un seguimiento de tu alimentación
        </p>
        {/* <AddMealLogButton selectedDate={selectedDate} /> */}
      </div>
    );
  }

  // Group meal logs by meal type
  const mealsByType: Record<string, MealLog[]> = {};

  mealLogs.forEach((meal) => {
    const mealType = meal.mealType || "other";
    if (!mealsByType[mealType]) {
      mealsByType[mealType] = [];
    }
    mealsByType[mealType].push(meal);
  });

  // Sort meal types in a specific order
  const mealTypeOrder = ["desayuno", "almuerzo", "cena", "snack"];
  const sortedMealTypes = Object.keys(mealsByType).sort(
    (a, b) => mealTypeOrder.indexOf(a) - mealTypeOrder.indexOf(b),
  );

  return (
    <div className="space-y-6">
      {sortedMealTypes.map((mealType) => (
        <div
          key={mealType}
          className="md:p-4 p-0 md:border border-0 rounded-lg"
        >
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold  tracking-heading text-lg">
              {getMealTypeLabel(mealType)}
            </h3>
          </div>

          {mealsByType[mealType]?.map((meal) => (
            <div key={meal.id}>
              <div className="flex items-baseline justify-between text-sm py-2">
                <span className="text-muted-foreground text-xs">
                  {format(new Date(meal.consumedAt), "HH:mm", { locale: es })}
                </span>
                <span className="flex flex-row gap-1 items-center">
                  {" "}
                  <Badge variant="outline" className="text-xs">
                    {meal.calories}
                    kcal
                  </Badge>
                  {/* <Button
                    variant="default"
                    size="sm"
                    onClick={() => deleteMealLog(meal.id)}
                    disabled={deletingId === meal.id}
                  >
                    {deletingId === meal.id ? (
                      <Skeleton className="h-4 w-4 rounded-full" />
                    ) : (
                      <Delete02Icon size={18} className="text-muted" />
                    )}
                    <span className="sr-only">Eliminar</span>
                  </Button> */}
                </span>
              </div>
              <div>
                <div className="grid grid-cols-4 text-xs md:text-sm items-center">
                  <div className="col-span-1">
                    {meal.food?.name || meal.recipe?.name}
                  </div>
                  <div className="col-span-1 text-right">
                    {meal.quantity} {meal.food ? `g` : `porción`}
                  </div>
                  <div className="col-span-1 text-right">
                    {meal.protein.toFixed(1)}g P
                  </div>
                  <div className="col-span-1 text-right">
                    {meal.carbs.toFixed(1)}g C / {meal.fat.toFixed(1)}g G
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
