"use client";
import { Progress } from "@/components/ui/progress";
import { ArrowRight01Icon } from "hugeicons-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Session } from "next-auth";

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
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
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

    const profile = (session.user as Session["user"] & { profile: UserProfile })
      .profile;
    if (!profile || !profile.nutrition) return;

    analyticsData("today");
    // Configurar el usuario solo si hay cambios en la sesión
    setUser({
      id: profile.id,
      nutrition: {
        calorieTarget: profile.nutrition.calorieTarget,
        proteinTarget: profile.nutrition.proteinTarget,
        carbTarget: profile.nutrition.carbTarget,
        fatTarget: profile.nutrition.fatTarget,
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
    <div className="p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Resumen Nutricional
          </h2>
        </div>
        <Link
          href="/dashboard/nutrition"
          className="text-xs text-muted-foreground flex items-center gap-1"
        >
          Ver mas <ArrowRight01Icon className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {macros.map((macro, index) => {
          const percentage = calculatePercentage(macro.consumed, macro.goal);
          return (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium">{macro.name}</span>
                {/* <span className="text-sm">
                  {macro.consumed} / {macro.goal} {macro.unit}
                </span> */}
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
              <div className="py-1">
                <Progress value={percentage} className="h-2" />
              </div>
              {/* <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    percentage >= 100
                      ? "bg-red-500"
                      : percentage >= 80
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div> */}
            </div>
          );
        })}
      </div>

      {/* <div className="mt-4 pt-4 border-t">
        <h3 className="text-sm font-medium mb-2">Comidas de hoy</h3>
        <div className="space-y-2">
          {["Desayuno", "Almuerzo", "Merienda", "Cena"].map((meal, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-4 px-3 border rounded-lg"
            >
              <span className="text-sm">{meal}</span>
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
