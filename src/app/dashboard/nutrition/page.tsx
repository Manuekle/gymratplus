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
import { CalorieChart } from "@/components/calorie-chart";
import { MealLogCalendar } from "@/components/nutrition/meal-log-calendar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalorieCalculator } from "@/components/calorie-calculator";
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
    // setLoading(true);
    try {
      const response = await fetch(`/api/nutrition-analytics?type=${type}`);
      if (!response.ok) {
        throw new Error("Error al cargar los datos de análisis");
      }
      const data = await response.json();

      setTodayData(data);
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
      // toast({
      //   title: "Error",
      //   description: "No se pudieron cargar los datos de análisis",
      //   variant: "destructive",
      // });
      toast.error("Error", {
        description: "No se pudieron cargar los datos de análisis",
      });
    } finally {
      // setLoading(false);
    }
  };

  const weeklyData = async (type: string) => {
    // setLoading(true);
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
    } finally {
      // setLoading(false);
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
            <CardContent>
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
            <CardContent>
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
                  <Button size="sm" className="text-xs" variant="outline">
                    Ver Planes de Comida
                  </Button>
                </Link>
                <Link href="/dashboard/nutrition/register-food">
                  <Button size="sm" className="text-xs" variant="default">
                    Registrar Comida
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <MealLogCalendar onMealDeleted={refreshData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
