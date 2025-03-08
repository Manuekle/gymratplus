"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

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

export default function MealHistoryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>("breakfast");
  const [activeTab, setActiveTab] = useState<"today" | "yesterday" | "week">(
    "today"
  );

  useEffect(() => {
    fetchMealLogs();
  }, [selectedDate]);

  const fetchMealLogs = async () => {
    setLoading(true);
    try {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(selectedDate);
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
          (a: MealLog, b: MealLog) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching meal logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = (mealType: string) => {
    setSelectedMealType(mealType);
    setAddMealOpen(true);
  };

  const handlePreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
    setActiveTab("yesterday");
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
    if (nextDay.toDateString() === new Date().toDateString()) {
      setActiveTab("today");
    } else {
      setActiveTab("yesterday");
    }
  };

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

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Historial de Comidas</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
            </span>
          </div>
          <Button variant="outline" size="icon" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="today"
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "today" | "yesterday" | "week")
          }
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger
              value="today"
              onClick={() => setSelectedDate(new Date())}
              disabled={
                new Date().toDateString() !== selectedDate.toDateString() &&
                activeTab === "today"
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
              onClick={() => {
                // Show current week view
                setSelectedDate(new Date());
              }}
            >
              Esta semana
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            {renderMealContent()}
          </TabsContent>

          <TabsContent value="yesterday" className="space-y-4">
            {renderMealContent()}
          </TabsContent>

          <TabsContent value="week" className="space-y-4">
            <div className="text-center py-4 text-muted-foreground">
              Resumen semanal en desarrollo
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  function renderMealContent() {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
        </div>
      );
    }

    if (mealLogs.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No hay comidas registradas para este día
          </p>
          <Button onClick={() => handleAddMeal("breakfast")}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar comida
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(mealsByType).map(([type, meals]) => (
          <div key={type} className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className="font-medium">{translateMealType(type)}</h3>
            </div>

            {meals.map((meal) => (
              <div key={meal.id} className="space-y-2">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(meal.date), "HH:mm", { locale: es })}
                  </span>
                  <span className="text-muted-foreground">
                    {meal.calories} kcal
                  </span>
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-accent">
                  {meal.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="grid grid-cols-12 text-sm items-center"
                    >
                      <div className="col-span-4 bg-amber-100">
                        {entry.quantity}
                        {entry.food.name}
                      </div>
                      <div className="col-span-2 text-right">
                        {Math.round(entry.food.calories * entry.quantity)} kcal
                      </div>
                      <div className="col-span-2 text-right">
                        {(entry.food.protein * entry.quantity).toFixed(1)}g P
                      </div>
                      <div className="col-span-4 text-right">
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
