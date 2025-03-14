"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Area,
  AreaChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type MealPlanItem = {
  id: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type NutritionDay = {
  id: string;
  dayNumber: number;
  dayName: string | null;
  meals: MealPlanItem[];
};

type NutritionPlan = {
  id: string;
  targetCalories: number | null;
  targetProtein: number | null;
  targetCarbs: number | null;
  targetFat: number | null;
  days: NutritionDay[];
};

// Colores personalizados para las gráficas
const COLORS = {
  protein: "#FFB800", // Amarillo
  carbs: "#00C49F", // Verde
  fat: "#FF5A5A", // Rojo
  calories: "#8884d8", // Morado
  breakfast: "#FF8042", // Naranja
  lunch: "#0088FE", // Azul
  dinner: "#8884d8", // Morado
  snack: "#82ca9d", // Verde claro
};

// Función para obtener el color de fondo con gradiente
const getGradientBackground = (color: string) => {
  return `linear-gradient(180deg, ${color}80 0%, ${color}10 100%)`;
};

export function NutritionPlanSummary({ plan }: { plan: NutritionPlan }) {
  const [activeTab, setActiveTab] = useState("macros");

  // Calculate daily totals
  const dailyTotals = plan.days.map((day) => {
    const totals = day.meals.reduce(
      (acc, meal) => {
        return {
          calories: acc.calories + meal.calories,
          protein: acc.protein + meal.protein,
          carbs: acc.carbs + meal.carbs,
          fat: acc.fat + meal.fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      day: day.dayNumber,
      dayName: day.dayName || `Día ${day.dayNumber}`,
      ...totals,
      proteinPct:
        Math.round(((totals.protein * 4) / totals.calories) * 100) || 0,
      carbsPct: Math.round(((totals.carbs * 4) / totals.calories) * 100) || 0,
      fatPct: Math.round(((totals.fat * 9) / totals.calories) * 100) || 0,
    };
  });

  // Calculate meal type distribution
  const mealTypeData = plan.days
    .flatMap((day) => day.meals)
    .reduce((acc, meal) => {
      const mealType = meal.mealType;
      if (!acc[mealType]) {
        acc[mealType] = {
          name: getMealTypeLabel(mealType),
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          count: 0,
        };
      }

      acc[mealType].calories += meal.calories;
      acc[mealType].protein += meal.protein;
      acc[mealType].carbs += meal.carbs;
      acc[mealType].fat += meal.fat;
      acc[mealType].count += 1;

      return acc;
    }, {} as Record<string, { name: string; calories: number; protein: number; carbs: number; fat: number; count: number }>);

  const mealTypeChartData = Object.values(mealTypeData).map((data) => ({
    ...data,
    calories: Math.round(data.calories / plan.days.length),
    protein: Math.round(data.protein / plan.days.length),
    carbs: Math.round(data.carbs / plan.days.length),
    fat: Math.round(data.fat / plan.days.length),
  }));

  // Calculate average macros
  const averageMacros = dailyTotals.reduce(
    (acc, day) => {
      return {
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fat: acc.fat + day.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const daysCount = dailyTotals.length || 1;
  const avgCalories = Math.round(averageMacros.calories / daysCount);
  const avgProtein = Math.round(averageMacros.protein / daysCount);
  const avgCarbs = Math.round(averageMacros.carbs / daysCount);
  const avgFat = Math.round(averageMacros.fat / daysCount);

  const avgProteinPct = Math.round(((avgProtein * 4) / avgCalories) * 100) || 0;
  const avgCarbsPct = Math.round(((avgCarbs * 4) / avgCalories) * 100) || 0;
  const avgFatPct = Math.round(((avgFat * 9) / avgCalories) * 100) || 0;

  // Datos para el gráfico de distribución de macros
  const macroDistributionData = [
    { name: "Proteínas", value: avgProteinPct, fill: COLORS.protein },
    { name: "Carbohidratos", value: avgCarbsPct, fill: COLORS.carbs },
    { name: "Grasas", value: avgFatPct, fill: COLORS.fat },
  ];

  // Datos para el gráfico de área de calorías por día
  const caloriesAreaData = dailyTotals.map((day) => ({
    name: day.dayName,
    calories: day.calories,
  }));

  // Calculate target comparison
  const targetComparison = [
    {
      name: "Calorías",
      actual: avgCalories,
      target: plan.targetCalories || 0,
      unit: "kcal",
      pct: plan.targetCalories
        ? Math.round((avgCalories / plan.targetCalories) * 100)
        : 0,
      fill: COLORS.calories,
    },
    {
      name: "Proteínas",
      actual: avgProtein,
      target: plan.targetProtein || 0,
      unit: "g",
      pct: plan.targetProtein
        ? Math.round((avgProtein / plan.targetProtein) * 100)
        : 0,
      fill: COLORS.protein,
    },
    {
      name: "Carbohidratos",
      actual: avgCarbs,
      target: plan.targetCarbs || 0,
      unit: "g",
      pct: plan.targetCarbs
        ? Math.round((avgCarbs / plan.targetCarbs) * 100)
        : 0,
      fill: COLORS.carbs,
    },
    {
      name: "Grasas",
      actual: avgFat,
      target: plan.targetFat || 0,
      unit: "g",
      pct: plan.targetFat ? Math.round((avgFat / plan.targetFat) * 100) : 0,
      fill: COLORS.fat,
    },
  ];

  // Datos para el gráfico radial de objetivos
  const radialData = targetComparison
    .filter((item) => item.target > 0)
    .map((item, index) => ({
      name: item.name,
      value: Math.min(item.pct, 100),
      fill: item.fill,
    }));

  function getMealTypeLabel(mealType: string) {
    switch (mealType) {
      case "desayuno":
        return "Desayuno";
      case "almuerzo":
        return "Almuerzo";
      case "cena":
        return "Cena";
      case "snack":
        return "Snack";
      default:
        return mealType;
    }
  }

  // Función para obtener el color del tipo de comida
  function getMealTypeColor(mealType: string) {
    switch (mealType) {
      case "Desayuno":
        return COLORS.breakfast;
      case "Almuerzo":
        return COLORS.lunch;
      case "Cena":
        return COLORS.dinner;
      case "Snack":
        return COLORS.snack;
      default:
        return "#999";
    }
  }

  // Componente personalizado para el tooltip de las gráficas
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div
              key={`item-${index}`}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.fill || entry.color }}
              ></div>
              <span>{entry.name}: </span>
              <span className="font-medium">
                {entry.value}{" "}
                {entry.unit || (entry.name === "Calorías" ? "kcal" : "g")}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="overflow-hidden border-t-4"
          style={{ borderTopColor: COLORS.calories }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Calorías Promedio</CardTitle>
            <CardDescription>Por día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCalories} kcal</div>
            {plan.targetCalories && (
              <p className="text-xs text-muted-foreground mt-1">
                {avgCalories < plan.targetCalories
                  ? `${
                      plan.targetCalories - avgCalories
                    } kcal por debajo del objetivo`
                  : avgCalories > plan.targetCalories
                  ? `${
                      avgCalories - plan.targetCalories
                    } kcal por encima del objetivo`
                  : "Coincide con el objetivo"}
              </p>
            )}
          </CardContent>
        </Card>
        <Card
          className="overflow-hidden border-t-4"
          style={{ borderTopColor: COLORS.protein }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Proteínas Promedio</CardTitle>
            <CardDescription>Por día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProtein}g</div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgProteinPct}% de las calorías totales
            </p>
          </CardContent>
        </Card>
        <Card
          className="overflow-hidden border-t-4"
          style={{ borderTopColor: COLORS.carbs }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Carbohidratos Promedio</CardTitle>
            <CardDescription>Por día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCarbs}g</div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgCarbsPct}% de las calorías totales
            </p>
          </CardContent>
        </Card>
        <Card
          className="overflow-hidden border-t-4"
          style={{ borderTopColor: COLORS.fat }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Grasas Promedio</CardTitle>
            <CardDescription>Por día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgFat}g</div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgFatPct}% de las calorías totales
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="macros" className="py-2">
            <span className="flex items-center gap-2">
              <span className="hidden sm:inline">Distribución de</span>{" "}
              Macronutrientes
            </span>
          </TabsTrigger>
          <TabsTrigger value="mealTypes" className="py-2">
            <span className="flex items-center gap-2">
              <span className="hidden sm:inline">Distribución por</span> Tipo de
              Comida
            </span>
          </TabsTrigger>
          <TabsTrigger value="targets" className="py-2">
            <span className="flex items-center gap-2">
              <span className="hidden sm:inline">Comparación con</span>{" "}
              Objetivos
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="macros" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Macronutrientes</CardTitle>
              <CardDescription>
                Porcentaje de calorías provenientes de cada macronutriente
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={macroDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                          labelLine={false}
                          animationBegin={0}
                          animationDuration={1500}
                        >
                          {macroDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <div className="space-y-4">
                    {macroDistributionData.map((entry) => (
                      <div key={entry.name} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.fill }}
                            ></div>
                            <span>{entry.name}</span>
                          </div>
                          <Badge variant="outline">{entry.value}%</Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${entry.value}%`,
                              background: getGradientBackground(entry.fill),
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calorías por Día</CardTitle>
              <CardDescription>
                Evolución de calorías a lo largo del plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={caloriesAreaData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorCalories"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.calories}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.calories}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="calories"
                      stroke={COLORS.calories}
                      fillOpacity={1}
                      fill="url(#colorCalories)"
                      name="Calorías"
                      unit="kcal"
                      animationBegin={0}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Macronutrientes por Día</CardTitle>
              <CardDescription>
                Distribución de proteínas, carbohidratos y grasas por día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyTotals}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="dayName" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="protein"
                      name="Proteínas"
                      fill={COLORS.protein}
                      radius={[4, 4, 0, 0]}
                      unit="g"
                      animationBegin={0}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey="carbs"
                      name="Carbohidratos"
                      fill={COLORS.carbs}
                      radius={[4, 4, 0, 0]}
                      unit="g"
                      animationBegin={200}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey="fat"
                      name="Grasas"
                      fill={COLORS.fat}
                      radius={[4, 4, 0, 0]}
                      unit="g"
                      animationBegin={400}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mealTypes" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Calorías por Tipo de Comida</CardTitle>
              <CardDescription>
                Calorías promedio por tipo de comida
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mealTypeChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="calories"
                          nameKey="name"
                          label={({ name, value }) => `${name}: ${value} kcal`}
                          labelLine={true}
                          animationBegin={0}
                          animationDuration={1500}
                        >
                          {mealTypeChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getMealTypeColor(entry.name)}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <div className="space-y-4">
                    {mealTypeChartData.map((entry) => (
                      <div key={entry.name} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: getMealTypeColor(entry.name),
                              }}
                            ></div>
                            <span>{entry.name}</span>
                          </div>
                          <Badge variant="outline">{entry.calories} kcal</Badge>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${
                                (entry.calories /
                                  Math.max(
                                    ...mealTypeChartData.map((d) => d.calories)
                                  )) *
                                100
                              }%`,
                              background: getGradientBackground(
                                getMealTypeColor(entry.name)
                              ),
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Macronutrientes por Tipo de Comida</CardTitle>
              <CardDescription>
                Distribución de proteínas, carbohidratos y grasas por tipo de
                comida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mealTypeChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="protein"
                      name="Proteínas"
                      fill={COLORS.protein}
                      radius={[4, 4, 0, 0]}
                      unit="g"
                      animationBegin={0}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey="carbs"
                      name="Carbohidratos"
                      fill={COLORS.carbs}
                      radius={[4, 4, 0, 0]}
                      unit="g"
                      animationBegin={200}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey="fat"
                      name="Grasas"
                      fill={COLORS.fat}
                      radius={[4, 4, 0, 0]}
                      unit="g"
                      animationBegin={400}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparación con Objetivos</CardTitle>
              <CardDescription>
                Progreso hacia los objetivos establecidos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pb-4">
              {!plan.targetCalories &&
              !plan.targetProtein &&
              !plan.targetCarbs &&
              !plan.targetFat ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No hay objetivos establecidos para este plan
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="20%"
                          outerRadius="80%"
                          barSize={20}
                          data={radialData}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <RadialBar
                            background
                            dataKey="value"
                            angleAxisId={0}
                            label={{
                              position: "insideStart",
                              fill: "#fff",
                              fontSize: 12,
                            }}
                            animationBegin={0}
                            animationDuration={1500}
                          />
                          <RechartsTooltip content={<CustomTooltip />} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <div className="space-y-4">
                      {targetComparison
                        .filter((item) => item.target > 0)
                        .map((item) => (
                          <div key={item.name} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: item.fill }}
                                ></div>
                                <span>{item.name}</span>
                              </div>
                              <Badge variant="outline">{item.pct}%</Badge>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(item.pct, 100)}%`,
                                  background: getGradientBackground(item.fill),
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                Actual: {item.actual} {item.unit}
                              </span>
                              <span>
                                Objetivo: {item.target} {item.unit}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {(plan.targetCalories ||
            plan.targetProtein ||
            plan.targetCarbs ||
            plan.targetFat) && (
            <Card>
              <CardHeader>
                <CardTitle>Detalle de Objetivos</CardTitle>
                <CardDescription>
                  Comparación detallada de valores actuales vs objetivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {targetComparison
                    .filter((item) => item.target > 0)
                    .map((item) => (
                      <Card key={item.name} className="border-0 shadow-none">
                        <CardHeader className="p-3 pb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.fill }}
                            ></div>
                            <CardTitle className="text-base">
                              {item.name}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Actual
                              </div>
                              <div className="text-lg font-medium">
                                {item.actual} {item.unit}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">
                                Objetivo
                              </div>
                              <div className="text-lg font-medium">
                                {item.target} {item.unit}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">
                                % del objetivo
                              </div>
                              <div className="text-lg font-medium">
                                {item.pct}%
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
