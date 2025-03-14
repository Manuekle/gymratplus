import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { NutritionPlanMeals } from "@/components/nutrition/nutrition-plan-meals";
import { NutritionPlanSupplements } from "@/components/nutrition/nutrition-plan-supplements";
// import { NutritionPlanSummary } from "@/components/nutrition/nutrition-plan-summary";
import { ArrowLeft01Icon } from "hugeicons-react";

export const metadata: Metadata = {
  title: "Detalles del Plan de Nutrición",
  description: "Ver y editar los detalles de tu plan de nutrición",
};

async function getNutritionPlan(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  const prisma = new PrismaClient();

  try {
    const plan = await prisma.nutritionPlan.findUnique({
      where: {
        id,
      },
      include: {
        supplements: {
          include: {
            supplement: true,
          },
        },
        days: {
          include: {
            meals: {
              include: {
                food: true,
                recipe: true,
              },
            },
          },
        },
      },
    });

    if (!plan || plan.userId !== session.user.id) {
      return null;
    }

    return plan;
  } catch (error) {
    console.error("Error fetching nutrition plan:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function NutritionPlanPage({
  params,
}: {
  params: { id: string };
}) {
  const plan = await getNutritionPlan(params.id);

  if (!plan) {
    notFound();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard/nutrition">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              <ArrowLeft01Icon className="h-4 w-4" />
              Volver a la lista
            </Button>
          </Link>
        </div>
        <Link href={`/dashboard/nutrition/plans/${plan.id}/edit`}>
          <Button size="sm" className="text-xs">
            Editar
          </Button>
        </Link>
      </div>
      <div className="flex flex-row gap-2 items-center mb-6">
        <h2 className="text-2xl font-bold ml-2 capitalize">{plan.name}</h2>
        {plan.isActive && <Badge className="ml-2">activo</Badge>}
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Detalles del Plan</CardTitle>
          <CardDescription>
            {plan.description || "Sin descripción"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Fecha de Inicio</p>
              <p className="text-sm text-muted-foreground">
                {plan.startDate
                  ? new Date(plan.startDate).toLocaleDateString()
                  : "No definida"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Fecha de Fin</p>
              <p className="text-sm text-muted-foreground">
                {plan.endDate
                  ? new Date(plan.endDate).toLocaleDateString()
                  : "No definida"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Calorías Objetivo</p>
              <p className="text-sm text-muted-foreground">
                {plan.targetCalories
                  ? `${plan.targetCalories} kcal`
                  : "No definidas"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Macronutrientes</p>
              <p className="text-sm text-muted-foreground">
                {plan.targetProtein ? `P: ${plan.targetProtein}g` : ""}
                {plan.targetCarbs ? ` C: ${plan.targetCarbs}g` : ""}
                {plan.targetFat ? ` G: ${plan.targetFat}g` : ""}
                {!plan.targetProtein &&
                  !plan.targetCarbs &&
                  !plan.targetFat &&
                  "No definidos"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="meals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="meals">Comidas</TabsTrigger>
          <TabsTrigger value="supplements">Suplementos</TabsTrigger>
          {/* <TabsTrigger value="summary">Resumen</TabsTrigger> */}
        </TabsList>
        <TabsContent value="meals">
          <NutritionPlanMeals plan={plan} />
        </TabsContent>
        <TabsContent value="supplements">
          <NutritionPlanSupplements plan={plan} />
        </TabsContent>
        {/* <TabsContent value="summary">
          <NutritionPlanSummary plan={plan} />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
