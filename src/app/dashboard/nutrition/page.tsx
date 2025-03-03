"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalorieChart } from "@/components/calorie-chart";
import { MealHistory } from "@/components/meal-history";
import { Bread04Icon, ChickenThighsIcon, FishFoodIcon } from "hugeicons-react";

export default function NutritionPage() {
  // Daily nutrition data
  const calories = {
    total: 2500,
    consumed: 1850,
    remaining: 650,
  };

  const macros = {
    protein: { target: 180, consumed: 105 },
    carbs: { target: 250, consumed: 200 },
    fat: { target: 80, consumed: 80 },
  };

  return (
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
                  <div className="text-3xl font-bold">{calories.consumed}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Objetivo</div>
                  <div className="text-3xl font-bold">{calories.total}</div>
                </div>
              </div>

              <Progress
                value={(calories.consumed / calories.total) * 100}
                className="h-3"
              />

              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">Restantes: </span>
                  <span className="font-medium">{calories.remaining}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Progreso: </span>
                  <span className="font-medium">
                    {Math.round((calories.consumed / calories.total) * 100)}%
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <CalorieChart />
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
                    <ChickenThighsIcon size={18} />
                    <span className="text-sm">Proteínas</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">
                      {macros.protein.consumed}g
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      / {macros.protein.target}g
                    </span>
                  </div>
                </div>
                <Progress
                  value={
                    (macros.protein.consumed / macros.protein.target) * 100
                  }
                  className="h-2 "
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Bread04Icon size={18} />
                    <span className="text-sm">Carbohidratos</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">
                      {macros.carbs.consumed}g
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      / {macros.carbs.target}g
                    </span>
                  </div>
                </div>
                <Progress
                  value={(macros.carbs.consumed / macros.carbs.target) * 100}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <FishFoodIcon size={18} />
                    <span className="text-sm">Grasas</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{macros.fat.consumed}g</span>
                    <span className="text-muted-foreground">
                      {" "}
                      / {macros.fat.target}g
                    </span>
                  </div>
                </div>
                <Progress
                  value={(macros.fat.consumed / macros.fat.target) * 100}
                  className="h-2"
                />
              </div>

              {/* <div className="pt-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Distribución de macros
                </div>
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500"
                    style={{
                      width: `${
                        (macros.protein.target /
                          (macros.protein.target +
                            macros.carbs.target +
                            macros.fat.target)) *
                        100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-green-500"
                    style={{
                      width: `${
                        (macros.carbs.target /
                          (macros.protein.target +
                            macros.carbs.target +
                            macros.fat.target)) *
                        100
                      }%`,
                    }}
                  ></div>
                  <div
                    className="bg-yellow-500"
                    style={{
                      width: `${
                        (macros.fat.target /
                          (macros.protein.target +
                            macros.carbs.target +
                            macros.fat.target)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Historial de Comidas</CardTitle>
          <CardDescription>Registro de alimentos consumidos</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today">
            <TabsList className="mb-4">
              <TabsTrigger value="today">Hoy</TabsTrigger>
              <TabsTrigger value="yesterday">Ayer</TabsTrigger>
              <TabsTrigger value="week">Esta semana</TabsTrigger>
            </TabsList>

            <TabsContent value="today">
              <MealHistory />
            </TabsContent>

            <TabsContent value="yesterday">
              <MealHistory />
            </TabsContent>

            <TabsContent value="week">
              <MealHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
