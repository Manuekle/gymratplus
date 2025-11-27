"use client";

// icons

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

// sonner
import { toast } from "sonner";

// ui
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// components
import { Progress } from "@/components/ui/progress";
import { CalorieChart } from "@/components/nutrition/calorie-chart";
import { MealLogCalendar } from "@/components/nutrition/meal-log-calendar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalorieCalculator } from "@/components/nutrition/calorie-calculator";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Bread04Icon,
  FishFoodIcon,
  SteakIcon,
} from "@hugeicons/core-free-icons";

interface UserProfile {
  id: string;
  gender: string;
  height: number;
  currentWeight: number;
  dailyActivity: string;
  nutrition: {
    calorieTarget: number;
    proteinTarget: number;
    carbTarget: number;
    fatTarget: number;
  };
  waterIntake: number;
  goal: string;
  createdAt: string;
  updatedAt: string;
}

type DayData = {
  date: string;
  dayOfWeek: string;
  isToday: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type MealLog = {
  id: string;
  mealType: string;
  consumedAt: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  food: { name: string } | null;
  recipe: { name: string } | null;
};

type TodayData = {
  todayLogs: MealLog[];
  todayTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  mealTypeGroups: Record<
    string,
    {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }
  >;
};

type WeekData = {
  weekData: DayData[];
  weekTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

export default function NutritionPage() {
  const { data: session } = useSession();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Función para recargar los datos
  const reloadData = useCallback(() => {
    analyticsData("today");
    weeklyData("week");
  }, []);

  // Efecto para recargar los datos cuando cambia la clave de actualización
  useEffect(() => {
    reloadData();
  }, [reloadData, refreshKey]);

  // Función para forzar la actualización de los datos
  const refreshData = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const analyticsData = async (type: string) => {
    try {
      const response = await fetch(`/api/nutrition-analytics?type=${type}`);
      if (!response.ok) {
        throw new Error("Error al cargar los datos de análisis");
      }
      const data = await response.json();

      setTodayData(data);
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
      toast.error("Error", {
        description: "No se pudieron cargar los datos de análisis",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const weeklyData = async (type: string) => {
    try {
      const response = await fetch(`/api/nutrition-analytics?type=${type}`);
      if (!response.ok) {
        throw new Error("Error al cargar los datos de análisis");
      }
      const data = await response.json();

      setWeekData(data);
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
      toast.error("Error", {
        description: "No se pudieron cargar los datos de análisis",
      });
    }
  };

  const formatDayLabel = (dayOfWeek: string) => {
    // Convert English day names to Spanish
    const days: Record<string, string> = {
      Monday: "Lun",
      Tuesday: "Mar",
      Wednesday: "Mié",
      Thursday: "Jue",
      Friday: "Vie",
      Saturday: "Sáb",
      Sunday: "Dom",
    };
    return days[dayOfWeek] || dayOfWeek.substring(0, 3);
  };

  useEffect(() => {
    // Si no hay usuario en la sesión, no hacemos nada
    if (!session?.user) return;

    interface ExtendedSessionUser {
      profile: {
        id: string;
        gender: string;
        height: number;
        currentWeight: number;
        dailyActivity: string;
        dailyCalorieTarget: number | string;
        dailyProteinTarget: number | string;
        dailyCarbTarget: number | string;
        dailyFatTarget: number | string;
        waterIntake: number | string;
        goal: string;
        createdAt: string;
        updatedAt: string;
      };
    }
    const profile = (session.user as unknown as ExtendedSessionUser)?.profile;
    if (!profile) return;

    analyticsData("today");
    weeklyData("week");
    // Configurar el usuario solo si hay cambios en la sesión
    setUser({
      id: profile.id,
      gender: profile.gender,
      height: Number(profile.height),
      currentWeight: Number(profile.currentWeight),
      dailyActivity: profile.dailyActivity,
      nutrition: {
        calorieTarget: Number(profile.dailyCalorieTarget),
        proteinTarget: Number(profile.dailyProteinTarget),
        carbTarget: Number(profile.dailyCarbTarget),
        fatTarget: Number(profile.dailyFatTarget),
      },
      waterIntake: Number(profile.waterIntake),
      goal: profile.goal,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  }, [session?.user]);

  const chartData =
    weekData?.weekData.map((day) => ({
      ...day,
      dayLabel: formatDayLabel(day.dayOfWeek),
    })) ?? [];

  // console.log(user);

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="pb-2 flex flex-col gap-2 md:gap-0 md:flex-row justify-between items-start">
              <span>
                <Skeleton className="h-7 md:h-8 w-40 md:w-48 mb-2" />
                <Skeleton className="h-3 md:h-4 w-32 md:w-40" />
              </span>
              <div className="flex flex-row gap-2 items-center">
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-8 md:h-10 w-20 md:w-24" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-8 md:h-10 w-20 md:w-24" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
                <div className="flex justify-between text-xs">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="pt-4">
                  <Skeleton className="h-48 md:h-56 w-full rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="pb-2">
              <Skeleton className="h-7 md:h-8 w-36 md:w-40 mb-2" />
              <Skeleton className="h-3 md:h-4 w-48 md:w-56" />
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-3 w-20 md:w-24" />
                      </div>
                      <Skeleton className="h-3 w-16 md:w-20" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader className="pb-2 flex flex-col gap-2 md:gap-0 md:flex-row justify-between items-start">
              <span>
                <Skeleton className="h-7 md:h-8 w-40 md:w-48 mb-2" />
                <Skeleton className="h-3 md:h-4 w-32 md:w-40" />
              </span>
              <div className="flex flex-row gap-2 items-center">
                <Skeleton className="h-8 w-28 md:w-32 rounded-md" />
                <Skeleton className="h-8 w-28 md:w-32 rounded-md" />
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <Skeleton className="h-64 md:h-80 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="pb-2 flex flex-col gap-2 md:gap-0 md:flex-row justify-between items-start">
              <span>
                <CardTitle className="text-2xl font-semibold  tracking-heading">
                  Calorías Diarias
                </CardTitle>
                <CardDescription className="text-xs">
                  Consumo calórico del día actual
                </CardDescription>
              </span>
              <div className="flex flex-row gap-2 items-center">
                <CalorieCalculator onGoalsUpdated={refreshData} />
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs font-medium">Consumidas</div>
                    <div className="text-3xl font-semibold ">
                      {todayData ? todayData.todayTotals.calories : 0}{" "}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">Objetivo</div>
                    <div className="text-3xl font-semibold ">
                      {user?.nutrition.calorieTarget}
                    </div>
                  </div>
                </div>

                <Progress
                  value={
                    ((todayData?.todayTotals.calories ?? 0) /
                      (user?.nutrition.calorieTarget ?? 1)) *
                    100
                  }
                  className={`h-3 ${
                    (todayData?.todayTotals.calories ?? 0) >
                    (user?.nutrition.calorieTarget ?? 0)
                      ? "bg-amber-400"
                      : ""
                  }`}
                />

                <div className="flex justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Restantes:{" "}
                    </span>
                    <span className="font-medium text-xs">
                      {(user?.nutrition.calorieTarget ?? 0) -
                        (todayData?.todayTotals.calories ?? 0) >
                      0
                        ? `${
                            (user?.nutrition.calorieTarget ?? 0) -
                            (todayData?.todayTotals.calories ?? 0)
                          } kcal`
                        : "Superaste tus calorias diarias"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Progreso:{" "}
                    </span>
                    <span className="font-medium text-xs">
                      {Math.min(
                        100,
                        Math.round(
                          ((todayData?.todayTotals.calories ?? 0) /
                            (user?.nutrition.calorieTarget ?? 1)) *
                            100,
                        ),
                      )}
                      %
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <CalorieChart chartData={chartData} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-semibold  tracking-heading">
                Macronutrientes
              </CardTitle>
              <CardDescription className="text-xs">
                Distribución de proteínas, carbohidratos y grasas
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={SteakIcon}
                        size={18}
                        className="text-muted-foreground"
                      />
                      <span className="text-xs">Proteínas</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">
                        {Math.round(todayData?.todayTotals.protein ?? 0)}g
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {user?.nutrition.proteinTarget}g
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      ((todayData?.todayTotals.protein ?? 0) /
                        (user?.nutrition.proteinTarget ?? 1)) *
                      100
                    }
                    className={`h-2 ${
                      (todayData?.todayTotals.protein ?? 0) >
                      (user?.nutrition.proteinTarget ?? 0)
                        ? "bg-destructive"
                        : ""
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={Bread04Icon}
                        size={18}
                        className="text-muted-foreground"
                      />
                      <span className="text-xs">Carbohidratos</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">
                        {Math.round(todayData?.todayTotals.carbs ?? 0)}g
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {user?.nutrition.carbTarget}g
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      ((todayData?.todayTotals.carbs ?? 0) /
                        (user?.nutrition.carbTarget ?? 1)) *
                      100
                    }
                    className={`h-2 ${
                      (todayData?.todayTotals.carbs ?? 0) >
                      (user?.nutrition.carbTarget ?? 0)
                        ? "bg-[#578FCA]"
                        : ""
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={FishFoodIcon}
                        size={18}
                        className="text-muted-foreground"
                      />
                      <span className="text-xs">Grasas</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">
                        {Math.round(todayData?.todayTotals.fat ?? 0)}g
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {user?.nutrition.fatTarget}g
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      ((todayData?.todayTotals.fat ?? 0) /
                        (user?.nutrition.fatTarget ?? 1)) *
                      100
                    }
                    className={`h-2 ${
                      (todayData?.todayTotals.fat ?? 0) >
                      (user?.nutrition.fatTarget ?? 0)
                        ? "bg-[#FBA518]"
                        : ""
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader className="pb-2 flex flex-col gap-2 md:gap-0 md:flex-row justify-between items-start">
              <span>
                <CardTitle className="text-2xl font-semibold  tracking-heading">
                  Historial de Comidas
                </CardTitle>
                <CardDescription className="text-xs">
                  Registro de alimentos consumidos
                </CardDescription>
              </span>
              <div className="flex flex-row gap-2 items-center">
                <Link href="/dashboard/nutrition/food-plans">
                  <Button size="default" className="text-xs" variant="outline">
                    Ver Planes de Comida
                  </Button>
                </Link>
                <Link href="/dashboard/nutrition/register-food">
                  <Button size="default" className="text-xs" variant="default">
                    Registrar Comida
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <MealLogCalendar onMealDeleted={refreshData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
