"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

interface FoodPlan {
  id: string;
  name?: string;
  date: string;
  createdAt?: string;
  macros: {
    protein?: string;
    carbs?: string;
    fat?: string;
    description?: string;
  };
  meals: {
    breakfast?: {
      totalCalories?: number;
      totalProtein?: number;
      totalCarbs?: number;
      totalFat?: number;
      entries?: Array<{
        foodId: string;
        quantity: number;
        food?: {
          id: string;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        };
      }>;
    };
    lunch?: {
      totalCalories?: number;
      totalProtein?: number;
      totalCarbs?: number;
      totalFat?: number;
      entries?: Array<{
        foodId: string;
        quantity: number;
        food?: {
          id: string;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        };
      }>;
    };
    dinner?: {
      totalCalories?: number;
      totalProtein?: number;
      totalCarbs?: number;
      totalFat?: number;
      entries?: Array<{
        foodId: string;
        quantity: number;
        food?: {
          id: string;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        };
      }>;
    };
    snacks?: {
      totalCalories?: number;
      totalProtein?: number;
      totalCarbs?: number;
      totalFat?: number;
      entries?: Array<{
        foodId: string;
        quantity: number;
        food?: {
          id: string;
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        };
      }>;
    };
  };
}

function FoodPlanResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [foodPlan, setFoodPlan] = useState<FoodPlan | null>(null);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  // Configuración de colores para las gráficas
  const chartConfig = {
    protein: {
      label: "Proteínas",
      color: "#ef4444",
    },
    carbs: {
      label: "Carbohidratos",
      color: "#578FCA",
    },
    fat: {
      label: "Grasas",
      color: "#FBA518",
    },
    calories: {
      label: "Calorías",
      color: "oklch(80.15% 0.17 73.59)",
    },
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Obtener el plan específico desde query params o el más reciente
        const planId = searchParams?.get("id");
        let planToLoad = null;

        if (planId) {
          const planResponse = await fetch(
            `/api/food-recommendations/${planId}`,
          );
          if (planResponse.ok) {
            planToLoad = await planResponse.json();
          }
        } else {
          // Obtener todas las recomendaciones para encontrar la más reciente
          const recResponse = await fetch("/api/food-recommendations");
          if (recResponse.ok) {
            const recData = await recResponse.json();
            if (recData.length > 0) {
              const mostRecent = recData[0];
              const planResponse = await fetch(
                `/api/food-recommendations/${mostRecent.id}`,
              );
              if (planResponse.ok) {
                planToLoad = await planResponse.json();
              }
            }
          }
        }

        setFoodPlan(planToLoad);
      } catch (error) {
        console.error("Error fetching food plan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mounted, searchParams]);

  if (!mounted || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!foodPlan) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          className="text-xs"
          size="sm"
          onClick={() => router.push("/dashboard/nutrition/food-plans")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                No se encontró ningún plan de alimentación.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extraer valores numéricos de los macros
  const parseMacro = (macro: string | undefined) => {
    if (!macro) return 0;
    const match = macro.match(/(\d+)/);
    return match && match[1] ? parseInt(match[1], 10) : 0;
  };

  const proteinValue = parseMacro(foodPlan.macros.protein);
  const carbsValue = parseMacro(foodPlan.macros.carbs);
  const fatValue = parseMacro(foodPlan.macros.fat);

  // Datos para el gráfico de distribución de macros
  const macroDistributionData = [
    {
      name: "Proteínas",
      value: proteinValue,
      color: "#ef4444",
    },
    {
      name: "Carbohidratos",
      value: carbsValue,
      color: "#578FCA",
    },
    {
      name: "Grasas",
      value: fatValue,
      color: "#FBA518",
    },
  ];

  // Colores para cada comida
  const mealColors: Record<string, string> = {
    Desayuno: "#f59e0b", // Amber
    Almuerzo: "#3b82f6", // Blue
    Cena: "#8b5cf6", // Purple
    Snacks: "#10b981", // Green
  };

  // Datos para el gráfico de calorías por comida
  const mealCaloriesData = [
    {
      name: "Desayuno",
      calorías: Math.round(foodPlan.meals.breakfast?.totalCalories || 0),
      color: mealColors.Desayuno,
    },
    {
      name: "Almuerzo",
      calorías: Math.round(foodPlan.meals.lunch?.totalCalories || 0),
      color: mealColors.Almuerzo,
    },
    {
      name: "Cena",
      calorías: Math.round(foodPlan.meals.dinner?.totalCalories || 0),
      color: mealColors.Cena,
    },
    {
      name: "Snacks",
      calorías: Math.round(foodPlan.meals.snacks?.totalCalories || 0),
      color: mealColors.Snacks,
    },
  ];

  // Datos para el gráfico de macros por comida
  const mealMacrosData = [
    {
      name: "Desayuno",
      Proteínas: foodPlan.meals.breakfast?.totalProtein || 0,
      Carbohidratos: foodPlan.meals.breakfast?.totalCarbs || 0,
      Grasas: foodPlan.meals.breakfast?.totalFat || 0,
    },
    {
      name: "Almuerzo",
      Proteínas: foodPlan.meals.lunch?.totalProtein || 0,
      Carbohidratos: foodPlan.meals.lunch?.totalCarbs || 0,
      Grasas: foodPlan.meals.lunch?.totalFat || 0,
    },
    {
      name: "Cena",
      Proteínas: foodPlan.meals.dinner?.totalProtein || 0,
      Carbohidratos: foodPlan.meals.dinner?.totalCarbs || 0,
      Grasas: foodPlan.meals.dinner?.totalFat || 0,
    },
    {
      name: "Snacks",
      Proteínas: foodPlan.meals.snacks?.totalProtein || 0,
      Carbohidratos: foodPlan.meals.snacks?.totalCarbs || 0,
      Grasas: foodPlan.meals.snacks?.totalFat || 0,
    },
  ];

  const totalCalories =
    (foodPlan.meals.breakfast?.totalCalories || 0) +
    (foodPlan.meals.lunch?.totalCalories || 0) +
    (foodPlan.meals.dinner?.totalCalories || 0) +
    (foodPlan.meals.snacks?.totalCalories || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-heading">
            Resumen del Plan
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {foodPlan.name || "Plan de Alimentación"} ·{" "}
            {format(
              new Date(foodPlan.createdAt || foodPlan.date),
              "d MMM yyyy",
            )}
          </p>
        </div>
        <Button
          variant="outline"
          className="text-xs"
          size="sm"
          onClick={() => router.push("/dashboard/nutrition/food-plans")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      {/* Gráficas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Distribución de macros - Pie Chart */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold tracking-heading">
              Distribución de Macros
            </CardTitle>
            <CardDescription className="text-xs">
              Porcentaje de proteínas, carbohidratos y grasas
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-64 w-full"
            >
              <PieChart>
                <Pie
                  data={macroDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {macroDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0];
                    if (!data) return null;
                    const total = macroDistributionData.reduce(
                      (sum, item) => sum + item.value,
                      0,
                    );
                    const percentage =
                      data.value && typeof data.value === "number"
                        ? ((data.value / total) * 100).toFixed(1)
                        : "0";
                    return (
                      <div className="border-border/50 bg-background rounded-lg border px-3 py-2 text-xs shadow-xl">
                        <div className="font-medium mb-1">{data.name}</div>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-[2px]"
                            style={{
                              backgroundColor: data.payload?.fill || data.color,
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Valor:
                            </span>
                            <span className="font-mono font-medium tabular-nums">
                              {typeof data.value === "number" ? data.value : 0}g
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="h-2.5 w-2.5 rounded-[2px] opacity-0"
                            style={{
                              backgroundColor: data.payload?.fill || data.color,
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Porcentaje:
                            </span>
                            <span className="font-mono font-medium tabular-nums">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Calorías por comida - Bar Chart */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold tracking-heading">
              Calorías por Comida
            </CardTitle>
            <CardDescription className="text-xs">
              Distribución de calorías totales: {Math.round(totalCalories)} kcal
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-64 w-full"
            >
              <BarChart
                data={mealCaloriesData}
                margin={{
                  top: 5,
                  right: 0,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? "#3D3D3E" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  stroke={isDark ? "#9ca3af" : "#6b7280"}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  stroke={isDark ? "#9ca3af" : "#6b7280"}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0];
                    if (!data) return null;
                    const mealColor = mealColors[label as string] || data.color;
                    return (
                      <div className="border-border/50 bg-background rounded-lg border px-3 py-2 text-xs shadow-xl">
                        <div className="font-medium mb-1">{label}</div>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-[2px]"
                            style={{ backgroundColor: mealColor }}
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              Calorías:
                            </span>
                            <span className="font-mono font-medium tabular-nums">
                              {typeof data.value === "number" ? data.value : 0}{" "}
                              kcal
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="calorías" radius={[4, 4, 0, 0]}>
                  {mealCaloriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Macros por comida - Bar Chart apilado */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold tracking-heading">
              Macros por Comida
            </CardTitle>
            <CardDescription className="text-xs">
              Distribución de proteínas, carbohidratos y grasas en cada comida
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-64 w-full"
            >
              <BarChart
                data={mealMacrosData}
                margin={{
                  top: 5,
                  right: 0,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? "#3D3D3E" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  stroke={isDark ? "#9ca3af" : "#6b7280"}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  stroke={isDark ? "#9ca3af" : "#6b7280"}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="border-border/50 bg-background rounded-lg border px-3 py-2 text-xs shadow-xl">
                        <div className="font-medium mb-2">{label}</div>
                        <div className="grid gap-1.5">
                          {payload.map((item, index) => {
                            const macroName = item.name || item.dataKey;
                            const macroColor = item.payload?.fill || item.color;
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="h-2.5 w-2.5 rounded-[2px] shrink-0"
                                  style={{ backgroundColor: macroColor }}
                                />
                                <div className="flex flex-1 justify-between items-center">
                                  <span className="text-muted-foreground">
                                    {macroName}:
                                  </span>
                                  <span className="font-mono font-medium tabular-nums">
                                    {typeof item.value === "number"
                                      ? item.value.toFixed(1)
                                      : "0.0"}
                                    g
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend />
                <Bar
                  dataKey="Proteínas"
                  stackId="a"
                  fill="#ef4444"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Carbohidratos"
                  stackId="a"
                  fill="#578FCA"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Grasas"
                  stackId="a"
                  fill="#FBA518"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FoodPlanResumePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <FoodPlanResumeContent />
    </Suspense>
  );
}
