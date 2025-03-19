"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";

import { useRouter } from "next/navigation";
import { Download05Icon, FloppyDiskIcon } from "hugeicons-react";
import { WorkoutPlan } from "./workouts/workout-plan";
import { MealPlan } from "./nutrition/meal-plan";

export type Recommendations = {
  workoutPlan: {
    id: string;
    name: string;
    description: string;
    days: Array<{
      day: string;
      exercises: Array<{
        id: string;
        name: string;
        sets: number;
        reps: number;
        restTime: number;
        notes?: string;
      }>;
    }>;
  };
  nutritionPlan: {
    macros: {
      protein: string;
      carbs: string;
      fat: string;
      description: string;
    };
    meals: {
      breakfast: {
        id: string;
        mealType: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        entries: Array<{
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
            serving: number;
            category: string;
          };
        }>;
      };
      lunch: {
        id: string;
        mealType: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        entries: Array<{
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
            serving: number;
            category: string;
          };
        }>;
      };
      dinner: {
        id: string;
        mealType: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        entries: Array<{
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
            serving: number;
            category: string;
          };
        }>;
      };
      snacks: {
        id: string;
        mealType: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        entries: Array<{
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
            serving: number;
            category: string;
          };
        }>;
      };
    };
  };
};

export default function RecommendationsComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] =
    useState<Recommendations | null>(null);

  const [error, setError] = useState<string | null>(null);
  // const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Primero intentamos obtener el perfil de la API
        const response = await fetch("/api/profile");

        if (response.ok) {
          const profileData = await response.json();
          // setProfile(profileData);
          return profileData;
        } else {
          // Si no hay perfil en la API, intentamos obtenerlo del localStorage
          const localProfile = localStorage.getItem("profileFormData");
          if (localProfile) {
            return JSON.parse(localProfile);
          }
          throw new Error("No profile found");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(
          "No se encontró un perfil. Por favor, complete su perfil primero."
        );
        return null;
      }
    };

    const fetchRecommendations = async (profileData) => {
      if (!profileData) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch recommendations");
        }

        const data = await response.json();
        setRecommendations(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError(
          "No se pudieron generar las recomendaciones. Por favor, inténtelo de nuevo más tarde."
        );
        toast.error("Failed to generate recommendations", {
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const init = async () => {
      const profileData = await fetchProfile();
      if (profileData) {
        fetchRecommendations(profileData);
      }
    };

    init();
  }, []);

  const handleSavePlan = async () => {
    if (!recommendations) return;

    setSaving(true);
    try {
      // Guardar el plan de entrenamiento
      const response = await fetch("/api/save-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workoutPlanId: recommendations.workoutPlan.id,
          nutritionPlanIds: {
            breakfast: recommendations.nutritionPlan.meals.breakfast.id,
            lunch: recommendations.nutritionPlan.meals.lunch.id,
            dinner: recommendations.nutritionPlan.meals.dinner.id,
            snacks: recommendations.nutritionPlan.meals.snacks.id,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save plan");
      }

      toast.success("Plan guardado correctamente", {
        description: "Puedes acceder a él desde tu perfil",
      });
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Error al guardar el plan", {
        description: "Por favor, inténtelo de nuevo más tarde",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <span className="mr-2">Tu Plan de Fitness Personalizado</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Según su perfil, hemos creado planes personalizados de entrenamiento y
          nutrición para usted
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Icons.spinner className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm">
              Generando tus recomendaciones personalizadas...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-[#DE3163] text-sm pb-14">{error}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/profile")}
              className="text-xs"
            >
              Volver al Perfil
            </Button>
          </div>
        ) : recommendations ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs defaultValue="workout" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 ">
                <TabsTrigger value="workout">Plan de Entrenamiento</TabsTrigger>
                <TabsTrigger value="nutrition">Plan Nutricional</TabsTrigger>
              </TabsList>

              <TabsContent value="workout" className="mt-0">
                <WorkoutPlan
                  workoutPlan={recommendations.workoutPlan}
                  isLoading={isLoading}
                  defaultOpen={["Día 1-0"]}
                />
              </TabsContent>

              <TabsContent value="nutrition" className="mt-0">
                <MealPlan
                  nutritionPlan={recommendations.nutritionPlan}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
            {/* <div className="flex justify-end mt-6">
              <Button
                onClick={handleSavePlan}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {saving ? "Guardando" : "Guardar"}
              </Button>
            </div> */}
          </motion.div>
        ) : null}
      </CardContent>
    </Card>
  );
}
