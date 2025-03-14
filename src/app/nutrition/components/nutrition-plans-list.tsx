"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Edit,
  MoreHorizontal,
  Trash,
  PlusCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type NutritionPlan = {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  targetCalories: number | null;
  targetProtein: number | null;
  targetCarbs: number | null;
  targetFat: number | null;
  createdAt: string;
};

export function NutritionPlansList() {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/nutrition-plans");
        if (!response.ok) {
          throw new Error("Error al cargar los planes");
        }
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los planes de nutrición",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const deletePlan = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este plan?")) {
      return;
    }

    try {
      const response = await fetch(`/api/nutrition-plans/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el plan");
      }

      setPlans(plans.filter((plan) => plan.id !== id));
      toast({
        title: "Plan eliminado",
        description: "El plan de nutrición ha sido eliminado correctamente",
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el plan de nutrición",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <h3 className="text-xl font-medium mb-2">
          No tienes planes de nutrición
        </h3>
        <p className="text-muted-foreground mb-6">
          Crea tu primer plan de nutrición para comenzar a gestionar tu
          alimentación
        </p>
        <Link href="/nutrition/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Plan de Nutrición
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card key={plan.id} className={plan.isActive ? "border-primary" : ""}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="mr-2">{plan.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Acciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href={`/nutrition/edit/${plan.id}`}>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={() => deletePlan(plan.id)}>
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription>
              {plan.isActive && <Badge className="mr-2">Activo</Badge>}
              {plan.description || "Sin descripción"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {(plan.startDate || plan.endDate) && (
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Calendar className="mr-2 h-4 w-4" />
                {plan.startDate && (
                  <span>
                    {format(new Date(plan.startDate), "d MMM yyyy", {
                      locale: es,
                    })}
                  </span>
                )}
                {plan.startDate && plan.endDate && (
                  <span className="mx-1">-</span>
                )}
                {plan.endDate && (
                  <span>
                    {format(new Date(plan.endDate), "d MMM yyyy", {
                      locale: es,
                    })}
                  </span>
                )}
              </div>
            )}
            <div className="space-y-1">
              {plan.targetCalories && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Calorías:</span>
                  <span>{plan.targetCalories} kcal</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Macros:</span>
                <span>
                  {plan.targetProtein ? `P: ${plan.targetProtein}g` : ""}
                  {plan.targetCarbs ? ` C: ${plan.targetCarbs}g` : ""}
                  {plan.targetFat ? ` G: ${plan.targetFat}g` : ""}
                  {!plan.targetProtein &&
                    !plan.targetCarbs &&
                    !plan.targetFat &&
                    "No definidos"}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/nutrition/plans/${plan.id}`} className="w-full">
              <Button variant="outline" className="w-full">
                Ver Detalles
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
