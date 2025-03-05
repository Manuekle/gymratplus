"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Apple01Icon,
  Bread01Icon,
  FrenchFries02Icon,
  NoodlesIcon,
  RiceBowl01Icon,
} from "hugeicons-react";

// Tipos para el plan de comidas
export type Food = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: number;
  category: string;
};

export type MealEntry = {
  id: string;
  foodId: string;
  quantity: number;
  food: Food;
};

export type Meal = {
  id: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: MealEntry[];
};

export type Macros = {
  protein: string;
  carbs: string;
  fat: string;
  description: string;
};

export type NutritionPlanType = {
  macros: Macros;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal;
  };
};

interface MealPlanProps {
  nutritionPlan: NutritionPlanType;
  isLoading?: boolean;
}

export function MealPlan({ nutritionPlan, isLoading = false }: MealPlanProps) {
  if (isLoading) {
    return <MealPlanSkeleton />;
  }

  const mealTypes = {
    breakfast: {
      label: "Desayuno",
      icon: <Apple01Icon size={12} className="text-muted-foreground" />,
    },
    lunch: {
      label: "Almuerzo",
      icon: <NoodlesIcon size={12} className="text-muted-foreground" />,
    },
    dinner: {
      label: "Cena",
      icon: <RiceBowl01Icon size={12} className="text-muted-foreground" />,
    },
    snack: {
      label: "Snacks",
      icon: <FrenchFries02Icon size={12} className="text-muted-foreground" />,
    },
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Plan Nutricional</CardTitle>
          <CardDescription>{nutritionPlan.macros.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#DE3163] text-white">
              <span className="text-md font-semibold">Proteínas</span>
              <span className="text-sm">{nutritionPlan.macros.protein}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#578FCA] text-white">
              <span className="text-md font-semibold">Carbohidratos</span>
              <span className="text-sm">{nutritionPlan.macros.carbs}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#FBA518] text-white">
              <span className="text-md font-semibold">Grasas</span>
              <span className="text-sm">{nutritionPlan.macros.fat}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="breakfast" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="breakfast">
            {mealTypes.breakfast.icon} {mealTypes.breakfast.label}
          </TabsTrigger>
          <TabsTrigger value="lunch">
            {mealTypes.lunch.icon} {mealTypes.lunch.label}
          </TabsTrigger>
          <TabsTrigger value="dinner">
            {mealTypes.dinner.icon} {mealTypes.dinner.label}
          </TabsTrigger>
          <TabsTrigger value="snack">
            {mealTypes.snack.icon} {mealTypes.snack.label}
          </TabsTrigger>
        </TabsList>

        {Object.entries(nutritionPlan.meals).map(([key, meal]) => (
          <TabsContent key={key} value={key === "snacks" ? "snack" : key}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {
                    mealTypes[
                      key === "snacks"
                        ? "snack"
                        : (key as keyof typeof mealTypes)
                    ].label
                  }
                </CardTitle>
                <CardDescription>
                  Calorías: {meal.calories} | Proteínas: {meal.protein}g |
                  Carbohidratos: {meal.carbs}g | Grasas: {meal.fat}g
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alimento</TableHead>
                        <TableHead className="w-[100px] text-center">
                          Cantidad
                        </TableHead>
                        <TableHead className="w-[100px] text-center">
                          Calorías
                        </TableHead>
                        <TableHead className="hidden md:table-cell text-center">
                          Proteínas
                        </TableHead>
                        <TableHead className="hidden md:table-cell text-center">
                          Carbos
                        </TableHead>
                        <TableHead className="hidden md:table-cell text-center">
                          Grasas
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meal.entries.length > 0 ? (
                        meal.entries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{entry.food.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {entry.food.category}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {entry.quantity * 100}g
                            </TableCell>
                            <TableCell className="text-center">
                              {Math.round(entry.food.calories * entry.quantity)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-center">
                              {(entry.food.protein * entry.quantity).toFixed(1)}
                              g
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-center">
                              {(entry.food.carbs * entry.quantity).toFixed(1)}g
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-center">
                              {(entry.food.fat * entry.quantity).toFixed(1)}g
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No hay alimentos registrados para esta comida.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function MealPlanSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-4 bg-primary/10 rounded-lg"
              >
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <Skeleton className="h-10 w-full mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <TableHead key={index}>
                        <Skeleton className="h-4 w-full" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 4 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 6 }).map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
