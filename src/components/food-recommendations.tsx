/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ChocolateIcon, EggsIcon, FrenchFries02Icon, NoodlesIcon, RiceBowl01Icon, SteakIcon,  } from "@hugeicons/core-free-icons";
// cambiar todo
export default function FoodRecommendations() {
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<any>(null);
  const [foods, setFoods] = useState<Record<string, any>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/food-recommendations");
        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }
        const data = await response.json();

        // Parse JSON strings if needed
        const parsedData = data.map((item: any) => ({
          ...item,
          macros:
            typeof item.macros === "string"
              ? JSON.parse(item.macros)
              : item.macros,
          meals:
            typeof item.meals === "string"
              ? JSON.parse(item.meals)
              : item.meals,
        }));

        setRecommendations(parsedData);

        // Select the most recent recommendation by default
        if (parsedData.length > 0) {
          setSelectedRecommendation(parsedData[0]);
        }

        // Fetch foods to display names
        fetchFoods();
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        toast("Error", {
          description: "Failed to load food recommendations",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchFoods = async () => {
      try {
        const response = await fetch("/api/foods");
        if (!response.ok) {
          throw new Error("Failed to fetch foods");
        }
        const foodsData = await response.json();

        // Create a map of food IDs to food objects
        const foodsMap: Record<string, any> = {};
        foodsData.forEach((food: any) => {
          foodsMap[food.id] = food;
        });

        setFoods(foodsMap);
      } catch (error) {
        console.error("Error fetching foods:", error);
      }
    };

    fetchRecommendations();
  }, []);

  const formatMacro = (value: string) => {
    if (!value) return null;
    const [amount, percentage] = value.split(" ");
    return (
      <div className="flex flex-col">
        <span className="font-medium">{amount}</span>
        <span className="text-xs text-muted-foreground">{percentage}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4 max-w-md" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>

        {/* Macros Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-900 dark:to-gray-800">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-sky-50 to-white dark:from-sky-900 dark:to-gray-800">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-100 to-white dark:from-amber-900 dark:to-gray-800">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="breakfast">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger
              value="breakfast"
              className="data-[state=active]:bg-muted"
            >
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
            <TabsTrigger value="lunch" className="data-[state=active]:bg-muted">
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
            <TabsTrigger
              value="dinner"
              className="data-[state=active]:bg-muted"
            >
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
            <TabsTrigger
              value="snacks"
              className="data-[state=active]:bg-muted"
            >
              <Skeleton className="h-4 w-20" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="breakfast" className="mt-0">
            <div className="p-4 rounded-lg bg-card border border-border">
              {/* Meal Header */}
              <div className="mb-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full max-w-lg" />
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Skeleton className="h-4 w-20" />
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableHead>
                      <TableHead className="hidden md:table-cell text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(4)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="space-y-1">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold  tracking-heading">
            Tu Plan de Alimentación
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            No tienes ningún plan de alimentación guardado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground text-xs">
            Genera un plan de nutrición para ver las recomendaciones de alimentos.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Parse JSON strings if needed
  const macros =
    typeof selectedRecommendation.macros === "string"
      ? JSON.parse(selectedRecommendation.macros)
      : selectedRecommendation.macros;

  const meals =
    typeof selectedRecommendation.meals === "string"
      ? JSON.parse(selectedRecommendation.meals)
      : selectedRecommendation.meals;

  const mealTypes = {
    breakfast: {
      label: "Desayuno",
      icon: <HugeiconsIcon icon={EggsIcon} size={12} className="text-muted-foreground" />,
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
      icon: <HugeiconsIcon icon={ChocolateIcon} size={12} className="text-muted-foreground" />,
    },
  };

  return (
    <div>
      <div className="mb-4 flex md:flex-row flex-col justify-between w-full items-center gap-2">
        <Button
          variant="outline"
          className="text-xs"
          size="sm"
          onClick={() => router.push("/dashboard/nutrition")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" /> Volver a la lista
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold  tracking-heading">
            Tu Plan de Alimentación
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Según su perfil, hemos creado planes de nutrición para usted
          </CardDescription>
          <div className="flex justify-between items-center">
            {recommendations.length > 1 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Historial:
                </span>
                <select
                  className="text-sm border rounded p-1"
                  value={selectedRecommendation.id}
                  onChange={(e) => {
                    const selected = recommendations.find(
                      (r) => r.id === e.target.value,
                    );
                    if (selected) {
                      setSelectedRecommendation(selected);
                    }
                  }}
                >
                  {recommendations.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Protein</p>
            
          </div> */}
            <Card className="col-span-3 md:col-span-1 bg-gradient-to-br from-pink-50 to-white dark:from-pink-900 dark:to-gray-800">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xs text-muted-foreground">Proteínas</h1>
                    <h2 className="text-md font-medium">
                      {formatMacro(macros.protein)}
                    </h2>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center dark:bg-pink-800">
                    <HugeiconsIcon icon={SteakIcon} className="h-6 w-6 text-pink-600 dark:text-pink-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Carbs</p>
            {formatMacro(macros.carbs)}
          </div> */}
            <Card className="col-span-3 md:col-span-1 bg-gradient-to-br from-sky-50 to-white dark:from-sky-900 dark:to-gray-800">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xs text-muted-foreground">
                      Carbohidratos
                    </h1>
                    <h2 className="text-md font-medium">
                      {formatMacro(macros.carbs)}
                    </h2>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-800 flex items-center justify-center">
                    <HugeiconsIcon icon={RiceBowl01Icon} className="h-6 w-6 text-sky-600 dark:text-sky-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Fat</p>
            {formatMacro(macros.fat)}
          </div> */}
            <Card className="col-span-3 md:col-span-1 bg-gradient-to-br from-amber-100 to-white dark:from-amber-900 dark:to-gray-800">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xs text-muted-foreground">Grasas</h1>
                    <h2 className="text-md font-medium">
                      {formatMacro(macros.fat)}
                    </h2>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                    <HugeiconsIcon icon={FrenchFries02Icon} className="h-6 w-6 text-amber-600 dark:text-amber-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="breakfast" className="space-y-4 w-full">
            <TabsList className="mb-4 flex flex-wrap h-auto gap-4 w-full">
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

            {Object.entries(meals).map(([key, meal]: [string, any]) => (
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
                            meal.entries.map((entry: any, index: number) => {
                              const food = foods[entry.foodId] || {
                                name: `Alimento ${entry.foodId}`,
                                category: "Desconocido",
                                calories: 0,
                                protein: 0,
                                carbs: 0,
                                fat: 0,
                              };

                              return (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                      <span>{food.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {food.category}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(entry.quantity * 100)}g
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(food.calories * entry.quantity)}
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-center">
                                    {(food.protein * entry.quantity).toFixed(1)}
                                    g
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-center">
                                    {(food.carbs * entry.quantity).toFixed(1)}g
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-center">
                                    {(food.fat * entry.quantity).toFixed(1)}g
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="h-24 text-center"
                              >
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
        </CardContent>
      </Card>
    </div>
  );
}
