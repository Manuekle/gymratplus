"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Apple01Icon,
  Search01Icon,
  PlusSignIcon,
  MinusSignIcon,
  Delete02Icon,
  EggsIcon,
  NoodlesIcon,
  RiceBowl01Icon,
  ChocolateIcon,
} from "@hugeicons/core-free-icons";

interface FoodPlanAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  onPlanCreated?: () => void;
}

type Food = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: number;
  category: string;
  mealType?: string[];
};

type SelectedFood = {
  foodId: string;
  food: Food;
  quantity: number; // in servings (1 = 100g or serving size)
};

type MealPlan = {
  breakfast: SelectedFood[];
  lunch: SelectedFood[];
  dinner: SelectedFood[];
  snacks: SelectedFood[];
};

type StudentProfile = {
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbTarget: number;
  dailyFatTarget: number;
  goal: string;
  dietaryPreference: string;
};

export function FoodPlanAssignmentDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  onPlanCreated,
}: FoodPlanAssignmentDialogProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [activeMeal, setActiveMeal] = useState<
    "breakfast" | "lunch" | "dinner" | "snacks"
  >("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null,
  );
  const [mealPlan, setMealPlan] = useState<MealPlan>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });

  // Fetch student profile
  useEffect(() => {
    if (open && studentId) {
      fetchStudentProfile();
      fetchFoods();
    }
  }, [open, studentId]);

  const fetchStudentProfile = async () => {
    setLoadingProfile(true);
    try {
      // Fetch student profile via instructor students API
      const response = await fetch(
        `/api/instructors/students/${studentId}/profile`,
      );
      if (!response.ok) {
        throw new Error("Error al cargar el perfil del estudiante");
      }
      const profile = await response.json();
      setStudentProfile({
        dailyCalorieTarget: profile.dailyCalorieTarget || 2000,
        dailyProteinTarget: profile.dailyProteinTarget || 150,
        dailyCarbTarget: profile.dailyCarbTarget || 250,
        dailyFatTarget: profile.dailyFatTarget || 65,
        goal: profile.goal || "maintain",
        dietaryPreference: profile.dietaryPreference || "no-preference",
      });
    } catch (error) {
      console.error("Error fetching student profile:", error);
      toast.error("Error al cargar el perfil del estudiante");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/foods");
      if (!response.ok) {
        throw new Error("Error al cargar los alimentos");
      }
      const result = await response.json();
      const foodsData = Array.isArray(result) ? result : result.data || [];
      setFoods(foodsData);
    } catch (error) {
      console.error("Error fetching foods:", error);
      toast.error("Error al cargar los alimentos");
    } finally {
      setLoading(false);
    }
  };

  const mealTypeMap = {
    breakfast: "desayuno",
    lunch: "almuerzo",
    dinner: "cena",
    snacks: "snack",
  };

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = searchQuery
      ? food.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesMealType =
      food.mealType?.includes(mealTypeMap[activeMeal]) || false;
    return matchesSearch && matchesMealType;
  });

  const addFoodToMeal = (food: Food) => {
    setMealPlan((prev) => {
      const currentMeal = prev[activeMeal];
      const existingIndex = currentMeal.findIndex(
        (item) => item.foodId === food.id,
      );

      if (existingIndex >= 0) {
        // If food already exists, increase quantity
        const updated = [...currentMeal];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return { ...prev, [activeMeal]: updated };
      } else {
        // Add new food
        return {
          ...prev,
          [activeMeal]: [
            ...currentMeal,
            { foodId: food.id, food, quantity: 1 },
          ],
        };
      }
    });
  };

  const updateFoodQuantity = (foodId: string, delta: number) => {
    setMealPlan((prev) => {
      const currentMeal = prev[activeMeal];
      const index = currentMeal.findIndex((item) => item.foodId === foodId);
      if (index >= 0) {
        const updated = [...currentMeal];
        const newQuantity = Math.max(0.1, updated[index].quantity + delta);
        if (newQuantity <= 0.1) {
          // Remove if quantity is too low
          updated.splice(index, 1);
        } else {
          updated[index] = { ...updated[index], quantity: newQuantity };
        }
        return { ...prev, [activeMeal]: updated };
      }
      return prev;
    });
  };

  const removeFoodFromMeal = (foodId: string) => {
    setMealPlan((prev) => ({
      ...prev,
      [activeMeal]: prev[activeMeal].filter((item) => item.foodId !== foodId),
    }));
  };

  const calculateMealTotals = (meal: SelectedFood[]) => {
    return meal.reduce(
      (acc, item) => {
        const servingSize = item.food.serving || 100;
        const multiplier = item.quantity * (servingSize / 100);
        return {
          calories: acc.calories + item.food.calories * multiplier,
          protein: acc.protein + item.food.protein * multiplier,
          carbs: acc.carbs + item.food.carbs * multiplier,
          fat: acc.fat + item.food.fat * multiplier,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  };

  const calculateDailyTotals = () => {
    const breakfast = calculateMealTotals(mealPlan.breakfast);
    const lunch = calculateMealTotals(mealPlan.lunch);
    const dinner = calculateMealTotals(mealPlan.dinner);
    const snacks = calculateMealTotals(mealPlan.snacks);
    return {
      calories:
        breakfast.calories + lunch.calories + dinner.calories + snacks.calories,
      protein:
        breakfast.protein + lunch.protein + dinner.protein + snacks.protein,
      carbs: breakfast.carbs + lunch.carbs + dinner.carbs + snacks.carbs,
      fat: breakfast.fat + lunch.fat + dinner.fat + snacks.fat,
    };
  };

  const handleSubmit = async () => {
    if (!studentId || !studentProfile) {
      toast.error("Error: No se pudo obtener la información del estudiante");
      return;
    }

    const dailyTotals = calculateDailyTotals();

    if (dailyTotals.calories === 0) {
      toast.error("Por favor, selecciona al menos un alimento para el plan");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert meal plan to the format expected by the API
      const meals = {
        breakfast: {
          entries: mealPlan.breakfast.map((item) => ({
            foodId: item.foodId,
            quantity: item.quantity,
          })),
          ...calculateMealTotals(mealPlan.breakfast),
        },
        lunch: {
          entries: mealPlan.lunch.map((item) => ({
            foodId: item.foodId,
            quantity: item.quantity,
          })),
          ...calculateMealTotals(mealPlan.lunch),
        },
        dinner: {
          entries: mealPlan.dinner.map((item) => ({
            foodId: item.foodId,
            quantity: item.quantity,
          })),
          ...calculateMealTotals(mealPlan.dinner),
        },
        snacks: {
          entries: mealPlan.snacks.map((item) => ({
            foodId: item.foodId,
            quantity: item.quantity,
          })),
          ...calculateMealTotals(mealPlan.snacks),
        },
      };

      const macros = {
        protein: `${Math.round(dailyTotals.protein)}g (${Math.round(
          ((dailyTotals.protein * 4) / dailyTotals.calories) * 100,
        )}%)`,
        carbs: `${Math.round(dailyTotals.carbs)}g (${Math.round(
          ((dailyTotals.carbs * 4) / dailyTotals.calories) * 100,
        )}%)`,
        fat: `${Math.round(dailyTotals.fat)}g (${Math.round(
          ((dailyTotals.fat * 9) / dailyTotals.calories) * 100,
        )}%)`,
        description: `Plan personalizado creado por el instructor para ${studentName}`,
      };

      const response = await fetch("/api/instructors/food-plans/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          meals,
          macros,
          calorieTarget: Math.round(dailyTotals.calories),
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error creando plan de alimentación",
        );
      }

      toast.success("Plan de alimentación creado y asignado con éxito");
      // Reset form
      setNotes("");
      setMealPlan({ breakfast: [], lunch: [], dinner: [], snacks: [] });
      setSearchQuery("");
      onOpenChange(false);
      if (onPlanCreated) {
        onPlanCreated();
      }
    } catch (error) {
      console.error("Error creando plan de alimentación:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al crear el plan de alimentación",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNotes("");
      setMealPlan({ breakfast: [], lunch: [], dinner: [], snacks: [] });
      setSearchQuery("");
      onOpenChange(false);
    }
  };

  const dailyTotals = calculateDailyTotals();
  const currentMealTotals = calculateMealTotals(mealPlan[activeMeal]);

  const mealIcons = {
    breakfast: EggsIcon,
    lunch: NoodlesIcon,
    dinner: RiceBowl01Icon,
    snacks: ChocolateIcon,
  };

  const mealLabels = {
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
    snacks: "Snacks",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto pt-8 xl:pt-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-heading">
            Crear Plan de Alimentación
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Selecciona los alimentos para{" "}
            <span className="font-medium">{studentName}</span>
          </DialogDescription>
        </DialogHeader>

        {loadingProfile ? (
          <div className="flex items-center justify-center py-12">
            <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : studentProfile ? (
          <div className="space-y-4 mt-4">
            {/* Student Profile Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Calorías
                    </p>
                    <p className="font-semibold">
                      {studentProfile.dailyCalorieTarget} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Proteínas
                    </p>
                    <p className="font-semibold">
                      {studentProfile.dailyProteinTarget}g
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Carbohidratos
                    </p>
                    <p className="font-semibold">
                      {studentProfile.dailyCarbTarget}g
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Grasas</p>
                    <p className="font-semibold">
                      {studentProfile.dailyFatTarget}g
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">Progreso Diario</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(
                        (dailyTotals.calories /
                          studentProfile.dailyCalorieTarget) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (dailyTotals.calories /
                            studentProfile.dailyCalorieTarget) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Cal:</span>{" "}
                      <span className="font-medium">
                        {Math.round(dailyTotals.calories)}/
                        {studentProfile.dailyCalorieTarget}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Prot:</span>{" "}
                      <span className="font-medium">
                        {Math.round(dailyTotals.protein)}/
                        {studentProfile.dailyProteinTarget}g
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Carb:</span>{" "}
                      <span className="font-medium">
                        {Math.round(dailyTotals.carbs)}/
                        {studentProfile.dailyCarbTarget}g
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gras:</span>{" "}
                      <span className="font-medium">
                        {Math.round(dailyTotals.fat)}/
                        {studentProfile.dailyFatTarget}g
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Food Selection */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">
                      Buscar Alimentos
                    </Label>
                    <div className="relative">
                      <HugeiconsIcon
                        icon={Search01Icon}
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                      />
                      <Input
                        placeholder="Buscar alimentos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs"
                      />
                    </div>
                  </div>

                  <Tabs
                    value={activeMeal}
                    onValueChange={(v) => setActiveMeal(v as typeof activeMeal)}
                  >
                    <TabsList className="grid grid-cols-4 w-full">
                      {Object.entries(mealLabels).map(([key, label]) => (
                        <TabsTrigger key={key} value={key} className="text-xs">
                          <HugeiconsIcon
                            icon={mealIcons[key as keyof typeof mealIcons]}
                            className="h-3 w-3 mr-1"
                          />
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {loading ? (
                        <div className="text-center py-8 text-xs text-muted-foreground">
                          Cargando alimentos...
                        </div>
                      ) : filteredFoods.length === 0 ? (
                        <div className="text-center py-8 text-xs text-muted-foreground">
                          No se encontraron alimentos
                        </div>
                      ) : (
                        filteredFoods.map((food) => (
                          <div
                            key={food.id}
                            className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => addFoodToMeal(food)}
                          >
                            <div className="flex-1">
                              <p className="text-xs font-medium">{food.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {food.calories} kcal • P: {food.protein}g • C:{" "}
                                {food.carbs}g • G: {food.fat}g
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                            >
                              <HugeiconsIcon
                                icon={PlusSignIcon}
                                className="h-4 w-4"
                              />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Selected Foods */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">
                      {mealLabels[activeMeal]} - {mealPlan[activeMeal].length}{" "}
                      alimentos
                    </Label>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(currentMealTotals.calories)} kcal
                    </div>
                  </div>

                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {mealPlan[activeMeal].length === 0 ? (
                        <div className="text-center py-8 text-xs text-muted-foreground">
                          No hay alimentos seleccionados
                        </div>
                      ) : (
                        mealPlan[activeMeal].map((item) => (
                          <div
                            key={item.foodId}
                            className="flex items-center justify-between p-2 border rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="text-xs font-medium">
                                {item.food.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {Math.round(
                                  item.food.calories *
                                    item.quantity *
                                    ((item.food.serving || 100) / 100),
                                )}{" "}
                                kcal
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={() =>
                                  updateFoodQuantity(item.foodId, -0.1)
                                }
                              >
                                <HugeiconsIcon
                                  icon={MinusSignIcon}
                                  className="h-3 w-3"
                                />
                              </Button>
                              <span className="text-xs font-medium w-12 text-center">
                                {item.quantity.toFixed(1)}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={() =>
                                  updateFoodQuantity(item.foodId, 0.1)
                                }
                              >
                                <HugeiconsIcon
                                  icon={PlusSignIcon}
                                  className="h-3 w-3"
                                />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-destructive"
                                onClick={() => removeFoodFromMeal(item.foodId)}
                              >
                                <HugeiconsIcon
                                  icon={Delete02Icon}
                                  className="h-4 w-4"
                                />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-medium">
                Notas (Opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Agrega notas o recomendaciones adicionales para el estudiante..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px] text-xs resize-none"
                disabled={isSubmitting}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No se pudo cargar el perfil del estudiante
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-xs"
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !studentProfile}
            className="text-xs"
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Plan de Alimentación"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
