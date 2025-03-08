"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalorieChart } from "@/components/calorie-chart";
import { Bread04Icon, FishFoodIcon, SteakIcon } from "hugeicons-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { MealCreate } from "@/components/nutrition/meal-create";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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

interface WeeklyMacros {
  weeklyCalories: number;
  weeklyCaloriesBreakdown: {
    Monday: number;
    Tuesday: number;
    Wednesday: number;
    Thursday: number;
    Friday: number;
    Saturday: number;
    Sunday: number;
  };
}

type MealEntry = {
  id: string;
  foodId: string;
  quantity: number;
  food: {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

type MealLog = {
  id: string;
  date: string;
  mealType: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: MealEntry[];
};

export default function NutritionPage() {
  const { data: session } = useSession();

  const [user, setUser] = useState<UserProfile | null>(null);

  const [activeTab, setActiveTab] = useState<"today" | "yesterday" | "week">(
    "today"
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyMacros, setWeeklyMacros] = useState<WeeklyMacros | null>(null);

  const fetchMealLogs = async () => {
    setLoading(true);
    try {
      const startDate = new Date(selectedDate);
      let endDate = new Date(selectedDate);

      if (activeTab === "yesterday") {
        startDate.setDate(startDate.getDate() - 1);
        endDate = new Date(startDate);
      } else if (activeTab === "week") {
        startDate.setDate(startDate.getDate() - 6);
        endDate = new Date();
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const response = await fetch(
        `/api/meal-log?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch meal logs");
      }

      const data = await response.json();
      setMealLogs(
        data.sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching meal logs:", error);

      toast.error("Error", {
        description: "Failed to load meal history",
      });
    } finally {
      setLoading(false);
    }
  };

  // Group meals by type
  const translateMealType = (type: string) => {
    const translations: { [key: string]: string } = {
      breakfast: "Desayuno",
      lunch: "Almuerzo",
      dinner: "Cena",
      snack: "Snack",
      morning_snack: "Media Mañana",
      afternoon_snack: "Merienda",
    };
    return translations[type] || type;
  };

  // Group meals by type
  const mealsByType: Record<string, MealLog[]> = {};

  mealLogs.forEach((meal) => {
    if (!mealsByType[meal.mealType]) {
      mealsByType[meal.mealType] = [];
    }
    mealsByType[meal.mealType].push(meal);
  });

  // Calculate daily totals
  const dailyTotals = mealLogs.reduce(
    (acc, meal) => {
      acc.calories += meal.calories;
      acc.protein += meal.protein;
      acc.carbs += meal.carbs;
      acc.fat += meal.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const fetchWeeklyNutrition = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/nutrition/analysis");
      if (!response.ok) {
        throw new Error("Failed to fetch weekly nutrition data");
      }
      const data = await response.json();
      setWeeklyMacros(data);
    } catch (error) {
      console.error("Error fetching weekly nutrition:", error);
      toast.error("Error", {
        description: "Failed to load weekly nutrition data",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatWeeklyCaloriesData = () => {
    if (!weeklyMacros) return [];
    return [
      { day: "Lun", calories: weeklyMacros.weeklyCaloriesBreakdown.Monday },
      { day: "Mar", calories: weeklyMacros.weeklyCaloriesBreakdown.Tuesday },
      { day: "Mié", calories: weeklyMacros.weeklyCaloriesBreakdown.Wednesday },
      { day: "Jue", calories: weeklyMacros.weeklyCaloriesBreakdown.Thursday },
      { day: "Vie", calories: weeklyMacros.weeklyCaloriesBreakdown.Friday },
      { day: "Sáb", calories: weeklyMacros.weeklyCaloriesBreakdown.Saturday },
      { day: "Dom", calories: weeklyMacros.weeklyCaloriesBreakdown.Sunday },
    ];
  };

  // console.log(formatWeeklyCaloriesData);

  useEffect(() => {
    // Si no hay usuario en la sesión, no hacemos nada
    if (!session?.user) return;

    const profile = (session.user as any)?.profile;
    if (!profile) return;

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

    // Ejecutar la obtención de datos de nutrición solo cuando cambia el usuario
    if (session?.user) {
      fetchMealLogs();
      fetchWeeklyNutrition();
    }

    // Siempre ejecutar la obtención de comidas (depende de activeTab)
    fetchMealLogs();
  }, [session?.user, activeTab]);

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
                      {dailyTotals.calories}
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

                {/* <Progress
                  value={
                    ((dailyTotals.calories ?? 0) /
                      (user?.nutrition.calorieTarget ?? 1)) *
                    100
                  }
                  className="h-3"
                /> */}
                <Progress
                  value={
                    ((dailyTotals.calories ?? 0) /
                      (user?.nutrition.calorieTarget ?? 1)) *
                    100
                  }
                  className={`h-3 ${
                    (dailyTotals.calories ?? 0) >
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
                        (dailyTotals.calories ?? 0) >
                      0
                        ? `${
                            (user?.nutrition.calorieTarget ?? 0) -
                            (dailyTotals.calories ?? 0)
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
                          ((dailyTotals.calories ?? 0) /
                            (user?.nutrition.calorieTarget ?? 1)) *
                            100
                        )
                      )}
                      %
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <CalorieChart data={formatWeeklyCaloriesData()} />
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
                        {Math.round(dailyTotals.protein)}g
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {user?.nutrition.proteinTarget}g
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      ((dailyTotals.protein ?? 0) /
                        (user?.nutrition.proteinTarget ?? 1)) *
                      100
                    }
                    className={`h-2 ${
                      (dailyTotals.protein ?? 0) >
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
                        {Math.round(dailyTotals.carbs)}g
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {user?.nutrition.carbTarget}g
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      ((dailyTotals.carbs ?? 0) /
                        (user?.nutrition.carbTarget ?? 1)) *
                      100
                    }
                    className={`h-2 ${
                      (dailyTotals.carbs ?? 0) >
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
                        {Math.round(dailyTotals.fat)}g
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {user?.nutrition.fatTarget}g
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={
                      ((dailyTotals.fat ?? 0) /
                        (user?.nutrition.fatTarget ?? 1)) *
                      100
                    }
                    className={`h-2 ${
                      (dailyTotals.fat ?? 0) > (user?.nutrition.fatTarget ?? 0)
                        ? "bg-[#FBA518]"
                        : ""
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Historial de Comidas</CardTitle>
              <CardDescription>
                Registro de alimentos consumidos
              </CardDescription>
              <MealCreate date={selectedDate} />
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="today"
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as "today" | "yesterday" | "week")
                }
              >
                <TabsList className="mb-4 tracking-wider">
                  <TabsTrigger
                    value="today"
                    onClick={() => setSelectedDate(new Date())}
                    disabled={
                      new Date().toDateString() !==
                        selectedDate.toDateString() && activeTab === "today"
                    }
                  >
                    Hoy
                  </TabsTrigger>
                  <TabsTrigger
                    value="yesterday"
                    onClick={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setSelectedDate(yesterday);
                    }}
                  >
                    Ayer
                  </TabsTrigger>
                  <TabsTrigger
                    value="week"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Esta semana
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="today">{MealHistory()}</TabsContent>

                <TabsContent value="yesterday">{MealHistory()}</TabsContent>

                <TabsContent value="week">{MealHistory()}</TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );

  function MealHistory() {
    if (loading)
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <Icons.spinner className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">Buscando comidas</p>
        </div>
      );

    if (mealLogs.length === 0)
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-muted-foreground text-sm">
            No hay comidas registradas
          </p>
        </div>
      );
    return (
      <div className="flex flex-col gap-4 border p-4 rounded-lg">
        {Object.entries(mealsByType).map(([type, meals]) => (
          <div key={type}>
            <div className="flex items-baseline justify-between">
              <h3 className="font-medium">{translateMealType(type)}</h3>
            </div>
            {meals.map((meal) => (
              <div key={meal.id}>
                <div className="flex items-baseline justify-between text-sm py-2">
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(meal.date), "HH:mm", { locale: es })}
                  </span>
                  <Badge variant="outline">
                    {meal.calories}
                    kcal
                  </Badge>
                </div>

                <div className="pl-4 border-l-2 border-accent">
                  {meal.entries.map((entry, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 text-sm items-center"
                    >
                      <div className="col-span-1">{entry.food.name}</div>
                      <div className="col-span-1 text-right">
                        {Math.round(entry.food.calories * entry.quantity)} kcal
                      </div>
                      <div className="col-span-1 text-right">
                        {(entry.food.protein * entry.quantity).toFixed(1)}g P
                      </div>
                      <div className="col-span-1 text-right">
                        {(entry.food.carbs * entry.quantity).toFixed(1)}g C /{" "}
                        {(entry.food.fat * entry.quantity).toFixed(1)}g G
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}
