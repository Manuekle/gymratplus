"use client";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const MEAL_TYPE_LABELS: Record<string, string> = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  cena: "Cena",
  snack: "Snack",
};

export function NutritionAnalytics() {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";
  const [activeTab, setActiveTab] = useState("today");
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (type: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/nutrition-analytics?type=${type}`);
      if (!response.ok) {
        throw new Error("Error al cargar los datos de análisis");
      }
      const data = await response.json();

      if (type === "today") {
        setTodayData(data);
      } else if (type === "week") {
        setWeekData(data);
      }
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de análisis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const renderTodayContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      );
    }

    if (
      !todayData ||
      !todayData.todayLogs ||
      todayData.todayLogs.length === 0
    ) {
      return (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No hay datos para hoy</h3>
          <p className="text-muted-foreground">
            Registra tus comidas para ver el análisis nutricional del día
          </p>
        </div>
      );
    }

    // Prepare data for pie chart
    const pieData = Object.entries(todayData.mealTypeGroups).map(
      ([mealType, data]) => ({
        name: MEAL_TYPE_LABELS[mealType] || mealType,
        value: data.calories,
      })
    );

    // Prepare data for macros chart
    const macrosData = [
      {
        name: "Proteínas",
        value: todayData.todayTotals.protein * 4, // 4 calories per gram
        grams: todayData.todayTotals.protein,
        percentage: Math.round(
          (todayData.todayTotals.protein * 4 * 100) /
            todayData.todayTotals.calories
        ),
      },
      {
        name: "Carbohidratos",
        value: todayData.todayTotals.carbs * 4, // 4 calories per gram
        grams: todayData.todayTotals.carbs,
        percentage: Math.round(
          (todayData.todayTotals.carbs * 4 * 100) /
            todayData.todayTotals.calories
        ),
      },
      {
        name: "Grasas",
        value: todayData.todayTotals.fat * 9, // 9 calories per gram
        grams: todayData.todayTotals.fat,
        percentage: Math.round(
          (todayData.todayTotals.fat * 9 * 100) / todayData.todayTotals.calories
        ),
      },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Calorías Totales</CardTitle>
              <CardDescription>Hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayData.todayTotals.calories} kcal
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Proteínas</CardTitle>
              <CardDescription>Hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayData.todayTotals.protein.toFixed(1)}g
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(
                  (todayData.todayTotals.protein * 4 * 100) /
                    todayData.todayTotals.calories
                )}
                % de calorías
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Carbohidratos</CardTitle>
              <CardDescription>Hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayData.todayTotals.carbs.toFixed(1)}g
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(
                  (todayData.todayTotals.carbs * 4 * 100) /
                    todayData.todayTotals.calories
                )}
                % de calorías
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Grasas</CardTitle>
              <CardDescription>Hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayData.todayTotals.fat.toFixed(1)}g
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(
                  (todayData.todayTotals.fat * 9 * 100) /
                    todayData.todayTotals.calories
                )}
                % de calorías
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Calorías por Comida</CardTitle>
              <CardDescription>
                Porcentaje de calorías por tipo de comida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
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
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `${value} kcal`,
                        "Calorías",
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de Macronutrientes</CardTitle>
              <CardDescription>
                Calorías provenientes de cada macronutriente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={macrosData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis hide={true} />
                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        backgroundColor: isDark ? "#1f2937" : "#ffffff",
                        border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                        borderRadius: "0.375rem",
                      }}
                      labelStyle={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: isDark ? "#e5e7eb" : "#1f2937",
                      }}
                      itemStyle={{
                        fontSize: 12,
                        color: isDark ? "#e5e7eb" : "#1f2937",
                      }}
                      formatter={(value: number, name: string, props: any) => {
                        return [`${value} kcal`, name];
                      }}
                    />
                    {/* <Legend /> */}
                    <Bar
                      dataKey="value"
                      fill={isDark ? "#eee" : "#000"}
                      radius={[4, 4, 0, 0]}
                      name="Calorías"
                    ></Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderWeekContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      );
    }

    if (!weekData || !weekData.weekData || weekData.weekData.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">
            No hay datos para esta semana
          </h3>
          <p className="text-muted-foreground">
            Registra tus comidas para ver el análisis nutricional semanal
          </p>
        </div>
      );
    }

    // Format data for the chart
    const chartData = weekData.weekData.map((day) => ({
      ...day,
      dayLabel: formatDayLabel(day.dayOfWeek),
    }));

    return (
      <div className="space-y-6">
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Calorías Totales</CardTitle>
              <CardDescription>Esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weekData.weekTotals.calories} kcal
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Proteínas</CardTitle>
              <CardDescription>Esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weekData.weekTotals.protein.toFixed(1)}g
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Carbohidratos</CardTitle>
              <CardDescription>Esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weekData.weekTotals.carbs.toFixed(1)}g
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Grasas</CardTitle>
              <CardDescription>Esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weekData.weekTotals.fat.toFixed(1)}g
              </div>
            </CardContent>
          </Card>
        </div> */}

        <Card>
          <CardHeader>
            <CardTitle>Calorías por Día</CardTitle>
            <CardDescription>
              Consumo de calorías durante la semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
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
                    stroke={isDark ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="dayLabel"
                    axisLine={false}
                    tickLine={false}
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis hide={true} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "#ffffff",
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "0.375rem",
                    }}
                    labelStyle={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: isDark ? "#e5e7eb" : "#1f2937",
                    }}
                    itemStyle={{
                      fontSize: 12,
                      color: isDark ? "#e5e7eb" : "#1f2937",
                    }}
                    formatter={(value: number) => [`${value} kcal`, "Calorías"]}
                    labelFormatter={(label) => {
                      const day = chartData.find((d) => d.dayLabel === label);
                      return day
                        ? format(parseISO(day.date), "EEEE, d 'de' MMMM", {
                            locale: es,
                          })
                        : label;
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="calories"
                    fill={isDark ? "#eee" : "#000"}
                    radius={[4, 4, 0, 0]}
                    name="Calorías"
                  ></Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Macronutrientes por Día</CardTitle>
            <CardDescription>
              Consumo de proteínas, carbohidratos y grasas durante la semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dayLabel" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      return [`${value.toFixed(1)}g`, name];
                    }}
                    labelFormatter={(label) => {
                      const day = chartData.find((d) => d.dayLabel === label);
                      return day
                        ? format(parseISO(day.date), "EEEE, d 'de' MMMM", {
                            locale: es,
                          })
                        : label;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="protein" fill="#0088FE" name="Proteínas" />
                  <Bar dataKey="carbs" fill="#00C49F" name="Carbohidratos" />
                  <Bar dataKey="fat" fill="#FFBB28" name="Grasas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card> */}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today">Hoy</TabsTrigger>
          <TabsTrigger value="week">Esta Semana</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          {renderTodayContent()}
        </TabsContent>

        <TabsContent value="week" className="mt-6">
          {renderWeekContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
