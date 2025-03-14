"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalorieChart } from "@/components/calorie-chart";
import { Bread04Icon, FishFoodIcon, SteakIcon } from "hugeicons-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MealLogCalendar } from "@/components/nutrition/meal-log-calendar";
import { AddMealLogButton } from "@/components/nutrition/add-meal-log-button";
import NutritionsTable from "@/components/tables/nutritions-table";
// import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  id: string;
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
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de análisis",
        variant: "destructive",
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
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de análisis",
        variant: "destructive",
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

    const profile = (session.user as any)?.profile;
    if (!profile) return;

    analyticsData("today");
    weeklyData("week");
    // Configurar el usuario solo si hay cambios en la sesión
    setUser({
      id: profile.id,
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

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Calorías Diarias</CardTitle>
              <CardDescription>Consumo calórico del día actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Consumidas
                    </div>
                    <div className="text-3xl font-bold">
                      {todayData ? todayData.todayTotals.calories : 0}{" "}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Objetivo
                    </div>
                    <div className="text-3xl font-bold">
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

                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Restantes: </span>
                    <span className="font-medium">
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
                    <span className="text-muted-foreground">Progreso: </span>
                    <span className="font-medium">
                      {Math.min(
                        100,
                        Math.round(
                          ((todayData?.todayTotals.calories ?? 0) /
                            (user?.nutrition.calorieTarget ?? 1)) *
                            100
                        )
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Macronutrientes</CardTitle>
              <CardDescription>
                Distribución de proteínas, carbohidratos y grasas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <SteakIcon size={18} className="text-muted-foreground" />
                      <span className="text-sm">Proteínas</span>
                    </div>
                    <div className="text-sm">
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
                        ? "bg-[#DE3163]"
                        : ""
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Bread04Icon
                        size={18}
                        className="text-muted-foreground"
                      />
                      <span className="text-sm">Carbohidratos</span>
                    </div>
                    <div className="text-sm">
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
                      <FishFoodIcon
                        size={18}
                        className="text-muted-foreground"
                      />
                      <span className="text-sm">Grasas</span>
                    </div>
                    <div className="text-sm">
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
          <Card className="">
            <CardHeader className="pb-2">
              <CardTitle>Mis Planes de nutricion</CardTitle>
              <CardDescription className="text-xs">
                Aquí puedes ver tus planes de nutricion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* <WorkoutGeneratorForm /> */}
                {/* <WorkoutModal /> */}
                <NutritionsTable />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <span>
                <CardTitle>Historial de Comidas</CardTitle>
                <CardDescription>
                  Registro de alimentos consumidos
                </CardDescription>
              </span>
              <AddMealLogButton />
            </CardHeader>
            <CardContent>
              <MealLogCalendar />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
