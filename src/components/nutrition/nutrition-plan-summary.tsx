"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type MealPlanItem = {
  id: string
  mealType: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

type NutritionDay = {
  id: string
  dayNumber: number
  dayName: string | null
  meals: MealPlanItem[]
}

type NutritionPlan = {
  id: string
  targetCalories: number | null
  targetProtein: number | null
  targetCarbs: number | null
  targetFat: number | null
  days: NutritionDay[]
}

export function NutritionPlanSummary({ plan }: { plan: NutritionPlan }) {
  const [activeTab, setActiveTab] = useState("macros")

  // Calculate daily totals
  const dailyTotals = plan.days.map((day) => {
    const totals = day.meals.reduce(
      (acc, meal) => {
        return {
          calories: acc.calories + meal.calories,
          protein: acc.protein + meal.protein,
          carbs: acc.carbs + meal.carbs,
          fat: acc.fat + meal.fat,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )

    return {
      day: day.dayNumber,
      dayName: day.dayName || `Día ${day.dayNumber}`,
      ...totals,
      proteinPct: Math.round(((totals.protein * 4) / totals.calories) * 100) || 0,
      carbsPct: Math.round(((totals.carbs * 4) / totals.calories) * 100) || 0,
      fatPct: Math.round(((totals.fat * 9) / totals.calories) * 100) || 0,
    }
  })

  // Calculate meal type distribution
  const mealTypeData = plan.days
    .flatMap((day) => day.meals)
    .reduce(
      (acc, meal) => {
        const mealType = meal.mealType
        if (!acc[mealType]) {
          acc[mealType] = {
            name: getMealTypeLabel(mealType),
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            count: 0,
          }
        }

        acc[mealType].calories += meal.calories
        acc[mealType].protein += meal.protein
        acc[mealType].carbs += meal.carbs
        acc[mealType].fat += meal.fat
        acc[mealType].count += 1

        return acc
      },
      {} as Record<
        string,
        { name: string; calories: number; protein: number; carbs: number; fat: number; count: number }
      >,
    )

  const mealTypeChartData = Object.values(mealTypeData).map((data) => ({
    ...data,
    calories: Math.round(data.calories / plan.days.length),
    protein: Math.round(data.protein / plan.days.length),
    carbs: Math.round(data.carbs / plan.days.length),
    fat: Math.round(data.fat / plan.days.length),
  }))

  // Calculate average macros
  const averageMacros = dailyTotals.reduce(
    (acc, day) => {
      return {
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fat: acc.fat + day.fat,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  const daysCount = dailyTotals.length || 1
  const avgCalories = Math.round(averageMacros.calories / daysCount)
  const avgProtein = Math.round(averageMacros.protein / daysCount)
  const avgCarbs = Math.round(averageMacros.carbs / daysCount)
  const avgFat = Math.round(averageMacros.fat / daysCount)

  const avgProteinPct = Math.round(((avgProtein * 4) / avgCalories) * 100) || 0
  const avgCarbsPct = Math.round(((avgCarbs * 4) / avgCalories) * 100) || 0
  const avgFatPct = Math.round(((avgFat * 9) / avgCalories) * 100) || 0

  // Calculate target comparison
  const targetComparison = [
    {
      name: "Calorías",
      actual: avgCalories,
      target: plan.targetCalories || 0,
      unit: "kcal",
      pct: plan.targetCalories ? Math.round((avgCalories / plan.targetCalories) * 100) : 0,
    },
    {
      name: "Proteínas",
      actual: avgProtein,
      target: plan.targetProtein || 0,
      unit: "g",
      pct: plan.targetProtein ? Math.round((avgProtein / plan.targetProtein) * 100) : 0,
    },
    {
      name: "Carbohidratos",
      actual: avgCarbs,
      target: plan.targetCarbs || 0,
      unit: "g",
      pct: plan.targetCarbs ? Math.round((avgCarbs / plan.targetCarbs) * 100) : 0,
    },
    {
      name: "Grasas",
      actual: avgFat,
      target: plan.targetFat || 0,
      unit: "g",
      pct: plan.targetFat ? Math.round((avgFat / plan.targetFat) * 100) : 0,
    },
  ]

  function getMealTypeLabel(mealType: string) {
    switch (mealType) {
      case "desayuno":
        return "Desayuno"
      case "almuerzo":
        return "Almuerzo"
      case "cena":
        return "Cena"
      case "snack":
        return "Snack"
      default:
        return mealType
    }
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Calorías Promedio</CardTitle>
            <CardDescription>Por día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCalories} kcal</div>
            {plan.targetCalories && (
              <p className="text-xs text-muted-foreground mt-1">
                {avgCalories < plan.targetCalories
                  ? `${plan.targetCalories - avgCalories} kcal por debajo del objetivo`
                  : avgCalories > plan.targetCalories
                    ? `${avgCalories - plan.targetCalories} kcal por encima del objetivo`
                    : "Coincide con el objetivo"}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Proteínas Promedio</CardTitle>
            <CardDescription>Por día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProtein}g</div>
            <p className="text-xs text-muted-foreground mt-1">{avgProteinPct}% de las calorías totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Carbohidratos Promedio</CardTitle>
            <CardDescription>Por día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCarbs}g</div>
            <p className="text-xs text-muted-foreground mt-1">{avgCarbsPct}% de las calorías totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Grasas Promedio</CardTitle>
            <CardDescription>Por día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgFat}g</div>
            <p className="text-xs text-muted-foreground mt-1">{avgFatPct}% de las calorías totales</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="macros">Macronutrientes</TabsTrigger>
          <TabsTrigger value="mealTypes">Tipos de Comida</TabsTrigger>
          <TabsTrigger value="targets">Objetivos</TabsTrigger>
        </TabsList>

        <TabsContent value="macros" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Macronutrientes por Día</CardTitle>
              <CardDescription>Calorías y macronutrientes para cada día del plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    calories: {
                      label: "Calorías",
                      color: "hsl(var(--chart-1))",
                    },
                    protein: {
                      label: "Proteínas (g)",
                      color: "hsl(var(--chart-2))",
                    },
                    carbs: {
                      label: "Carbohidratos (g)",
                      color: "hsl(var(--chart-3))",
                    },
                    fat: {
                      label: "Grasas (g)",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyTotals}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dayName" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="calories" fill="var(--color-calories)" name="Calorías" />
                      <Bar yAxisId="right" dataKey="protein" fill="var(--color-protein)" name="Proteínas (g)" />
                      <Bar yAxisId="right" dataKey="carbs" fill="var(--color-carbs)" name="Carbohidratos (g)" />
                      <Bar yAxisId="right" dataKey="fat" fill="var(--color-fat)" name="Grasas (g)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mealTypes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Tipo de Comida</CardTitle>
              <CardDescription>Calorías y macronutrientes promedio por tipo de comida</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    calories: {
                      label: "Calorías",
                      color: "hsl(var(--chart-1))",
                    },
                    protein: {
                      label: "Proteínas (g)",
                      color: "hsl(var(--chart-2))",
                    },
                    carbs: {
                      label: "Carbohidratos (g)",
                      color: "hsl(var(--chart-3))",
                    },
                    fat: {
                      label: "Grasas (g)",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mealTypeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="calories" fill="var(--color-calories)" name="Calorías" />
                      <Bar yAxisId="right" dataKey="protein" fill="var(--color-protein)" name="Proteínas (g)" />
                      <Bar yAxisId="right" dataKey="carbs" fill="var(--color-carbs)" name="Carbohidratos (g)" />
                      <Bar yAxisId="right" dataKey="fat" fill="var(--color-fat)" name="Grasas (g)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparación con Objetivos</CardTitle>
              <CardDescription>Comparación de los valores promedio con los objetivos establecidos</CardDescription>
            </CardHeader>
            <CardContent>
              {!plan.targetCalories && !plan.targetProtein && !plan.targetCarbs && !plan.targetFat ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No hay objetivos establecidos para este plan</p>
                </div>
              ) : (
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      actual: {
                        label: "Actual",
                        color: "hsl(var(--chart-1))",
                      },
                      target: {
                        label: "Objetivo",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={targetComparison.filter((item) => item.target > 0)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="actual" fill="var(--color-actual)" name="Actual" />
                        <Bar dataKey="target" fill="var(--color-target)" name="Objetivo" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}

              {(plan.targetCalories || plan.targetProtein || plan.targetCarbs || plan.targetFat) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {targetComparison
                    .filter((item) => item.target > 0)
                    .map((item) => (
                      <Card key={item.name} className="border-0 shadow-none">
                        <CardHeader className="p-3 pb-1">
                          <CardTitle className="text-base">{item.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-muted-foreground">Actual</div>
                              <div className="text-lg font-medium">
                                {item.actual} {item.unit}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Objetivo</div>
                              <div className="text-lg font-medium">
                                {item.target} {item.unit}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">% del objetivo</div>
                              <div className="text-lg font-medium">{item.pct}%</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

