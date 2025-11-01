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
import { WorkoutPlan } from "@/components/workouts/workout-plan";
import { MealPlan } from "@/components/nutrition/meal-plan";

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
  foodRecommendation: {
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
          "No se encontró un perfil. Por favor, complete su perfil primero.",
        );
        return null;
      }
    };

    interface ProfileData {
      [key: string]: unknown;
    }

    interface ErrorResponse {
      error?: string;
    }

    const fetchRecommendations = async (
      profileData: ProfileData,
    ): Promise<void> => {
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
          const errorData: ErrorResponse = await response.json();
          throw new Error(errorData.error || "Failed to fetch recommendations");
        }

        const data: Recommendations = await response.json();
        setRecommendations(data);
        setError(null);
      } catch (error: unknown) {
        console.error("Error fetching recommendations:", error);
        setError(
          "No se pudieron generar las recomendaciones. Por favor, inténtelo de nuevo más tarde.",
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-heading">
          Tu Plan de Fitness Personalizado
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Según su perfil, hemos creado planes personalizados de entrenamiento y
          nutrición para usted
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Icons.spinner className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-xs">
              Generando tus recomendaciones personalizadas
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive text-xs pb-14">{error}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/profile")}
              className="text-xs"
              size="sm"
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
                <TabsTrigger value="workout">Entrenamiento</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrición</TabsTrigger>
              </TabsList>

              <TabsContent value="workout" className="mt-0">
                <WorkoutPlan
                  workoutPlan={recommendations.workoutPlan}
                  isLoading={isLoading}
                  defaultOpen={["Día 1-0"]}
                />
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold tracking-heading">
                    Recomendaciones
                  </h3>
                  <div className="space-y-3">
                    {recommendations?.recommendations?.map(
                      (recommendation: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {recommendation}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="nutrition" className="mt-0">
                <MealPlan
                  foodRecommendation={recommendations.foodRecommendation}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
            {/* aqui un boton de ir a profile */}
            <div className="mt-8">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/profile")}
                className="text-xs w-full"
                size="lg"
              >
                Volver al Perfil
              </Button>
            </div>
          </motion.div>
        ) : null}
      </CardContent>
    </Card>
  );
}
