"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FrenchFries02Icon,
  RiceBowl01Icon,
  SteakIcon,
  Apple01Icon,
  NoodlesIcon,
} from "@hugeicons/core-free-icons";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  foodRecommendation: NutritionPlanType;
  isLoading?: boolean;
}

export function MealPlan({
  foodRecommendation,
  isLoading = false,
}: MealPlanProps) {

  if (isLoading) {
    return <MealPlanSkeleton />;
  }

  // Validar que foodRecommendation y foodRecommendation.macros existan
  if (!foodRecommendation || !foodRecommendation.macros) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No se encontró información del plan nutricional
          </p>
        </div>
      </div>
    );
  }

  const mealTypes = {
    breakfast: {
      label: "Desayuno",
      icon: <HugeiconsIcon icon={Apple01Icon} size={12} className="text-muted-foreground" />,
    },
    lunch: {
      label: "Almuerzo",
      icon: <HugeiconsIcon icon={NoodlesIcon} size={12} className="text-muted-foreground" />,
    },
    dinner: {
      label: "Cena",
      icon: <HugeiconsIcon icon={RiceBowl01Icon} size={12} className="text-muted-foreground" />,
    },
    snack: {
      label: "Snacks",
      icon: <HugeiconsIcon icon={FrenchFries02Icon} size={12} className="text-muted-foreground" />,
    },
  };

  const translatedText = foodRecommendation.macros.description;

  return (
    <div className="space-y-4">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="font-semibold text-lg tracking-heading">
            Plan Nutricional
          </CardTitle>
          <CardDescription className="text-xs">
            {translatedText}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-3 md:col-span-1 bg-gradient-to-br from-pink-50 to-white dark:from-pink-900 dark:to-gray-800">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Proteínas</p>
                    <p className="text-md font-medium">
                      {foodRecommendation.macros.protein}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center dark:bg-pink-800">
                    <HugeiconsIcon
                      icon={SteakIcon}
                      className="h-6 w-6 text-pink-600 dark:text-pink-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3 md:col-span-1 bg-gradient-to-br from-sky-50 to-white dark:from-sky-900 dark:to-gray-800">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Carbohidratos
                    </p>
                    <p className="text-md font-medium">
                      {foodRecommendation.macros.carbs}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-800 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={RiceBowl01Icon}
                      className="h-6 w-6 text-sky-600 dark:text-sky-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3 md:col-span-1 bg-gradient-to-br from-amber-100 to-white dark:from-amber-900 dark:to-gray-800">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Grasas</p>
                    <p className="text-md font-medium">
                      {foodRecommendation.macros.fat}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={FrenchFries02Icon}
                      className="h-6 w-6 text-amber-600 dark:text-amber-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
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

        {Object.entries(foodRecommendation.meals).map(([key, meal]) => {
          const tabValue = key === "snacks" ? "snack" : key;
          const mealTypeKey = key === "snacks" ? "snack" : (key as keyof typeof mealTypes);
          
          return (
            <TabsContent key={key} value={tabValue}>
              <Card>
                <CardHeader>
                  <CardTitle>{mealTypes[mealTypeKey].label}</CardTitle>
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
                        {meal.entries && meal.entries.length > 0 ? (
                          meal.entries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span>{entry.food?.name || "Alimento desconocido"}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {entry.food?.category || "N/A"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {Math.round((entry.quantity || 0) * 100)}g
                              </TableCell>
                              <TableCell className="text-center">
                                {Math.round((entry.food?.calories || 0) * (entry.quantity || 0))}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-center">
                                {((entry.food?.protein || 0) * (entry.quantity || 0)).toFixed(1)}g
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-center">
                                {((entry.food?.carbs || 0) * (entry.quantity || 0)).toFixed(1)}g
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-center">
                                {((entry.food?.fat || 0) * (entry.quantity || 0)).toFixed(1)}g
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
          );
        })}
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
