/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Calendar01Icon,
  ChocolateIcon,
  EggsIcon,
  FrenchFries02Icon,
  NoodlesIcon,
  RiceBowl01Icon,
  SteakIcon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils/utils";
import { Icons } from "@/components/icons";
// cambiar todo
export default function FoodRecommendations() {
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<any>(null);
  const [foods, setFoods] = useState<Record<string, any>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/food-recommendations");
        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }
        const data = await response.json();

        // Los datos vienen como lista de metadatos, necesitamos cargar el completo cuando se selecciona
        setRecommendations(data);

        // Select the most recent recommendation by default y cargar sus datos completos
        if (data.length > 0) {
          const mostRecent = data[0];
          // Cargar los datos completos del plan
          try {
            const fullPlanResponse = await fetch(
              `/api/food-recommendations/${mostRecent.id}`,
            );
            if (fullPlanResponse.ok) {
              const fullPlan = await fullPlanResponse.json();
              setSelectedRecommendation(fullPlan);
            } else {
              setSelectedRecommendation(mostRecent);
            }
          } catch (error) {
            console.error("Error loading full plan:", error);
            setSelectedRecommendation(mostRecent);
          }
        }

        // Fetch foods to display names
        fetchFoods();
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        toast("Error", {
          description: "Failed to load food recommendations",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchFoods = async () => {
      try {
        // Cargar todos los alimentos con paginación
        let allFoods: any[] = [];
        let skip = 0;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
          const response = await fetch(
            `/api/foods?skip=${skip}&limit=${limit}`,
          );
          if (!response.ok) {
            throw new Error("Failed to fetch foods");
          }
          const responseData = await response.json();

          // Handle both array and paginated response formats
          const foodsData = Array.isArray(responseData)
            ? responseData
            : responseData.data || [];

          allFoods = [...allFoods, ...foodsData];

          // Verificar si hay más páginas
          if (responseData.pagination) {
            hasMore = responseData.pagination.hasMore || false;
            skip += limit;
          } else {
            hasMore = false;
          }
        }

        // Create a map of food IDs to food objects
        const foodsMap: Record<string, any> = {};
        allFoods.forEach((food: any) => {
          if (food && food.id) {
            foodsMap[food.id] = food;
          }
        });

        setFoods(foodsMap);
      } catch (error) {
        console.error("Error fetching foods:", error);
      }
    };

    fetchRecommendations();
  }, []);

  const formatMacro = (value: string) => {
    if (!value) return null;
    const [amount, percentage] = value.split(" ");
    return (
      <div className="flex flex-col">
        <span className="font-medium">{amount}</span>
        <span className="text-xs text-muted-foreground">{percentage}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4 max-w-md" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>

        {/* Macros Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-900 dark:to-gray-800">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="px-4 flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-sky-50 to-white dark:from-sky-900 dark:to-gray-800">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="px-4 flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-100 to-white dark:from-amber-900 dark:to-gray-800">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="px-4 flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="breakfast">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-4 h-auto gap-2 sm:gap-4 px-2">
            <TabsTrigger
              value="breakfast"
              className="data-[state=active]:bg-muted"
            >
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
            <TabsTrigger value="lunch" className="data-[state=active]:bg-muted">
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
            <TabsTrigger
              value="dinner"
              className="data-[state=active]:bg-muted"
            >
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
            <TabsTrigger
              value="snacks"
              className="data-[state=active]:bg-muted"
            >
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="breakfast" className="mt-0">
            <div className="p-4 rounded-lg bg-card border border-border">
              {/* Meal Header */}
              <div className="mb-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full max-w-lg" />
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Skeleton className="h-4 w-20" />
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(4)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="space-y-1">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  const generatePlan = async () => {
    try {
      setIsLoading(true);

      // First, get the user profile
      const profileResponse = await fetch("/api/profile");
      if (!profileResponse.ok) {
        throw new Error(
          "No se encontró el perfil. Por favor, completa tu perfil primero.",
        );
      }
      const profileData = await profileResponse.json();

      // Generate recommendations (this will automatically save the food recommendation)
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate plan");
      }

      toast.success("Plan generado exitosamente");

      // Reload recommendations
      const recResponse = await fetch("/api/food-recommendations");
      if (recResponse.ok) {
        const recData = await recResponse.json();
        setRecommendations(recData);
        if (recData.length > 0) {
          // Cargar los datos completos del plan más reciente
          try {
            const fullPlanResponse = await fetch(
              `/api/food-recommendations/${recData[0].id}`,
            );
            if (fullPlanResponse.ok) {
              const fullPlan = await fullPlanResponse.json();
              setSelectedRecommendation(fullPlan);
            } else {
              setSelectedRecommendation(recData[0]);
            }
          } catch (error) {
            console.error("Error loading full plan:", error);
            setSelectedRecommendation(recData[0]);
          }
        }
        // Reload foods as well (con paginación)
        let allFoods: any[] = [];
        let skip = 0;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
          const foodsResponse = await fetch(
            `/api/foods?skip=${skip}&limit=${limit}`,
          );
          if (foodsResponse.ok) {
            const foodsData = await foodsResponse.json();
            const foodsArray = Array.isArray(foodsData)
              ? foodsData
              : foodsData.data || [];
            allFoods = [...allFoods, ...foodsArray];

            if (foodsData.pagination) {
              hasMore = foodsData.pagination.hasMore || false;
              skip += limit;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        const foodsMap: Record<string, any> = {};
        allFoods.forEach((food: any) => {
          if (food && food.id) {
            foodsMap[food.id] = food;
          }
        });
        setFoods(foodsMap);
      }
    } catch (error: any) {
      console.error("Error generating plan:", error);
      toast.error("Error al generar el plan", {
        description: error.message || "Por favor, intenta de nuevo más tarde",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="w-full space-y-4">
        <div className="mb-4 flex md:flex-row flex-col justify-between w-full items-center gap-2">
          <Button
            variant="outline"
            className="text-xs w-full"
            size="sm"
            onClick={() => router.push("/dashboard/nutrition")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
            Volver a la lista
          </Button>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-heading">
              {selectedRecommendation?.name || "Tu Plan de Alimentación"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              No tienes ningún plan de alimentación guardado.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold tracking-heading">
                  No hay planes disponibles
                </h3>
                <p className="text-xs text-muted-foreground max-w-md">
                  Genera un plan de nutrición personalizado basado en tu perfil
                  para ver las recomendaciones de alimentos.
                </p>
              </div>
              <Button
                onClick={generatePlan}
                disabled={isLoading}
                className="text-xs"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  "Generar Plan de Alimentación"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Los datos ya vienen en formato unificado desde el endpoint [id]
  const macros = selectedRecommendation?.macros || {};
  const meals = selectedRecommendation?.meals || {};

  const mealTypes = {
    breakfast: {
      label: "Desayuno",
      icon: (
        <HugeiconsIcon
          icon={EggsIcon}
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
    snack: {
      label: "Snacks",
      icon: (
        <HugeiconsIcon
          icon={ChocolateIcon}
          size={12}
          className="text-muted-foreground"
        />
      ),
    },
  };

  return (
    <div>
      <div className="mb-4 flex md:flex-row flex-col justify-between w-full items-center gap-2">
        <Button
          variant="outline"
          className="text-xs w-full"
          size="sm"
          onClick={() => router.push("/dashboard/nutrition")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />{" "}
          Volver a la lista
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader className="space-y-3">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-heading">
              {selectedRecommendation?.name || "Tu Plan de Alimentación"}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs mt-1">
              Según su perfil, hemos creado planes de nutrición para usted
            </CardDescription>
          </div>
          {recommendations.length > 1 && (
            <div className="space-y-2 pt-2 border-t">
              <span className="text-xs font-semibold text-foreground">
                Historial de Planes:
              </span>
              <div className="flex flex-wrap gap-2">
                {recommendations
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((rec) => {
                    const calorieTarget = rec.calorieTarget;

                    return (
                      <Button
                        key={rec.id}
                        variant={
                          selectedRecommendation?.id === rec.id
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className={cn(
                          "text-xs h-auto py-2 px-3",
                          selectedRecommendation?.id === rec.id &&
                            "font-semibold",
                        )}
                        onClick={async () => {
                          // Cargar los datos completos del plan seleccionado
                          try {
                            const fullPlanResponse = await fetch(
                              `/api/food-recommendations/${rec.id}`,
                            );
                            if (fullPlanResponse.ok) {
                              const fullPlan = await fullPlanResponse.json();
                              setSelectedRecommendation(fullPlan);
                            } else {
                              setSelectedRecommendation(rec);
                            }
                          } catch (error) {
                            console.error("Error loading full plan:", error);
                            setSelectedRecommendation(rec);
                          }
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <HugeiconsIcon
                            icon={Calendar01Icon}
                            className="h-3.5 w-3.5 flex-shrink-0"
                          />
                          <div className="flex flex-col items-start">
                            <span className="leading-tight">
                              {format(new Date(rec.createdAt), "d MMM yyyy")}
                            </span>
                            {calorieTarget && (
                              <span className="text-[10px] opacity-75 leading-tight">
                                {calorieTarget} kcal
                              </span>
                            )}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="px-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Protein</p>
            
          </div> */}
            <Card className="col-span-3 md:col-span-1 bg-gradient-to-br from-pink-50 to-white dark:from-pink-900 dark:to-gray-800">
              <CardContent className="px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xs text-muted-foreground">Proteínas</h1>
                    <h2 className="text-md font-medium">
                      {formatMacro(macros.protein)}
                    </h2>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center dark:bg-pink-800">
                    <HugeiconsIcon
                      icon={SteakIcon}
                      className="h-6 w-6 text-pink-600 dark:text-pink-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Carbs</p>
            {formatMacro(macros.carbs)}
          </div> */}
            <Card className="col-span-3 md:col-span-1 bg-gradient-to-br from-sky-50 to-white dark:from-sky-900 dark:to-gray-800">
              <CardContent className="px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xs text-muted-foreground">
                      Carbohidratos
                    </h1>
                    <h2 className="text-md font-medium">
                      {formatMacro(macros.carbs)}
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
            {/* <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Fat</p>
            {formatMacro(macros.fat)}
          </div> */}
            <Card className="col-span-3 md:col-span-1 bg-gradient-to-br from-amber-100 to-white dark:from-amber-900 dark:to-gray-800">
              <CardContent className="px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xs text-muted-foreground">Grasas</h1>
                    <h2 className="text-md font-medium">
                      {formatMacro(macros.fat)}
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
          </div>

          <Tabs defaultValue="breakfast" className="space-y-4 w-full">
            <TabsList className="mb-4 grid grid-cols-2 sm:grid-cols-4 h-auto gap-2 sm:gap-4 w-full px-2">
              <TabsTrigger value="breakfast">
                {mealTypes.breakfast.icon} {mealTypes.breakfast.label}
              </TabsTrigger>
              <TabsTrigger value="lunch">
                {mealTypes.lunch.icon} {mealTypes.lunch.label}
              </TabsTrigger>
              <TabsTrigger value="dinner">
                {mealTypes.dinner.icon} {mealTypes.dinner.label}
              </TabsTrigger>
              <TabsTrigger value="snack">
                {mealTypes.snack.icon} {mealTypes.snack.label}
              </TabsTrigger>
            </TabsList>

            {Object.entries(meals).map(([key, meal]: [string, any]) => {
              // Map "snacks" to "snack" for tab value
              const tabValue = key === "snacks" ? "snack" : key;
              const mealTypeKey =
                key === "snacks" ? "snack" : (key as keyof typeof mealTypes);

              // Ensure meal has entries array
              const mealEntries = Array.isArray(meal.entries)
                ? meal.entries
                : [];

              // Calcular totales desde los entries
              const calculateMealTotals = () => {
                let totalCalories = 0;
                let totalProtein = 0;
                let totalCarbs = 0;
                let totalFat = 0;

                mealEntries.forEach((entry: any) => {
                  const food = foods[entry.foodId] || entry.food;
                  if (!food) return;

                  // quantity está en gramos (estandarizado)
                  const multiplier = (entry.quantity || 0) / 100;
                  totalCalories += (food.calories || 0) * multiplier;
                  totalProtein += (food.protein || 0) * multiplier;
                  totalCarbs += (food.carbs || 0) * multiplier;
                  totalFat += (food.fat || 0) * multiplier;
                });

                return {
                  totalCalories,
                  totalProtein,
                  totalCarbs,
                  totalFat,
                };
              };

              const mealTotals = calculateMealTotals();

              return (
                <TabsContent key={key} value={tabValue}>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg tracking-heading font-semibold">
                        {mealTypes[mealTypeKey].label}
                      </CardTitle>
                      {mealTotals.totalCalories > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(mealTotals.totalCalories)} kcal
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {mealTotals.totalCalories > 0 && (
                        <>Calorías: {Math.round(mealTotals.totalCalories)} | </>
                      )}
                      {mealTotals.totalProtein > 0 && (
                        <>Proteínas: {mealTotals.totalProtein.toFixed(1)}g | </>
                      )}
                      {mealTotals.totalCarbs > 0 && (
                        <>
                          Carbohidratos: {mealTotals.totalCarbs.toFixed(1)}g
                          |{" "}
                        </>
                      )}
                      {mealTotals.totalFat > 0 && (
                        <>Grasas: {mealTotals.totalFat.toFixed(1)}g</>
                      )}
                    </CardDescription>
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
                          {mealEntries.length > 0 ? (
                            mealEntries.map((entry: any, index: number) => {
                              const food = foods[entry.foodId];

                              // Si no se encuentra el alimento, intentar cargarlo o mostrar mensaje apropiado
                              if (!food) {
                                // Si el entry tiene información del alimento directamente, usarla
                                if (entry.food) {
                                  // quantity está en gramos (estandarizado)
                                  const multiplier =
                                    (entry.quantity || 0) / 100;

                                  return (
                                    <TableRow key={index}>
                                      <TableCell className="font-medium">
                                        {entry.food.name ||
                                          "Alimento no disponible"}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {Math.round(entry.quantity || 0)}{" "}
                                        {entry.food.servingUnit || "g"}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {(() => {
                                          const calories =
                                            (entry.food.calories || 0) *
                                            multiplier;
                                          return calories < 1
                                            ? calories.toFixed(2)
                                            : calories < 10
                                              ? calories.toFixed(1)
                                              : Math.round(calories);
                                        })()}{" "}
                                        kcal
                                      </TableCell>
                                      <TableCell className="hidden md:table-cell text-center">
                                        {(() => {
                                          const protein =
                                            (entry.food.protein || 0) *
                                            multiplier;
                                          return protein < 1
                                            ? protein.toFixed(2)
                                            : protein < 10
                                              ? protein.toFixed(1)
                                              : Math.round(protein);
                                        })()}
                                        g
                                      </TableCell>
                                      <TableCell className="hidden md:table-cell text-center">
                                        {(() => {
                                          const carbs =
                                            (entry.food.carbs || 0) *
                                            multiplier;
                                          return carbs < 1
                                            ? carbs.toFixed(2)
                                            : carbs < 10
                                              ? carbs.toFixed(1)
                                              : Math.round(carbs);
                                        })()}
                                        g
                                      </TableCell>
                                      <TableCell className="hidden md:table-cell text-center">
                                        {(() => {
                                          const fat =
                                            (entry.food.fat || 0) * multiplier;
                                          return fat < 1
                                            ? fat.toFixed(2)
                                            : fat < 10
                                              ? fat.toFixed(1)
                                              : Math.round(fat);
                                        })()}
                                        g
                                      </TableCell>
                                    </TableRow>
                                  );
                                }

                                // Si no hay información del alimento, mostrar mensaje
                                return (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">
                                      <div className="flex flex-col">
                                        <span className="text-muted-foreground italic">
                                          Alimento no encontrado
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          ID: {entry.foodId?.substring(0, 8)}
                                          ...
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {Math.round((entry.quantity || 0) * 100)}g
                                    </TableCell>
                                    <TableCell className="text-center">
                                      -
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-center">
                                      -
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-center">
                                      -
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-center">
                                      -
                                    </TableCell>
                                  </TableRow>
                                );
                              }

                              // quantity está en gramos (estandarizado)
                              const multiplier = (entry.quantity || 0) / 100;

                              return (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {food.name}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(entry.quantity || 0)}{" "}
                                    {food.servingUnit || "g"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {(() => {
                                      const calories =
                                        (food.calories || 0) * multiplier;
                                      return calories < 1
                                        ? calories.toFixed(2)
                                        : calories < 10
                                          ? calories.toFixed(1)
                                          : Math.round(calories);
                                    })()}{" "}
                                    kcal
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-center">
                                    {(() => {
                                      const protein =
                                        (food.protein || 0) * multiplier;
                                      return protein < 1
                                        ? protein.toFixed(2)
                                        : protein < 10
                                          ? protein.toFixed(1)
                                          : Math.round(protein);
                                    })()}
                                    g
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-center">
                                    {(() => {
                                      const carbs =
                                        (food.carbs || 0) * multiplier;
                                      return carbs < 1
                                        ? carbs.toFixed(2)
                                        : carbs < 10
                                          ? carbs.toFixed(1)
                                          : Math.round(carbs);
                                    })()}
                                    g
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-center">
                                    {(() => {
                                      const fat = (food.fat || 0) * multiplier;
                                      return fat < 1
                                        ? fat.toFixed(2)
                                        : fat < 10
                                          ? fat.toFixed(1)
                                          : Math.round(fat);
                                    })()}
                                    g
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="h-24 text-center"
                              >
                                <div className="flex flex-col items-center justify-center py-4">
                                  <h3 className="text-xs font-semibold mb-1">
                                    No hay alimentos registrados
                                  </h3>
                                  <p className="text-xs text-muted-foreground">
                                    No hay alimentos registrados para esta
                                    comida.
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
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
    </div>
  );
}
