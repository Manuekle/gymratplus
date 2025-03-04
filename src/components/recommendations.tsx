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
import { Loader2, Dumbbell, Utensils, Save } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<any>(null);
  console.log(recommendations);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("workout");
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Primero intentamos obtener el perfil de la API
        const response = await fetch("/api/profile");

        if (response.ok) {
          const profileData = await response.json();
          setProfile(profileData);
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

      setLoading(true);
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
        setLoading(false);
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
          <span className="mr-2">Your Personalized Fitness Plan</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Based on your profile, we've created custom workout and nutrition
          plans for you
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-muted-foreground text-lg">
              Generating your personalized recommendations...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push("/dashboard/profile")}>
              Return to Profile
            </Button>
          </div>
        ) : recommendations ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs
              defaultValue="workout"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="workout" className="flex items-center">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  Workout Plan
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="flex items-center">
                  <Utensils className="mr-2 h-4 w-4" />
                  Nutrition Plan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="workout">
                <div className="space-y-6">
                  <div className="p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">
                      {recommendations.workoutPlan.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {recommendations.workoutPlan.description}
                    </p>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    {recommendations.workoutPlan.days.map((day, index) => (
                      <AccordionItem key={index} value={`day-${index}`}>
                        <AccordionTrigger className="text-lg font-medium">
                          {day.day}
                        </AccordionTrigger>
                        <AccordionContent>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-100">
                                <TableHead>Exercise</TableHead>
                                <TableHead className="text-center">
                                  Sets
                                </TableHead>
                                <TableHead className="text-center">
                                  Reps
                                </TableHead>
                                <TableHead className="text-center">
                                  Rest
                                </TableHead>
                                <TableHead>Notes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {day.exercises.map((exercise, exIndex) => (
                                <TableRow key={exIndex}>
                                  <TableCell className="font-medium">
                                    {exercise.name}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {exercise.sets}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {exercise.reps || "N/A"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {exercise.restTime}s
                                  </TableCell>
                                  <TableCell>{exercise.notes}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent value="nutrition">
                <div className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      Macronutrient Distribution
                    </h3>
                    <div className="flex flex-wrap gap-3 mb-2">
                      <Badge className="bg-red-500">
                        {recommendations.nutritionPlan.macros.protein} Protein
                      </Badge>
                      <Badge className="bg-yellow-500">
                        {recommendations.nutritionPlan.macros.carbs} Carbs
                      </Badge>
                      <Badge className="bg-blue-500">
                        {recommendations.nutritionPlan.macros.fat} Fat
                      </Badge>
                    </div>
                    <p className="text-green-700">
                      {recommendations.nutritionPlan.macros.description}
                    </p>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="breakfast">
                      <AccordionTrigger className="text-lg font-medium">
                        Breakfast
                      </AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-100">
                              <TableHead>Food</TableHead>
                              <TableHead className="text-center">
                                Quantity
                              </TableHead>
                              <TableHead className="text-center">
                                Calories
                              </TableHead>
                              <TableHead className="text-center">
                                Protein
                              </TableHead>
                              <TableHead className="text-center">
                                Carbs
                              </TableHead>
                              <TableHead className="text-center">Fat</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recommendations.nutritionPlan.meals.breakfast.entries.map(
                              (entry, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {entry.food.name}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(entry.quantity * 100)}g
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.calories * entry.quantity
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.protein * entry.quantity * 10
                                    ) / 10}
                                    g
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.carbs * entry.quantity * 10
                                    ) / 10}
                                    g
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.fat * entry.quantity * 10
                                    ) / 10}
                                    g
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                            <TableRow className="bg-gray-50 font-semibold">
                              <TableCell>Total</TableCell>
                              <TableCell></TableCell>
                              <TableCell className="text-center">
                                {
                                  recommendations.nutritionPlan.meals.breakfast
                                    .calories
                                }
                              </TableCell>
                              <TableCell className="text-center">
                                {
                                  recommendations.nutritionPlan.meals.breakfast
                                    .protein
                                }
                                g
                              </TableCell>
                              <TableCell className="text-center">
                                {
                                  recommendations.nutritionPlan.meals.breakfast
                                    .carbs
                                }
                                g
                              </TableCell>
                              <TableCell className="text-center">
                                {
                                  recommendations.nutritionPlan.meals.breakfast
                                    .fat
                                }
                                g
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="lunch">
                      <AccordionTrigger className="text-lg font-medium">
                        Lunch
                      </AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-100">
                              <TableHead>Food</TableHead>
                              <TableHead className="text-center">
                                Quantity
                              </TableHead>
                              <TableHead className="text-center">
                                Calories
                              </TableHead>
                              <TableHead className="text-center">
                                Protein
                              </TableHead>
                              <TableHead className="text-center">
                                Carbs
                              </TableHead>
                              <TableHead className="text-center">Fat</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recommendations.nutritionPlan.meals.lunch.entries.map(
                              (entry, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {entry.food.name}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(entry.quantity * 100)}g
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.calories * entry.quantity
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.protein * entry.quantity * 10
                                    ) / 10}
                                    g
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.carbs * entry.quantity * 10
                                    ) / 10}
                                    g
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.fat * entry.quantity * 10
                                    ) / 10}
                                    g
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                            <TableRow className="bg-gray-50 font-semibold">
                              <TableCell>Total</TableCell>
                              <TableCell></TableCell>
                              <TableCell className="text-center">
                                {
                                  recommendations.nutritionPlan.meals.lunch
                                    .calories
                                }
                              </TableCell>
                              <TableCell className="text-center">
                                {
                                  recommendations.nutritionPlan.meals.lunch
                                    .protein
                                }
                                g
                              </TableCell>
                              <TableCell className="text-center">
                                {
                                  recommendations.nutritionPlan.meals.lunch
                                    .carbs
                                }
                                g
                              </TableCell>
                              <TableCell className="text-center">
                                {recommendations.nutritionPlan.meals.lunch.fat}g
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="dinner">
                      <AccordionTrigger className="text-lg font-medium">
                        Dinner
                      </AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-100">
                              <TableHead>Food</TableHead>
                              <TableHead className="text-center">
                                Quantity
                              </TableHead>
                              <TableHead className="text-center">
                                Calories
                              </TableHead>
                              <TableHead className="text-center">
                                Protein
                              </TableHead>
                              <TableHead className="text-center">
                                Carbs
                              </TableHead>
                              <TableHead className="text-center">Fat</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recommendations.nutritionPlan.meals.dinner.entries.map(
                              (entry, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {entry.food.name}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(entry.quantity * 100)}g
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.calories * entry.quantity
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.protein * entry.quantity * 10
                                    ) / 10}
                                    g
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.carbs * entry.quantity * 10
                                    ) / 10}
                                    g
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.fat * entry.quantity * 10
                                    ) / 10}
                                    g
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                            <TableRow className="bg-gray-50 font-semibold">
                              <TableCell>Total</TableCell>
                              <TableCell></TableCell>
                              <TableCell className="text-center">
                                {
                                  recommendations.nutritionPlan.meals.dinner
                                    .calories
                                }
                              </TableCell>
                              <TableCell className="text-center">
                                {
                                  recommendations.nutritionPlan.meals.dinner
                                    .protein
                                }
                                g
                              </TableCell>
                              <TableCell className="text-center">
                                {
                                  recommendations.nutritionPlan.meals.dinner
                                    .carbs
                                }
                                g
                              </TableCell>
                              <TableCell className="text-center">
                                {recommendations.nutritionPlan.meals.dinner.fat}
                                g
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="snacks">
                      <AccordionTrigger className="text-lg font-medium">
                        Snacks
                      </AccordionTrigger>
                      <AccordionContent>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-100">
                              <TableHead>Food</TableHead>
                              <TableHead className="text-center">
                                Quantity
                              </TableHead>
                              <TableHead className="text-center">
                                Calories
                              </TableHead>
                              <TableHead className="text-center">
                                Protein
                              </TableHead>
                              <TableHead className="text-center">
                                Carbs
                              </TableHead>
                              <TableHead className="text-center">Fat</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {recommendations.nutritionPlan.meals.snacks.entries.map(
                              (entry, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {entry.food.name}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(entry.quantity * 100)}g
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.calories * entry.quantity
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.protein * entry.quantity * 10
                                    ) / 10}
                                    g
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.carbs * entry.quantity * 10
                                    ) / 10}
                                    g
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {Math.round(
                                      entry.food.fat * entry.quantity * 10
                                    ) / 10}
                                    g
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                            <TableRow className="bg-gray-50 font-semibold">
                              <TableCell>Total</TableCell>
                              <TableCell></TableCell>
                              <TableCell className="text-center">
                                {
                                  recommendations.nutritionPlan.meals.snacks
                                    .calories
                                }
                              </TableCell>
                              <TableCell className="text-center">
                                {
                                  recommendations.nutritionPlan.meals.snacks
                                    .protein
                                }
                                g
                              </TableCell>
                              <TableCell className="text-center">
                                {
                                  recommendations.nutritionPlan.meals.snacks
                                    .carbs
                                }
                                g
                              </TableCell>
                              <TableCell className="text-center">
                                {recommendations.nutritionPlan.meals.snacks.fat}
                                g
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSavePlan}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Guardando..." : "Guardar Plan"}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </CardContent>
    </Card>
  );
}
