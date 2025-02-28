"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddMealForm } from "@/components/nutrition/add-meal-form";
import { FoodSearch } from "@/components/nutrition/food-search";

// Datos de ejemplo
const userGoals = {
  calories: 2200,
  protein: 150,
  carbs: 220,
  fat: 70,
};

const mealTypes = [
  { id: "breakfast", label: "Desayuno" },
  { id: "lunch", label: "Almuerzo" },
  { id: "dinner", label: "Cena" },
  { id: "snack", label: "Merienda" },
];

// Datos de ejemplo para las comidas
const initialMeals = [
  {
    id: "meal1",
    date: new Date(),
    type: "breakfast",
    foods: [
      {
        id: "food1",
        name: "Avena",
        quantity: 100,
        calories: 350,
        protein: 10,
        carbs: 60,
        fat: 6,
      },
      {
        id: "food2",
        name: "Plátano",
        quantity: 1,
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.4,
      },
    ],
  },
  {
    id: "meal2",
    date: new Date(),
    type: "lunch",
    foods: [
      {
        id: "food3",
        name: "Pechuga de pollo",
        quantity: 200,
        calories: 330,
        protein: 62,
        carbs: 0,
        fat: 7,
      },
      {
        id: "food4",
        name: "Arroz integral",
        quantity: 150,
        calories: 160,
        protein: 3.5,
        carbs: 33,
        fat: 1.2,
      },
      {
        id: "food5",
        name: "Brócoli",
        quantity: 100,
        calories: 55,
        protein: 3.7,
        carbs: 11.2,
        fat: 0.6,
      },
    ],
  },
];

export function MealTracker() {
  const [date, setDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState(initialMeals);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(mealTypes[0].id);

  // Función para calcular los totales nutricionales del día seleccionado
  const calculateDailyTotals = () => {
    const dailyMeals = meals.filter(
      (meal) => format(meal.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );

    const totals = dailyMeals.reduce(
      (acc, meal) => {
        meal.foods.forEach((food) => {
          acc.calories += food.calories;
          acc.protein += food.protein;
          acc.carbs += food.carbs;
          acc.fat += food.fat;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return totals;
  };

  const dailyTotals = calculateDailyTotals();

  // Progreso hacia los objetivos diarios
  const calculateProgress = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  // Función para añadir una nueva comida
  const handleAddMeal = (mealData: any) => {
    const newMeal = {
      id: `meal-${Date.now()}`,
      date: date,
      type: selectedMealType,
      foods: mealData.foods,
    };

    setMeals([...meals, newMeal]);
    setIsAddMealOpen(false);
  };

  // Función para cambiar la fecha
  const changeDate = (increment: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + increment);
    setDate(newDate);
  };

  // Obtener comidas del día seleccionado agrupadas por tipo
  const getMealsByType = (type: string) => {
    return meals.filter(
      (meal) =>
        format(meal.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
        meal.type === type
    );
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Seguimiento de alimentos</CardTitle>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeDate(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[200px] pl-3 text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(day) => day && setDate(day)}
                  disabled={(date) =>
                    date > new Date() || date < new Date("2000-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changeDate(1)}
              disabled={
                format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Calorías</h3>
                <div className="flex justify-between mb-1 text-sm">
                  <span>{dailyTotals.calories} kcal</span>
                  <span>{userGoals.calories} kcal</span>
                </div>
                <Progress
                  value={calculateProgress(
                    dailyTotals.calories,
                    userGoals.calories
                  )}
                  className="h-2"
                />
              </div>
              <div>
                <h3 className="font-medium mb-2">Proteínas</h3>
                <div className="flex justify-between mb-1 text-sm">
                  <span>{dailyTotals.protein.toFixed(1)} g</span>
                  <span>{userGoals.protein} g</span>
                </div>
                <Progress
                  value={calculateProgress(
                    dailyTotals.protein,
                    userGoals.protein
                  )}
                  className="h-2 bg-slate-200"
                  indicatorClassName="bg-blue-500"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Carbohidratos</h3>
                <div className="flex justify-between mb-1 text-sm">
                  <span>{dailyTotals.carbs.toFixed(1)} g</span>
                  <span>{userGoals.carbs} g</span>
                </div>
                <Progress
                  value={calculateProgress(dailyTotals.carbs, userGoals.carbs)}
                  className="h-2 bg-slate-200"
                  indicatorClassName="bg-green-500"
                />
              </div>
              <div>
                <h3 className="font-medium mb-2">Grasas</h3>
                <div className="flex justify-between mb-1 text-sm">
                  <span>{dailyTotals.fat.toFixed(1)} g</span>
                  <span>{userGoals.fat} g</span>
                </div>
                <Progress
                  value={calculateProgress(dailyTotals.fat, userGoals.fat)}
                  className="h-2 bg-slate-200"
                  indicatorClassName="bg-yellow-500"
                />
              </div>
            </div>
          </div>

          <Tabs defaultValue="breakfast">
            <TabsList className="grid grid-cols-4 mb-4">
              {mealTypes.map((type) => (
                <TabsTrigger key={type.id} value={type.id}>
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {mealTypes.map((type) => {
              const mealsOfType = getMealsByType(type.id);
              return (
                <TabsContent
                  key={type.id}
                  value={type.id}
                  className="space-y-4"
                >
                  {mealsOfType.length > 0 ? (
                    mealsOfType.map((meal) => (
                      <div key={meal.id} className="bg-slate-50 rounded-lg p-4">
                        <h3 className="font-medium mb-2">{type.label}</h3>
                        <div className="space-y-2">
                          {meal.foods.map((food) => (
                            <div
                              key={food.id}
                              className="flex justify-between border-b pb-2"
                            >
                              <div>
                                <p className="font-medium">{food.name}</p>
                                <p className="text-sm text-gray-500">
                                  {food.quantity} g
                                </p>
                              </div>
                              <div className="text-right">
                                <p>{food.calories} kcal</p>
                                <p className="text-sm text-gray-500">
                                  P: {food.protein}g | C: {food.carbs}g | G:{" "}
                                  {food.fat}g
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-8 text-center">
                      <p className="text-gray-500 mb-4">
                        No hay alimentos registrados para este tipo de comida
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="bg-indigo-600 text-white hover:bg-indigo-700"
                            onClick={() => {
                              setSelectedMealType(type.id);
                              setIsAddMealOpen(true);
                            }}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir {type.label.toLowerCase()}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>
                              Añadir {type.label.toLowerCase()}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <AddMealForm onSubmit={handleAddMeal} />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
