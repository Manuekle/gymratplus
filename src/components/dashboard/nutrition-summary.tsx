"use client";
import { Progress } from "@/components/ui/progress";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface UserProfile {
  id: string;
  nutrition: {
    calorieTarget: number;
    proteinTarget: number;
    carbTarget: number;
    fatTarget: number;
  };
  waterIntake: number;
  goal: string;
  createdAt: string;
  updatedAt: string;
}

type MealLog = {
  id: string;
  mealType: string;
  consumedAt: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  food: { name: string } | null;
  recipe: { name: string } | null;
};

type TodayData = {
  todayLogs: MealLog[];
  todayTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  mealTypeGroups: Record<
    string,
    {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }
  >;
};

export default function NutritionSummary() {
  const { data: session } = useSession();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [todayData, setTodayData] = useState<TodayData | null>(null);

  const analyticsData = async (type: string) => {
    // setLoading(true);
    try {
      const response = await fetch(`/api/nutrition-analytics?type=${type}`);
      if (!response.ok) {
        throw new Error("Error al cargar los datos de análisis");
      }
      const data = await response.json();

      setTodayData(data);
    } catch {
      // toast({
      //   title: "Error",
      //   description: "No se pudieron cargar los datos de análisis",
      //   variant: "destructive",
      // });
      toast.error("Error", {
        description: "No se pudieron cargar los datos de análisis",
      });
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    // Si no hay usuario en la sesión, no hacemos nada
    if (!session?.user) return;

    interface ExtendedSessionUser {
      profile: {
        id: string;
        dailyCalorieTarget: number | string;
        dailyProteinTarget: number | string;
        dailyCarbTarget: number | string;
        dailyFatTarget: number | string;
        waterIntake: number | string;
        goal: string;
        createdAt: string;
        updatedAt: string;
      };
    }

    const profile = (session.user as unknown as ExtendedSessionUser)?.profile;
    if (!profile) return;

    analyticsData("today");
    // Configurar el usuario solo si hay cambios en la sesión
    setUser({
      id: profile.id,
      nutrition: {
        calorieTarget: Number(profile.dailyCalorieTarget),
        proteinTarget: Number(profile.dailyProteinTarget),
        carbTarget: Number(profile.dailyCarbTarget),
        fatTarget: Number(profile.dailyFatTarget),
      },
      waterIntake: Number(profile.waterIntake),
      goal: profile.goal,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  }, [session?.user]);

  const macros = [
    {
      name: "Calorías",
      consumed: todayData?.todayTotals.calories ?? 0,
      goal: user?.nutrition.calorieTarget ?? 0,
      unit: "kcal",
    },
    {
      name: "Proteínas",
      consumed: todayData?.todayTotals.protein ?? 0,
      goal: user?.nutrition.proteinTarget ?? 0,
      unit: "g",
    },
    {
      name: "Carbohidratos",
      consumed: todayData?.todayTotals.carbs ?? 0,
      goal: user?.nutrition.carbTarget ?? 0,
      unit: "g",
    },
    {
      name: "Grasas",
      consumed: todayData?.todayTotals.fat ?? 0,
      goal: user?.nutrition.fatTarget ?? 0,
      unit: "g",
    },
  ];

  const calculatePercentage = (consumed: number, goal: number) => {
    return Math.min(Math.round((consumed / goal) * 100), 100);
  };

  return (
    <div className="p-4 md:p-6 rounded-lg border bg-card">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-heading">
            Resumen Nutricional
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Consumo de hoy</p>
        </div>
        <Link
          href="/dashboard/nutrition"
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors self-start sm:self-auto"
        >
          Ver más
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <div className="space-y-4">
        {macros.map((macro, index) => {
          const percentage = calculatePercentage(macro.consumed, macro.goal);
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium">{macro.name}</span>
                <div className="text-xs">
                  <span className="font-medium">
                    {Math.round(macro.consumed ?? 0)}
                    {macro.unit}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    / {macro.goal}
                    {macro.unit}
                  </span>
                </div>
              </div>
              <Progress value={percentage} className="h-1.5" />
            </div>
          );
        })}
      </div>

      {/* <div className="mt-4 pt-4 border-t">
        <h3 className="text-xs font-medium mb-2">Comidas de hoy</h3>
        <div className="space-y-2">
          {["Desayuno", "Almuerzo", "Merienda", "Cena"].map((meal, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-4 px-3 border rounded-lg"
            >
              <span className="text-xs">{meal}</span>
              {index <= 1 ? (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Completado
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Pendiente</span>
              )}
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}
