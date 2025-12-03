"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Calendar01Icon,
  FireIcon,
  Note05Icon,
  Apple01Icon,
  NoodlesIcon,
  RiceBowl01Icon,
  FrenchFries02Icon,
  SteakIcon,
} from "@hugeicons/core-free-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FoodPlan {
  id: string;
  name?: string | null;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFoodPlan = async () => {
      if (!planId) return;

      setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    fetchFoodPlan();
  }, [planId]);

  if (isLoading) {
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
              <div className="rounded-md border overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]:block [-ms-overflow-style:none] [scrollbar-width:none] md:[scrollbar-width:auto]">
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
        <Button variant="outline" size="default" onClick={() => router.back()}>
          Volver
        </Button>
      </div>
    );
  }

  const mealTypesConfig = {
    breakfast: {
      label: "Desayuno",
      icon: (
        <HugeiconsIcon
          icon={Apple01Icon}
          size={12}
          className="text-muted-foreground"
        />
      ),
    },
    lunch: {
      label: "Almuerzo",
      icon: (
        <HugeiconsIcon
          icon={NoodlesIcon}
          size={12}
          className="text-muted-foreground"
        />
      ),
    },
    dinner: {
      label: "Cena",
      icon: (
        <HugeiconsIcon
          icon={RiceBowl01Icon}
          size={12}
          className="text-muted-foreground"
        />
      ),
    },
    snacks: {
      label: "Snacks",
      icon: (
        <HugeiconsIcon
          icon={FrenchFries02Icon}
          size={12}
          className="text-muted-foreground"
        />
      ),
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="default"
          className="text-xs w-full md:w-auto"
          onClick={() => router.back()}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Volver a la lista
        </Button>
      </div>

      {/* Plan Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl tracking-heading font-semibold">
                {foodPlan.name || "Plan de Alimentación"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Calorías */}
            <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900 dark:to-gray-800">
              <CardContent className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xs text-muted-foreground">
                      Calorías objetivo
                    </h1>
                    <h2 className="text-md font-medium">
                      {foodPlan.calorieTarget} kcal
                    </h2>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={FireIcon}
                      className="h-6 w-6 text-orange-600 dark:text-orange-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proteínas */}
            {foodPlan.macros.protein && (
              <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-900 dark:to-gray-800">
                <CardContent className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xs text-muted-foreground">
                        Proteínas
                      </h1>
                      <h2 className="text-md font-medium">
                        {foodPlan.macros.protein}
                      </h2>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-800 flex items-center justify-center">
                      <HugeiconsIcon
                        icon={SteakIcon}
                        className="h-6 w-6 text-pink-600 dark:text-pink-300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Carbohidratos */}
            {foodPlan.macros.carbs && (
              <Card className="bg-gradient-to-br from-sky-50 to-white dark:from-sky-900 dark:to-gray-800">
                <CardContent className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xs text-muted-foreground">
                        Carbohidratos
                      </h1>
                      <h2 className="text-md font-medium">
                        {foodPlan.macros.carbs}
                      </h2>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-800 flex items-center justify-center">
                      <HugeiconsIcon
                        icon={RiceBowl01Icon}
                        className="h-6 w-6 text-sky-600 dark:text-sky-300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grasas */}
            {foodPlan.macros.fat && (
              <Card className="bg-gradient-to-br from-amber-100 to-white dark:from-amber-900 dark:to-gray-800">
                <CardContent className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xs text-muted-foreground">Grasas</h1>
                      <h2 className="text-md font-medium">
                        {foodPlan.macros.fat}
                      </h2>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                      <HugeiconsIcon
                        icon={FrenchFries02Icon}
                        className="h-6 w-6 text-amber-600 dark:text-amber-300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {foodPlan.notes && (
            <div className="pt-3 border-t">
              <div className="flex items-start gap-2">
                <HugeiconsIcon
                  icon={Note05Icon}
                  className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {foodPlan.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meals con Tabs */}
      {Object.keys(foodPlan.meals).length > 0 && (
        <Card>
          <CardContent className="px-4 pt-6">
            <Tabs defaultValue="breakfast" className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto gap-2 sm:gap-4 px-2">
                {foodPlan.meals.breakfast && (
                  <TabsTrigger value="breakfast">
                    {mealTypesConfig.breakfast.icon}{" "}
                    {mealTypesConfig.breakfast.label}
                  </TabsTrigger>
                )}
                {foodPlan.meals.lunch && (
                  <TabsTrigger value="lunch">
                    {mealTypesConfig.lunch.icon} {mealTypesConfig.lunch.label}
                  </TabsTrigger>
                )}
                {foodPlan.meals.dinner && (
                  <TabsTrigger value="dinner">
                    {mealTypesConfig.dinner.icon} {mealTypesConfig.dinner.label}
                  </TabsTrigger>
                )}
                {foodPlan.meals.snacks && (
                  <TabsTrigger value="snacks">
                    {mealTypesConfig.snacks.icon} {mealTypesConfig.snacks.label}
                  </TabsTrigger>
                )}
              </TabsList>

              {Object.entries(foodPlan.meals).map(([key, meal]) => {
                if (!meal || !meal.entries || meal.entries.length === 0) {
                  return null;
                }

                const tabValue = key === "snacks" ? "snacks" : key;
                const mealTypeKey =
                  key === "snacks"
                    ? "snacks"
                    : (key as keyof typeof mealTypesConfig);

                // Formatear valores: mostrar 1 decimal si es < 10, 0 decimales si es >= 10
                const formatValue = (value: number) => {
                  if (value < 1) {
                    return value.toFixed(2);
                  } else if (value < 10) {
                    return value.toFixed(1);
                  } else {
                    return Math.round(value).toString();
                  }
                };

                return (
                  <TabsContent key={key} value={tabValue}>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl tracking-heading font-semibold">
                          {mealTypesConfig[mealTypeKey].label}
                        </CardTitle>
                        {meal.totalCalories && (
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(meal.totalCalories)} kcal
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        {meal.totalCalories && (
                          <>Calorías: {Math.round(meal.totalCalories)} | </>
                        )}
                        {meal.totalProtein && (
                          <>
                            Proteínas:{" "}
                            {typeof meal.totalProtein === "number"
                              ? meal.totalProtein.toFixed(1)
                              : meal.totalProtein}
                            g |{" "}
                          </>
                        )}
                        {meal.totalCarbs && (
                          <>
                            Carbohidratos:{" "}
                            {typeof meal.totalCarbs === "number"
                              ? meal.totalCarbs.toFixed(1)
                              : meal.totalCarbs}
                            g |{" "}
                          </>
                        )}
                        {meal.totalFat && (
                          <>
                            Grasas:{" "}
                            {typeof meal.totalFat === "number"
                              ? meal.totalFat.toFixed(1)
                              : meal.totalFat}
                            g
                          </>
                        )}
                      </CardDescription>
                      <div className="rounded-md border overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]:block [-ms-overflow-style:none] [scrollbar-width:none] md:[scrollbar-width:auto]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">
                                Alimento
                              </TableHead>
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
                            {meal.entries.map((entry, idx) => {
                              const food = entry.food;
                              if (!food) return null;

                              // quantity está en gramos, calcular multiplier basado en 100g
                              const multiplier = entry.quantity / 100;
                              const calories = food.calories * multiplier;
                              const protein = food.protein * multiplier;
                              const carbs = food.carbs * multiplier;
                              const fat = food.fat * multiplier;

                              return (
                                <TableRow key={entry.foodId || idx}>
                                  <TableCell className="font-medium text-xs">
                                    {food.name}
                                  </TableCell>
                                  <TableCell className="text-center text-xs">
                                    {Math.round(entry.quantity)}{" "}
                                    {food.servingUnit || "g"}
                                  </TableCell>
                                  <TableCell className="text-center text-xs">
                                    {formatValue(calories)} kcal
                                  </TableCell>
                                  <TableCell className="text-center text-xs">
                                    {formatValue(protein)}g
                                  </TableCell>
                                  <TableCell className="text-center text-xs">
                                    {formatValue(carbs)}g
                                  </TableCell>
                                  <TableCell className="text-center text-xs">
                                    {formatValue(fat)}g
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
