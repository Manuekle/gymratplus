"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Calendar01Icon,
  FireIcon,
  Target01Icon,
  Note05Icon,
} from "@hugeicons/core-free-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FoodPlan {
  id: string;
  calorieTarget: number;
  macros: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  meals: {
    breakfast?: {
      entries: Array<{
        foodId: string;
        quantity: number;
        food?: {
          id: string;
          name: string;
          category: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          serving: number;
          servingUnit: string;
        };
      }>;
      totalCalories?: number;
      totalProtein?: number;
      totalCarbs?: number;
      totalFat?: number;
    };
    lunch?: {
      entries: Array<{
        foodId: string;
        quantity: number;
        food?: {
          id: string;
          name: string;
          category: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          serving: number;
          servingUnit: string;
        };
      }>;
      totalCalories?: number;
      totalProtein?: number;
      totalCarbs?: number;
      totalFat?: number;
    };
    dinner?: {
      entries: Array<{
        foodId: string;
        quantity: number;
        food?: {
          id: string;
          name: string;
          category: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          serving: number;
          servingUnit: string;
        };
      }>;
      totalCalories?: number;
      totalProtein?: number;
      totalCarbs?: number;
      totalFat?: number;
    };
    snacks?: {
      entries: Array<{
        foodId: string;
        quantity: number;
        food?: {
          id: string;
          name: string;
          category: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          serving: number;
          servingUnit: string;
        };
      }>;
      totalCalories?: number;
      totalProtein?: number;
      totalCarbs?: number;
      totalFat?: number;
    };
  };
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function FoodPlanViewPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params?.id as string;

  const [foodPlan, setFoodPlan] = useState<FoodPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoodPlan = async () => {
      if (!planId) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/food-recommendations/${planId}`);
        if (!res.ok) {
          throw new Error("No se pudo cargar el plan");
        }
        const data = await res.json();
        setFoodPlan(data);
      } catch (error) {
        console.error("Error fetching food plan:", error);
        toast.error("Error al cargar el plan", {
          description: "Hubo un problema al obtener la información del plan.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFoodPlan();
  }, [planId]);

  // Calcular totales diarios
  const dailyTotals = useMemo(() => {
    if (!foodPlan?.meals) return null;

    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    Object.values(foodPlan.meals).forEach((meal) => {
      if (meal?.totalCalories) totals.calories += meal.totalCalories;
      if (meal?.totalProtein) totals.protein += meal.totalProtein;
      if (meal?.totalCarbs) totals.carbs += meal.totalCarbs;
      if (meal?.totalFat) totals.fat += meal.totalFat;
    });

    return totals;
  }, [foodPlan]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Plan Info Card Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4">
            {/* Macros Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col p-3 rounded-lg bg-muted/50"
                >
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        {/* Meals Cards Skeleton */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <div className="rounded-md border">
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Daily Summary Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col p-4 rounded-lg bg-muted/30 border"
                >
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!foodPlan) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <h1 className="text-2xl font-semibold mb-2">Plan no encontrado</h1>
        <p className="text-xs text-muted-foreground mb-4">
          El plan que buscas no existe o no tienes acceso a él.
        </p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    );
  }

  const mealTypes = [
    { key: "breakfast", label: "Desayuno", meals: foodPlan.meals.breakfast },
    { key: "lunch", label: "Almuerzo", meals: foodPlan.meals.lunch },
    { key: "dinner", label: "Cena", meals: foodPlan.meals.dinner },
    { key: "snacks", label: "Snacks", meals: foodPlan.meals.snacks },
  ].filter((meal) => meal.meals && meal.meals.entries?.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => router.back()}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      {/* Plan Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl tracking-heading font-semibold">
                Plan de Alimentación
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <HugeiconsIcon icon={Calendar01Icon} className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(foodPlan.createdAt), "d MMM yyyy", {
                    locale: es,
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground mb-1">
                Calorías objetivo
              </span>
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={FireIcon}
                  className="h-3.5 w-3.5 text-muted-foreground"
                />
                <span className="text-xs font-semibold">
                  {foodPlan.calorieTarget} kcal
                </span>
              </div>
            </div>
            {foodPlan.macros.protein && (
              <div className="flex flex-col p-3 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground mb-1">
                  Proteína
                </span>
                <span className="text-xs font-semibold">
                  {foodPlan.macros.protein}g
                </span>
              </div>
            )}
            {foodPlan.macros.carbs && (
              <div className="flex flex-col p-3 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground mb-1">
                  Carbohidratos
                </span>
                <span className="text-xs font-semibold">
                  {foodPlan.macros.carbs}g
                </span>
              </div>
            )}
            {foodPlan.macros.fat && (
              <div className="flex flex-col p-3 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground mb-1">
                  Grasas
                </span>
                <span className="text-xs font-semibold">
                  {foodPlan.macros.fat}g
                </span>
              </div>
            )}
          </div>

          {foodPlan.notes && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <HugeiconsIcon
                  icon={Note05Icon}
                  className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"
                />
                <div>
                  <span className="text-xs font-semibold text-primary">
                    Notas del instructor:
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {foodPlan.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meals */}
      {mealTypes.length > 0 && (
        <div className="space-y-4">
          {mealTypes.map((mealType) => (
            <Card key={mealType.key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl tracking-heading font-semibold">
                    {mealType.label}
                  </CardTitle>
                  {mealType.meals?.totalCalories && (
                    <Badge variant="secondary" className="text-xs">
                      {mealType.meals.totalCalories} kcal
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Alimento</TableHead>
                        <TableHead className="text-xs text-center">
                          Cantidad
                        </TableHead>
                        <TableHead className="text-xs text-center">
                          Calorías
                        </TableHead>
                        <TableHead className="text-xs text-center">
                          Proteína
                        </TableHead>
                        <TableHead className="text-xs text-center">
                          Carbs
                        </TableHead>
                        <TableHead className="text-xs text-center">
                          Grasas
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mealType.meals?.entries?.map((entry, idx) => {
                        const food = entry.food;
                        if (!food) return null;

                        const multiplier = entry.quantity / food.serving;
                        const calories = Math.round(food.calories * multiplier);
                        const protein = Math.round(food.protein * multiplier);
                        const carbs = Math.round(food.carbs * multiplier);
                        const fat = Math.round(food.fat * multiplier);

                        return (
                          <TableRow key={entry.foodId || idx}>
                            <TableCell className="font-medium text-xs">
                              {food.name}
                            </TableCell>
                            <TableCell className="text-center text-xs">
                              {entry.quantity} {food.servingUnit}
                            </TableCell>
                            <TableCell className="text-center text-xs">
                              {calories} kcal
                            </TableCell>
                            <TableCell className="text-center text-xs">
                              {protein}g
                            </TableCell>
                            <TableCell className="text-center text-xs">
                              {carbs}g
                            </TableCell>
                            <TableCell className="text-center text-xs">
                              {fat}g
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {mealType.meals && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Total:</span>
                      <div className="flex gap-4">
                        {mealType.meals.totalCalories && (
                          <span className="font-semibold">
                            {mealType.meals.totalCalories} kcal
                          </span>
                        )}
                        {mealType.meals.totalProtein && (
                          <span className="text-muted-foreground">
                            P: {mealType.meals.totalProtein}g
                          </span>
                        )}
                        {mealType.meals.totalCarbs && (
                          <span className="text-muted-foreground">
                            C: {mealType.meals.totalCarbs}g
                          </span>
                        )}
                        {mealType.meals.totalFat && (
                          <span className="text-muted-foreground">
                            G: {mealType.meals.totalFat}g
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Daily Summary */}
      {dailyTotals && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl tracking-heading font-semibold">
              Resumen Diario
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col p-4 rounded-lg bg-muted/30 border">
                <span className="text-xs text-muted-foreground mb-2">
                  Calorías
                </span>
                <span className="text-2xl font-semibold tracking-heading">
                  {dailyTotals.calories}
                </span>
              </div>
              <div className="flex flex-col p-4 rounded-lg bg-muted/30 border">
                <span className="text-xs text-muted-foreground mb-2">
                  Proteína
                </span>
                <span className="text-2xl font-semibold tracking-heading">
                  {dailyTotals.protein}g
                </span>
              </div>
              <div className="flex flex-col p-4 rounded-lg bg-muted/30 border">
                <span className="text-xs text-muted-foreground mb-2">
                  Carbohidratos
                </span>
                <span className="text-2xl font-semibold tracking-heading">
                  {dailyTotals.carbs}g
                </span>
              </div>
              <div className="flex flex-col p-4 rounded-lg bg-muted/30 border">
                <span className="text-xs text-muted-foreground mb-2">
                  Grasas
                </span>
                <span className="text-2xl font-semibold tracking-heading">
                  {dailyTotals.fat}g
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
