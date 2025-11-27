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
import { WorkoutGenerator } from "@/components/workout-generator/workout-generator";

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
  } | null;
  recommendations?: string[];
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

type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export default function RecommendationsComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] =
    useState<Recommendations | null>(null);
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel | null>(null);
  const [showWorkoutGenerator, setShowWorkoutGenerator] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      experienceLevel?: ExperienceLevel;
      trainingFrequency?: number;
      monthsTraining?: number;
      goal?: string;
      currentWeight?: number;
      height?: number;
      dietaryPreference?: string;
    }

    interface ErrorResponse {
      error?: string;
    }

    const fetchRecommendations = async (
      profileData: ProfileData,
    ): Promise<void> => {
      if (!profileData) return;

      // TODO: QUITAR ESTO DESPUÉS DE PROBAR - Solo para testing
      // Eliminar recomendaciones existentes antes de generar nuevas
      try {
        await fetch("/api/food-recommendations", {
          method: "DELETE",
        });
        console.log("✅ Recomendaciones existentes eliminadas para testing");
      } catch (error) {
        console.error("Error eliminando recomendaciones existentes:", error);
        // Continuar aunque falle la eliminación
      }

      // Determinar nivel de experiencia
      const level = determineExperienceLevel(profileData);
      setExperienceLevel(level);

      // Si es principiante, generar automáticamente
      if (level === "beginner") {
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
            throw new Error(
              errorData.error || "Failed to fetch recommendations",
            );
          }

          const data: Recommendations = await response.json();
          setRecommendations(data);
          setError(null);
        } catch (error: unknown) {
          console.error("Error fetching recommendations:", error);
          setError(
            "No se pudieron generar las recomendaciones. Por favor, inténtelo de nuevo más tarde.",
          );
          toast.error("Error al generar recomendaciones", {
            description: "Por favor, inténtalo de nuevo más tarde",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        // Intermedio/Avanzado: solo generar plan de alimentación
        setIsLoading(true);
        try {
          // TODO: QUITAR ESTO DESPUÉS DE PROBAR - Solo para testing
          // Eliminar recomendaciones existentes antes de generar nuevas
          try {
            await fetch("/api/food-recommendations", {
              method: "DELETE",
            });
            console.log(
              "✅ Recomendaciones existentes eliminadas para testing",
            );
          } catch (error) {
            console.error(
              "Error eliminando recomendaciones existentes:",
              error,
            );
            // Continuar aunque falle la eliminación
          }

          const response = await fetch("/api/recommendations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...profileData,
              skipWorkout: true, // Solo generar nutrición
            }),
          });

          if (!response.ok) {
            const errorData: ErrorResponse = await response.json();
            throw new Error(
              errorData.error || "Failed to fetch recommendations",
            );
          }

          const data: Recommendations = await response.json();
          setRecommendations(data);
          setError(null);
        } catch (error: unknown) {
          console.error("Error fetching recommendations:", error);
          setError(
            "No se pudo generar el plan de alimentación. Por favor, inténtelo de nuevo más tarde.",
          );
          toast.error("Error al generar plan de alimentación", {
            description: "Por favor, inténtalo de nuevo más tarde",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    // Función auxiliar para determinar el nivel de experiencia
    const determineExperienceLevel = (
      profile: ProfileData,
    ): ExperienceLevel => {
      // Verificar si viene en el perfil
      if (profile.experienceLevel) {
        return profile.experienceLevel as ExperienceLevel;
      }

      // Calcular basado en frecuencia de entrenamiento y meses entrenando
      const trainingFrequency = profile.trainingFrequency || 0;
      const monthsTraining = profile.monthsTraining || 0;

      if (trainingFrequency <= 2 || monthsTraining < 6) {
        return "beginner";
      }
      if (trainingFrequency <= 4 || monthsTraining < 18) {
        return "intermediate";
      }
      return "advanced";
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
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-heading">
          Tu Plan de Fitness Personalizado
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Según su perfil, hemos creado planes personalizados de entrenamiento y
          nutrición para usted
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
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
              size="default"
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
            {experienceLevel === "beginner" ? (
              // Principiante: mostrar ambos planes generados automáticamente
              <Tabs defaultValue="workout" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-auto gap-2 px-2">
                  <TabsTrigger value="workout" className="text-xs">
                    Entrenamiento
                  </TabsTrigger>
                  <TabsTrigger value="nutrition" className="text-xs">
                    Nutrición
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="workout" className="mt-0">
                  {recommendations.workoutPlan ? (
                    <>
                      <WorkoutPlan
                        workoutPlan={recommendations.workoutPlan}
                        isLoading={isLoading}
                        defaultOpen={["Día 1-0"]}
                      />
                      {recommendations?.recommendations &&
                        recommendations.recommendations.length > 0 && (
                          <div className="mt-8 space-y-4">
                            <h3 className="text-lg font-semibold tracking-heading">
                              Recomendaciones
                            </h3>
                            <div className="space-y-3">
                              {recommendations.recommendations.map(
                                (recommendation: string, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-3"
                                  >
                                    <div className="flex-shrink-0 mt-0.5">
                                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-xs font-medium text-primary">
                                          {index + 1}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {recommendation}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-xs mb-4">
                        No se pudo generar el plan de entrenamiento
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="nutrition" className="mt-0">
                  <MealPlan
                    foodRecommendation={recommendations.foodRecommendation}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              // Intermedio/Avanzado: mostrar plan de alimentación y opción para crear entrenamiento
              <Tabs defaultValue="nutrition" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-auto gap-2 px-2">
                  <TabsTrigger value="nutrition" className="text-xs">
                    Nutrición
                  </TabsTrigger>
                  <TabsTrigger value="workout" className="text-xs">
                    Entrenamiento
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="nutrition" className="mt-0">
                  <MealPlan
                    foodRecommendation={recommendations.foodRecommendation}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="workout" className="mt-0">
                  {showWorkoutGenerator ? (
                    <div className="space-y-4">
                      <Card className="bg-transparent border-none shadow-none">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold tracking-heading">
                            Crea tu Rutina Personalizada
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Diseña tu plan de entrenamiento según tus
                            preferencias y objetivos
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                          <WorkoutGenerator />
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold tracking-heading">
                          Crea tu Plan de Entrenamiento
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                          Como usuario{" "}
                          {experienceLevel === "intermediate"
                            ? "intermedio"
                            : "avanzado"}
                          , puedes crear tu propio plan de entrenamiento
                          personalizado basado en tus preferencias y objetivos.
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowWorkoutGenerator(true)}
                        className="text-xs"
                        size="default"
                      >
                        Crear Rutina Personalizada
                      </Button>
                      {recommendations.workoutPlan && (
                        <div className="mt-8">
                          <p className="text-xs text-muted-foreground mb-4">
                            O revisa el plan sugerido:
                          </p>
                          <WorkoutPlan
                            workoutPlan={recommendations.workoutPlan}
                            isLoading={false}
                            defaultOpen={["Día 1-0"]}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
            <div className="mt-8">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="text-xs"
                size="lg"
              >
                Ir al Dashboard
              </Button>
            </div>
          </motion.div>
        ) : null}
      </CardContent>
    </Card>
  );
}
