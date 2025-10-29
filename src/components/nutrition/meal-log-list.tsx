"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

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

const MEAL_TYPE_CONFIG = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  cena: "Cena",
  snack: "Snack",
} as const;

const MEAL_TYPE_ORDER = ["desayuno", "almuerzo", "cena", "snack"];

export function MealLogList({
  mealLogs,
  loading,
  selectedDate,
  onMealLogDeleted,
}: MealLogListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getMealTypeLabel = (mealType: string) => {
    return (
      MEAL_TYPE_CONFIG[mealType as keyof typeof MEAL_TYPE_CONFIG] || mealType
    );
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/meal-logs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el registro");
      }

      onMealLogDeleted(id);
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
      toast.error("❌ No se pudo eliminar la comida. Intenta de nuevo.", {
        duration: 3000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="md:p-4 p-0 md:border border-0 rounded-lg space-y-3"
          >
            <Skeleton className="h-6 w-32" />
            {[...Array(2)].map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (mealLogs.length === 0) {
    return (
      <div className="text-center py-14">
        <h3 className="text-xs font-medium mb-2">
          No hay comidas registradas para el{" "}
          {selectedDate ? formatDate(selectedDate) : "día seleccionado"}.
        </h3>
        <p className="text-xs text-muted-foreground">
          Registra tus comidas para llevar un seguimiento de tu alimentación
        </p>
      </div>
    );
  }

  const mealsByType: Record<string, MealLog[]> = {};
  mealLogs.forEach((meal) => {
    const mealType = meal.mealType || "other";
    if (!mealsByType[mealType]) {
      mealsByType[mealType] = [];
    }
    mealsByType[mealType].push(meal);
  });

  const sortedMealTypes = Object.keys(mealsByType).sort(
    (a, b) => MEAL_TYPE_ORDER.indexOf(a) - MEAL_TYPE_ORDER.indexOf(b),
  );

  return (
    <div className="space-y-6">
      {sortedMealTypes.map((mealType) => (
        <div
          key={mealType}
          className="md:p-4 p-0 md:border border-0 rounded-lg space-y-3"
        >
          <h3 className="font-semibold tracking-tight text-lg">
            {getMealTypeLabel(mealType)}
          </h3>

          <div className="space-y-3">
            {mealsByType[mealType]?.map((meal) => (
              <div key={meal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {format(new Date(meal.consumedAt), "HH:mm", { locale: es })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      {meal.calories} kcal
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(meal.id)}
                      disabled={deletingId === meal.id}
                      aria-label="Eliminar"
                    >
                      {deletingId === meal.id ? (
                        <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="col-span-1 truncate font-medium">
                    {meal.food?.name || meal.recipe?.name}
                  </div>
                  <div className="col-span-1 text-right text-muted-foreground">
                    {meal.quantity} {meal.food ? "g" : "porción"}
                  </div>
                  <div className="col-span-1 text-right text-muted-foreground">
                    {meal.protein.toFixed(1)}g P
                  </div>
                  <div className="col-span-1 text-right text-muted-foreground">
                    {meal.carbs.toFixed(1)}g C / {meal.fat.toFixed(1)}g G
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
