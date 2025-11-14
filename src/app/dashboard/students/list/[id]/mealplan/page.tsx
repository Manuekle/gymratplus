"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  PlusSignIcon,
  MinusSignIcon,
  Delete02Icon,
  EggsIcon,
  NoodlesIcon,
  RiceBowl01Icon,
  ChocolateIcon,
  ArrowLeft01Icon,
  SteakIcon,
  FrenchFries02Icon,
} from "@hugeicons/core-free-icons";

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
  _inputValue?: string; // for input editing
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

interface StudentDetail {
  id: string;
  studentId: string;
  name: string | null;
  email: string | null;
}

export default function CreateMealPlanPage() {
  const params = useParams();
  const router = useRouter();
  const studentRelationId = params?.id as string;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(true);
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

  // Fetch student info first
  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentRelationId) return;
      setLoadingStudent(true);
      try {
        const res = await fetch("/api/instructors/students");
        if (!res.ok) {
          throw new Error("Error al cargar la lista de alumnos");
        }
        const data: StudentDetail[] = await res.json();
        const found = data.find(
          (s: StudentDetail) => s.id === studentRelationId,
        );
        if (!found) throw new Error("Alumno no encontrado");
        setStudent(found);
      } catch (error) {
        console.error("Error fetching student:", error);
        toast.error("Error al cargar el alumno");
        router.push(`/dashboard/students/list/${studentRelationId}`);
      } finally {
        setLoadingStudent(false);
      }
    };
    fetchStudent();
  }, [studentRelationId, router]);

  // Fetch student profile and foods
  useEffect(() => {
    if (student?.studentId) {
      fetchStudentProfile();
      fetchFoods();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.studentId]);

  const fetchStudentProfile = async () => {
    if (!student?.studentId) return;
    setLoadingProfile(true);
    try {
      const response = await fetch(
        `/api/instructors/students/${student.studentId}/profile`,
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

  const generateAutomaticPlan = async () => {
    if (!student?.studentId || !studentProfile) {
      toast.error("Error: No se pudo obtener la información del estudiante");
      return;
    }

    setLoading(true);
    try {
      // NOTA: Este endpoint solo genera el plan, NO guarda nada en la base de datos
      // El plan solo se guarda cuando el instructor presiona "Crear Plan"
      const response = await fetch(
        `/api/instructors/students/${student.studentId}/generate-plan`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al generar el plan automáticamente",
        );
      }

      const nutritionPlan = await response.json();

      // Validar que nutritionPlan existe y tiene la estructura correcta
      if (!nutritionPlan || typeof nutritionPlan !== "object") {
        throw new Error("El plan generado no tiene un formato válido");
      }

      // Convertir el plan generado al formato MealPlan
      // Solo se carga en el estado local, NO se guarda en la BD
      const newMealPlan: MealPlan = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      };

      // Mapear las comidas del plan generado
      const mealTypeMap: Record<string, keyof MealPlan> = {
        breakfast: "breakfast",
        lunch: "lunch",
        dinner: "dinner",
        snack: "snacks",
        snacks: "snacks",
      };

      // Procesar cada comida directamente desde nutritionPlan (no desde nutritionPlan.meals)
      const mealsToProcess = ["breakfast", "lunch", "dinner", "snack"];

      // Obtener TODOS los alimentos para mapear los IDs (sin paginación)
      // Necesitamos todos los alimentos porque el plan puede tener cualquier foodId
      let allFoods: Food[] = [];
      let skip = 0;
      const limit = 100; // Tamaño de página
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`/api/foods?skip=${skip}&limit=${limit}`);
        const data = await response.json();
        const foods = Array.isArray(data) ? data : data.data || [];
        allFoods = [...allFoods, ...foods];

        // Verificar si hay más páginas
        if (data.pagination) {
          hasMore = data.pagination.hasMore || false;
          skip += limit;
        } else {
          // Si no hay paginación, asumimos que ya tenemos todos
          hasMore = false;
        }
      }

      const foodsMap = new Map(
        allFoods
          .filter((f: Food) => f && f.id != null)
          .map((f: Food) => [String(f.id), f]),
      );

      console.log(
        `\n   📦 [FRONTEND] Foods cargados: ${allFoods.length} alimentos`,
      );
      console.log(`   └─ FoodsMap size: ${foodsMap.size}`);

      // Verificar qué foodIds están en el plan pero no en el mapa
      const allEntryFoodIds = new Set<string>();
      for (const mealKey of mealsToProcess) {
        const mealData = nutritionPlan[mealKey];
        if (mealData && mealData.entries && Array.isArray(mealData.entries)) {
          mealData.entries.forEach((entry: { foodId: string }) => {
            if (entry && entry.foodId) {
              allEntryFoodIds.add(entry.foodId);
            }
          });
        }
      }

      const missingFoodIds: string[] = [];
      allEntryFoodIds.forEach((foodId) => {
        if (!foodsMap.has(foodId)) {
          missingFoodIds.push(foodId);
        }
      });

      if (missingFoodIds.length > 0) {
        console.log(
          `   ⚠️  [FRONTEND] Alimentos NO encontrados en foodsMap (${missingFoodIds.length} de ${allEntryFoodIds.size}):`,
        );
        missingFoodIds.forEach((id) => {
          console.log(`      └─ ${id}`);
          // Intentar buscar variaciones del ID
          const foundVariations = Array.from(foodsMap.keys()).filter(
            (key) => key.includes(id) || id.includes(key),
          );
          if (foundVariations.length > 0) {
            console.log(
              `         └─ IDs similares encontrados: ${foundVariations.slice(0, 3).join(", ")}`,
            );
          }
        });
      } else {
        console.log(
          `   ✅ [FRONTEND] Todos los foodIds del plan (${allEntryFoodIds.size}) están en el foodsMap`,
        );
      }

      for (const mealKey of mealsToProcess) {
        const mealData = nutritionPlan[mealKey];
        if (!mealData || typeof mealData !== "object") {
          continue;
        }

        const mealType = mealTypeMap[mealKey] || (mealKey as keyof MealPlan);
        const meal = mealData as {
          entries?: Array<{ foodId: string; quantity: number }>;
        };

        if (meal.entries && Array.isArray(meal.entries)) {
          console.log(
            `   └─ [${mealKey}] Procesando ${meal.entries.length} entries`,
          );

          let validEntries = 0;
          let invalidEntries = 0;
          let totalCalculatedProtein = 0;
          let totalCalculatedCarbs = 0;
          let totalCalculatedFat = 0;
          let totalCalculatedCalories = 0;

          newMealPlan[mealType] = meal.entries
            .map((entry: { foodId: string; quantity: number }, idx: number) => {
              if (!entry || !entry.foodId) {
                invalidEntries++;
                console.log(`      └─ Entry ${idx}: inválido (sin foodId)`);
                return null;
              }

              // Verificar si el foodId existe en el mapa
              const foodIdStr = String(entry.foodId);
              let food = foodsMap.get(foodIdStr) as Food | undefined;

              if (!food) {
                // Intentar buscar sin conversión (por si acaso el tipo es diferente)
                food = foodsMap.get(entry.foodId) as Food | undefined;
              }

              if (!food) {
                invalidEntries++;
                console.log(`      └─ Entry ${idx}: Alimento NO encontrado`);
                console.log(
                  `         └─ foodId recibido: "${entry.foodId}" (tipo: ${typeof entry.foodId})`,
                );
                console.log(`         └─ foodId convertido: "${foodIdStr}"`);
                console.log(
                  `         └─ ¿Existe en foodsMap (string)?: ${foodsMap.has(foodIdStr)}`,
                );
                console.log(
                  `         └─ ¿Existe en foodsMap (original)?: ${foodsMap.has(entry.foodId)}`,
                );

                // Mostrar algunos IDs del foodsMap para comparar
                const sampleIds = Array.from(foodsMap.keys()).slice(0, 3);
                console.log(
                  `         └─ Ejemplos de IDs en foodsMap: ${sampleIds.join(", ")}`,
                );

                return null;
              }

              if (food) {
                validEntries++;
                const servingSize = food.serving || 100;
                const multiplier = (entry.quantity || 1) * (servingSize / 100);
                const calculatedProtein = (food.protein || 0) * multiplier;
                const calculatedCarbs = (food.carbs || 0) * multiplier;
                const calculatedFat = (food.fat || 0) * multiplier;
                const calculatedCalories = (food.calories || 0) * multiplier;

                totalCalculatedProtein += calculatedProtein;
                totalCalculatedCarbs += calculatedCarbs;
                totalCalculatedFat += calculatedFat;
                totalCalculatedCalories += calculatedCalories;

                if (idx < 3) {
                  // Log solo los primeros 3 para no saturar
                  console.log(`      └─ Entry ${idx}: ${food.name}`);
                  console.log(
                    `         └─ foodId recibido: "${entry.foodId}" (tipo: ${typeof entry.foodId})`,
                  );
                  console.log(
                    `         └─ foodId del food: "${food.id}" (tipo: ${typeof food.id})`,
                  );
                  console.log(
                    `         └─ ¿Coinciden?: ${String(entry.foodId) === String(food.id)}`,
                  );
                  console.log(
                    `         └─ quantity recibido: ${entry.quantity}, serving: ${servingSize}g`,
                  );
                  console.log(
                    `         └─ multiplier: ${multiplier.toFixed(3)}`,
                  );
                  console.log(
                    `         └─ Food macros (por 100g): P=${food.protein}g, C=${food.carbs}g, F=${food.fat}g, Cal=${food.calories}kcal`,
                  );
                  console.log(
                    `         └─ Calculado: P=${calculatedProtein.toFixed(1)}g, C=${calculatedCarbs.toFixed(1)}g, F=${calculatedFat.toFixed(1)}g, Cal=${calculatedCalories.toFixed(0)}kcal`,
                  );
                }

                return {
                  foodId: entry.foodId,
                  food: food,
                  quantity: entry.quantity || 1,
                } as SelectedFood;
              } else {
                invalidEntries++;
                console.log(
                  `      └─ Entry ${idx}: Alimento no encontrado después de verificación (foodId: ${entry.foodId})`,
                );
                return null;
              }
            })
            .filter((item): item is SelectedFood => item !== null);

          console.log(`      └─ [${mealKey}] Resumen:`);
          console.log(
            `         └─ Entries válidos: ${validEntries}, inválidos: ${invalidEntries}`,
          );
          console.log(
            `         └─ Totales calculados en mapeo: P=${totalCalculatedProtein.toFixed(1)}g, C=${totalCalculatedCarbs.toFixed(1)}g, F=${totalCalculatedFat.toFixed(1)}g, Cal=${totalCalculatedCalories.toFixed(0)}kcal`,
          );
          console.log(
            `      └─ [${mealKey}] Entries mapeados exitosamente: ${newMealPlan[mealType].length}`,
          );
        } else {
          console.log(`   └─ [${mealKey}] No hay entries o no es un array`);
        }
      }

      // Log de verificación: mostrar qué se recibió y cómo se calcula
      console.log(`\n📥 [FRONTEND] Plan recibido del API:`);
      console.log(
        `   └─ Breakfast recibido: P=${nutritionPlan.breakfast?.protein || 0}g, C=${nutritionPlan.breakfast?.carbs || 0}g, F=${nutritionPlan.breakfast?.fat || 0}g, Cal=${nutritionPlan.breakfast?.calories || 0}kcal, Entries=${nutritionPlan.breakfast?.entries?.length || 0}`,
      );
      console.log(
        `   └─ Lunch recibido: P=${nutritionPlan.lunch?.protein || 0}g, C=${nutritionPlan.lunch?.carbs || 0}g, F=${nutritionPlan.lunch?.fat || 0}g, Cal=${nutritionPlan.lunch?.calories || 0}kcal, Entries=${nutritionPlan.lunch?.entries?.length || 0}`,
      );
      console.log(
        `   └─ Dinner recibido: P=${nutritionPlan.dinner?.protein || 0}g, C=${nutritionPlan.dinner?.carbs || 0}g, F=${nutritionPlan.dinner?.fat || 0}g, Cal=${nutritionPlan.dinner?.calories || 0}kcal, Entries=${nutritionPlan.dinner?.entries?.length || 0}`,
      );
      console.log(
        `   └─ Snack recibido: P=${nutritionPlan.snack?.protein || 0}g, C=${nutritionPlan.snack?.carbs || 0}g, F=${nutritionPlan.snack?.fat || 0}g, Cal=${nutritionPlan.snack?.calories || 0}kcal, Entries=${nutritionPlan.snack?.entries?.length || 0}`,
      );

      // Calcular totales desde los entries mapeados (como lo hace el frontend)
      const frontendBreakfast = calculateMealTotals(newMealPlan.breakfast);
      const frontendLunch = calculateMealTotals(newMealPlan.lunch);
      const frontendDinner = calculateMealTotals(newMealPlan.dinner);
      const frontendSnacks = calculateMealTotals(newMealPlan.snacks);

      console.log(
        `\n   📊 [FRONTEND] Totales calculados con calculateMealTotals:`,
      );
      console.log(
        `      └─ Breakfast: P=${frontendBreakfast.protein.toFixed(1)}g, C=${frontendBreakfast.carbs.toFixed(1)}g, F=${frontendBreakfast.fat.toFixed(1)}g, Cal=${frontendBreakfast.calories.toFixed(0)}kcal`,
      );
      console.log(
        `      └─ Lunch: P=${frontendLunch.protein.toFixed(1)}g, C=${frontendLunch.carbs.toFixed(1)}g, F=${frontendLunch.fat.toFixed(1)}g, Cal=${frontendLunch.calories.toFixed(0)}kcal`,
      );
      console.log(
        `      └─ Dinner: P=${frontendDinner.protein.toFixed(1)}g, C=${frontendDinner.carbs.toFixed(1)}g, F=${frontendDinner.fat.toFixed(1)}g, Cal=${frontendDinner.calories.toFixed(0)}kcal`,
      );
      console.log(
        `      └─ Snacks: P=${frontendSnacks.protein.toFixed(1)}g, C=${frontendSnacks.carbs.toFixed(1)}g, F=${frontendSnacks.fat.toFixed(1)}g, Cal=${frontendSnacks.calories.toFixed(0)}kcal`,
      );

      // Verificar cada comida individualmente
      console.log(`\n   🔍 [FRONTEND] Verificación detallada por comida:`);
      ["breakfast", "lunch", "dinner", "snacks"].forEach((mealKey) => {
        const meal = newMealPlan[mealKey as keyof MealPlan];
        if (meal && meal.length > 0) {
          console.log(
            `      └─ [${mealKey}] ${meal.length} alimentos en newMealPlan`,
          );
          const manualTotal = { protein: 0, carbs: 0, fat: 0, calories: 0 };
          meal.forEach((item, idx) => {
            const servingSize = item.food.serving || 100;
            const multiplier = item.quantity * (servingSize / 100);
            const itemProtein = (item.food.protein || 0) * multiplier;
            const itemCarbs = (item.food.carbs || 0) * multiplier;
            const itemFat = (item.food.fat || 0) * multiplier;
            const itemCalories = (item.food.calories || 0) * multiplier;
            manualTotal.protein += itemProtein;
            manualTotal.carbs += itemCarbs;
            manualTotal.fat += itemFat;
            manualTotal.calories += itemCalories;

            if (idx < 2) {
              console.log(`         └─ Item ${idx}: ${item.food.name}`);
              console.log(
                `            └─ quantity: ${item.quantity}, serving: ${servingSize}g, multiplier: ${multiplier.toFixed(3)}`,
              );
              console.log(
                `            └─ Calculado: P=${itemProtein.toFixed(1)}g, C=${itemCarbs.toFixed(1)}g, F=${itemFat.toFixed(1)}g, Cal=${itemCalories.toFixed(0)}kcal`,
              );
            }
          });
          const calculatedTotal = calculateMealTotals(meal);
          console.log(
            `         └─ Manual total: P=${manualTotal.protein.toFixed(1)}g, C=${manualTotal.carbs.toFixed(1)}g, F=${manualTotal.fat.toFixed(1)}g, Cal=${manualTotal.calories.toFixed(0)}kcal`,
          );
          console.log(
            `         └─ calculateMealTotals: P=${calculatedTotal.protein.toFixed(1)}g, C=${calculatedTotal.carbs.toFixed(1)}g, F=${calculatedTotal.fat.toFixed(1)}g, Cal=${calculatedTotal.calories.toFixed(0)}kcal`,
          );
          const diff = {
            protein: Math.abs(manualTotal.protein - calculatedTotal.protein),
            carbs: Math.abs(manualTotal.carbs - calculatedTotal.carbs),
            fat: Math.abs(manualTotal.fat - calculatedTotal.fat),
            calories: Math.abs(manualTotal.calories - calculatedTotal.calories),
          };
          if (
            diff.protein > 0.1 ||
            diff.carbs > 0.1 ||
            diff.fat > 0.1 ||
            diff.calories > 1
          ) {
            console.log(
              `         ⚠️  DIFERENCIA DETECTADA: P=${diff.protein.toFixed(1)}g, C=${diff.carbs.toFixed(1)}g, F=${diff.fat.toFixed(1)}g, Cal=${diff.calories.toFixed(0)}kcal`,
            );
          }
        } else {
          console.log(`      └─ [${mealKey}] 0 alimentos en newMealPlan`);
        }
      });

      const frontendDailyTotals = {
        protein:
          frontendBreakfast.protein +
          frontendLunch.protein +
          frontendDinner.protein +
          frontendSnacks.protein,
        carbs:
          frontendBreakfast.carbs +
          frontendLunch.carbs +
          frontendDinner.carbs +
          frontendSnacks.carbs,
        fat:
          frontendBreakfast.fat +
          frontendLunch.fat +
          frontendDinner.fat +
          frontendSnacks.fat,
        calories:
          frontendBreakfast.calories +
          frontendLunch.calories +
          frontendDinner.calories +
          frontendSnacks.calories,
      };

      console.log(
        `      └─ TOTALES DIARIOS FRONTEND: P=${frontendDailyTotals.protein.toFixed(1)}g, C=${frontendDailyTotals.carbs.toFixed(1)}g, F=${frontendDailyTotals.fat.toFixed(1)}g, Cal=${frontendDailyTotals.calories.toFixed(0)}kcal`,
      );

      if (studentProfile) {
        const frontendProteinPercent =
          (frontendDailyTotals.protein / studentProfile.dailyProteinTarget) *
          100;
        const frontendCarbsPercent =
          (frontendDailyTotals.carbs / studentProfile.dailyCarbTarget) * 100;
        const frontendFatPercent =
          (frontendDailyTotals.fat / studentProfile.dailyFatTarget) * 100;
        const frontendCaloriesPercent =
          (frontendDailyTotals.calories / studentProfile.dailyCalorieTarget) *
          100;

        console.log(
          `\n   📊 [FRONTEND] Comparativa con objetivos del usuario:`,
        );
        console.log(
          `      └─ Proteína:     ${frontendDailyTotals.protein.toFixed(1)}g / ${studentProfile.dailyProteinTarget}g (${frontendProteinPercent.toFixed(1)}%)`,
        );
        console.log(
          `      └─ Carbohidratos: ${frontendDailyTotals.carbs.toFixed(1)}g / ${studentProfile.dailyCarbTarget}g (${frontendCarbsPercent.toFixed(1)}%)`,
        );
        console.log(
          `      └─ Grasas:        ${frontendDailyTotals.fat.toFixed(1)}g / ${studentProfile.dailyFatTarget}g (${frontendFatPercent.toFixed(1)}%)`,
        );
        console.log(
          `      └─ Calorías:      ${frontendDailyTotals.calories.toFixed(0)}kcal / ${studentProfile.dailyCalorieTarget}kcal (${frontendCaloriesPercent.toFixed(1)}%)`,
        );
      }

      // Solo actualizar el estado local, NO guardar en BD
      setMealPlan(newMealPlan);
      toast.success(
        "Plan generado automáticamente. Puedes modificarlo según necesites.",
      );
    } catch (error) {
      console.error("Error generando plan automático:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al generar el plan automáticamente",
      );
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

    if (!matchesSearch) return false;

    // Si hay búsqueda, mostrar todos los que coincidan
    if (searchQuery) {
      return true;
    }

    // Si no hay búsqueda, filtrar por mealType
    // Mostrar si tiene el mealType correcto, o si no tiene mealType definido
    const hasMealType =
      food.mealType && Array.isArray(food.mealType) && food.mealType.length > 0;
    if (!hasMealType) {
      return true; // Mostrar alimentos sin mealType definido
    }

    return food.mealType?.includes(mealTypeMap[activeMeal]) || false;
  });

  const addFoodToMeal = (food: Food) => {
    setMealPlan((prev) => {
      const currentMeal = prev[activeMeal];
      const existingIndex = currentMeal.findIndex(
        (item) => item.foodId === food.id,
      );

      if (existingIndex >= 0) {
        const updated = [...currentMeal];
        const existingItem = updated[existingIndex];
        if (existingItem) {
          updated[existingIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + 1,
          };
        }
        return { ...prev, [activeMeal]: updated };
      } else {
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
        const item = updated[index];
        if (!item) return prev;
        const newQuantity = Math.max(0.1, item.quantity + delta);
        if (newQuantity <= 0.1) {
          updated.splice(index, 1);
        } else {
          updated[index] = { ...item, quantity: newQuantity };
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
    if (!student?.studentId || !studentProfile) {
      toast.error("Error: No se pudo obtener la información del estudiante");
      return;
    }

    const dailyTotals = calculateDailyTotals();

    if (dailyTotals.calories === 0) {
      toast.error("Por favor, selecciona al menos un alimento para el plan");
      return;
    }

    // Validar que todos los macros alcancen los objetivos
    const missingCalories =
      studentProfile.dailyCalorieTarget - dailyTotals.calories;
    const missingProtein =
      studentProfile.dailyProteinTarget - dailyTotals.protein;
    const missingCarbs = studentProfile.dailyCarbTarget - dailyTotals.carbs;
    const missingFat = studentProfile.dailyFatTarget - dailyTotals.fat;

    if (dailyTotals.calories < studentProfile.dailyCalorieTarget) {
      toast.error("Calorías incompletas", {
        description: `Faltan ${Math.round(missingCalories)} kcal para alcanzar el objetivo de ${studentProfile.dailyCalorieTarget} kcal`,
      });
      return;
    }

    if (dailyTotals.protein < studentProfile.dailyProteinTarget) {
      toast.error("Proteínas incompletas", {
        description: `Faltan ${Math.round(missingProtein)}g para alcanzar el objetivo de ${studentProfile.dailyProteinTarget}g`,
      });
      return;
    }

    if (dailyTotals.carbs < studentProfile.dailyCarbTarget) {
      toast.error("Carbohidratos incompletos", {
        description: `Faltan ${Math.round(missingCarbs)}g para alcanzar el objetivo de ${studentProfile.dailyCarbTarget}g`,
      });
      return;
    }

    if (dailyTotals.fat < studentProfile.dailyFatTarget) {
      toast.error("Grasas incompletas", {
        description: `Faltan ${Math.round(missingFat)}g para alcanzar el objetivo de ${studentProfile.dailyFatTarget}g`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
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
        description: `Plan personalizado creado por el instructor para ${student.name || "el alumno"}`,
      };

      const response = await fetch("/api/instructors/food-plans/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: student.studentId,
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
      router.push(`/dashboard/students/list/${studentRelationId}`);
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

  const dailyTotals = calculateDailyTotals();

  // Calcular totales de la comida activa para el resumen
  const activeMealTotals = calculateMealTotals(mealPlan[activeMeal]);

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

  if (loadingStudent) {
    return (
      <div className="container max-w-7xl mx-auto py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-6 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-xs text-muted-foreground">Alumno no encontrado</p>
        <Button
          onClick={() => router.push("/dashboard/students/list")}
          variant="outline"
        >
          Volver a alumnos
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex md:flex-row flex-col justify-between w-full items-center gap-2">
        <Button
          variant="outline"
          className="text-xs w-full md:w-auto"
          size="sm"
          onClick={() =>
            router.push(`/dashboard/students/list/${studentRelationId}`)
          }
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <Card className="w-full overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold tracking-heading">
            Crear Plan de Alimentación
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Selecciona los alimentos para{" "}
            <span className="font-medium text-foreground">{student.name}</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          {loadingProfile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-full" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full mt-3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-3 w-full rounded-full" />
                    <Skeleton className="h-3 w-24 mx-auto" />
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <div className="grid w-full grid-cols-4 h-10">
                    <Skeleton className="h-full rounded-md" />
                    <Skeleton className="h-full rounded-md" />
                    <Skeleton className="h-full rounded-md" />
                    <Skeleton className="h-full rounded-md" />
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="p-3 sm:p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <div className="sticky top-4 sm:top-6">
                    <Card className="border-muted/50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-center mb-3 sm:mb-4">
                          <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <Skeleton className="h-16 rounded-lg" />
                          <Skeleton className="h-16 rounded-lg" />
                          <Skeleton className="h-16 rounded-lg" />
                        </div>
                        <Skeleton className="h-10 w-full mt-4" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          ) : studentProfile ? (
            <>
              {/* Macros Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Proteínas */}
                <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-900 dark:to-gray-800">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-xs text-muted-foreground">
                          Proteínas
                        </h1>
                        <h2 className="text-xs font-semibold">
                          {Math.round(dailyTotals.protein)}g
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          / {studentProfile.dailyProteinTarget}g
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center dark:bg-pink-800">
                        <HugeiconsIcon
                          icon={SteakIcon}
                          className="h-5 w-5 text-pink-600 dark:text-pink-300"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={Math.min(
                          100,
                          (dailyTotals.protein /
                            studentProfile.dailyProteinTarget) *
                            100,
                        )}
                        className="h-1.5"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Carbohidratos */}
                <Card className="bg-gradient-to-br from-sky-50 to-white dark:from-sky-900 dark:to-gray-800">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-xs text-muted-foreground">
                          Carbohidratos
                        </h1>
                        <h2 className="text-xs font-semibold">
                          {Math.round(dailyTotals.carbs)}g
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          / {studentProfile.dailyCarbTarget}g
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-800 flex items-center justify-center">
                        <HugeiconsIcon
                          icon={RiceBowl01Icon}
                          className="h-5 w-5 text-sky-600 dark:text-sky-300"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={Math.min(
                          100,
                          (dailyTotals.carbs / studentProfile.dailyCarbTarget) *
                            100,
                        )}
                        className="h-1.5"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Grasas */}
                <Card className="bg-gradient-to-br from-amber-100 to-white dark:from-amber-900 dark:to-gray-800">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-xs text-muted-foreground">
                          Grasas
                        </h1>
                        <h2 className="text-xs font-semibold">
                          {Math.round(dailyTotals.fat)}g
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          / {studentProfile.dailyFatTarget}g
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                        <HugeiconsIcon
                          icon={FrenchFries02Icon}
                          className="h-5 w-5 text-amber-600 dark:text-amber-300"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={Math.min(
                          100,
                          (dailyTotals.fat / studentProfile.dailyFatTarget) *
                            100,
                        )}
                        className="h-1.5"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Botón de generar automáticamente */}
              <div className="flex justify-end">
                <Button
                  variant="default"
                  size="sm"
                  onClick={generateAutomaticPlan}
                  disabled={loading || !studentProfile}
                  className="text-xs"
                >
                  {loading ? (
                    <>
                      <Icons.spinner className="mr-2 h-3 w-3 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    "Generar Plan Automáticamente"
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Column - Food Selection */}
                <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                  <div className="relative">
                    <HugeiconsIcon
                      icon={Search01Icon}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                      placeholder="Buscar alimentos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 text-xs"
                    />
                  </div>

                  <Tabs
                    value={activeMeal}
                    onValueChange={(v) => setActiveMeal(v as typeof activeMeal)}
                  >
                    <TabsList className="grid w-full grid-cols-4 h-10">
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

                  <ScrollArea className="h-[calc(100vh-420px)] sm:h-[calc(100vh-380px)] pr-2 -mr-2">
                    <div className="pr-2 space-y-2">
                      {loading ? (
                        <div className="space-y-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className="p-3 sm:p-4 rounded-lg border bg-card"
                            >
                              <div className="flex items-start sm:items-center justify-between gap-3">
                                <div className="flex-1 min-w-0 space-y-2">
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-md" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : filteredFoods.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <HugeiconsIcon
                            icon={Search01Icon}
                            className="h-8 w-8 mb-2 opacity-50"
                          />
                          <h3 className="text-xs font-medium mb-2">
                            No se encontraron alimentos
                          </h3>
                          <p className="text-xs text-muted-foreground max-w-sm">
                            Intenta ajustar los términos de búsqueda para
                            encontrar alimentos.
                          </p>
                        </div>
                      ) : (
                        filteredFoods.map((food) => {
                          const isSelected = mealPlan[activeMeal].some(
                            (item) => item.foodId === food.id,
                          );
                          return (
                            <div
                              key={food.id}
                              onClick={() => addFoodToMeal(food)}
                              className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all hover:shadow-sm cursor-pointer ${
                                isSelected
                                  ? "bg-zinc-100 dark:bg-zinc-800 shadow-sm"
                                  : "bg-card hover:bg-accent/50 dark:hover:bg-zinc-800/70"
                              }`}
                            >
                              <div className="flex items-start sm:items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-xs font-medium">
                                    {food.name}
                                  </h3>
                                  <p className="text-xs text-muted-foreground mb-1 sm:mb-2">
                                    {food.serving || 0}g
                                  </p>
                                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                    <span className="flex items-center">
                                      <span className="text-red-500 dark:text-red-400 font-medium mr-1">
                                        P:
                                      </span>
                                      <span className="text-foreground">
                                        {food.protein}g
                                      </span>
                                    </span>
                                    <span className="flex items-center">
                                      <span className="text-blue-500 dark:text-blue-400 font-medium mr-1">
                                        C:
                                      </span>
                                      <span className="text-foreground">
                                        {food.carbs}g
                                      </span>
                                    </span>
                                    <span className="flex items-center">
                                      <span className="text-yellow-500 dark:text-yellow-400 font-medium mr-1">
                                        G:
                                      </span>
                                      <span className="text-foreground">
                                        {food.fat}g
                                      </span>
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-xs sm:text-xs font-semibold mb-1">
                                    {food.calories}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    kcal
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Right Column - Summary */}
                <div className="lg:col-span-1">
                  <div className="sticky top-4 sm:top-6 space-y-3 sm:space-y-4">
                    <Card className="border-muted/50">
                      <CardContent className="p-3 sm:p-4">
                        {mealPlan[activeMeal].length === 0 &&
                        Object.values(mealPlan).every(
                          (meal) => meal.length === 0,
                        ) ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <h3 className="text-xs font-medium mb-2">
                              Resumen del plan
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-sm">
                              Selecciona alimentos para ver el resumen
                              nutricional.
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-center mb-3 sm:mb-4">
                              <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                                <svg
                                  className="w-full h-full -rotate-90"
                                  viewBox="0 0 36 36"
                                >
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-muted/50"
                                    strokeWidth="2.5"
                                  />
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-red-500"
                                    strokeWidth="2.5"
                                    strokeDasharray={`${Math.round(((activeMealTotals.protein * 4) / (activeMealTotals.calories || 1)) * 100)} ${100 - Math.round(((activeMealTotals.protein * 4) / (activeMealTotals.calories || 1)) * 100)}`}
                                    strokeLinecap="round"
                                  />
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-blue-500"
                                    strokeWidth="2.5"
                                    strokeDasharray={`${Math.round(((activeMealTotals.carbs * 4) / (activeMealTotals.calories || 1)) * 100)} ${100 - Math.round(((activeMealTotals.carbs * 4) / (activeMealTotals.calories || 1)) * 100)}`}
                                    strokeDashoffset={
                                      -Math.round(
                                        ((activeMealTotals.protein * 4) /
                                          (activeMealTotals.calories || 1)) *
                                          100,
                                      )
                                    }
                                    strokeLinecap="round"
                                  />
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-yellow-500"
                                    strokeWidth="2.5"
                                    strokeDasharray={`${Math.round(((activeMealTotals.fat * 9) / (activeMealTotals.calories || 1)) * 100)} ${100 - Math.round(((activeMealTotals.fat * 9) / (activeMealTotals.calories || 1)) * 100)}`}
                                    strokeDashoffset={
                                      -(
                                        Math.round(
                                          ((activeMealTotals.protein * 4) /
                                            (activeMealTotals.calories || 1)) *
                                            100,
                                        ) +
                                        Math.round(
                                          ((activeMealTotals.carbs * 4) /
                                            (activeMealTotals.calories || 1)) *
                                            100,
                                        )
                                      )
                                    }
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-2xl font-bold">
                                    {Math.round(activeMealTotals.calories)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    kcal
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="text-center p-2 rounded-lg bg-red-500/10">
                                <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                                  {Math.round(activeMealTotals.protein)}g
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Proteína
                                </div>
                              </div>
                              <div className="text-center p-2 rounded-lg bg-blue-500/10">
                                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                  {Math.round(activeMealTotals.carbs)}g
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Carbohidratos
                                </div>
                              </div>
                              <div className="text-center p-2 rounded-lg bg-yellow-500/10">
                                <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                                  {Math.round(activeMealTotals.fat)}g
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Grasas
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="text-xs text-muted-foreground mb-2">
                                {mealPlan[activeMeal].length}{" "}
                                {mealPlan[activeMeal].length === 1
                                  ? "alimento"
                                  : "alimentos"}{" "}
                                en {mealLabels[activeMeal]}
                              </div>
                              <ScrollArea
                                className={
                                  mealPlan[activeMeal].length > 3
                                    ? "h-[200px]"
                                    : ""
                                }
                              >
                                <div className="space-y-2 pr-3">
                                  {mealPlan[activeMeal].map((item) => {
                                    const calories = Math.round(
                                      item.food.calories *
                                        item.quantity *
                                        ((item.food.serving || 100) / 100),
                                    );
                                    return (
                                      <div
                                        key={item.foodId}
                                        className="p-3 rounded-lg border bg-card space-y-2"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium text-xs truncate">
                                              {item.food.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {calories} kcal
                                            </div>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                                            onClick={() =>
                                              removeFoodFromMeal(item.foodId)
                                            }
                                          >
                                            <HugeiconsIcon
                                              icon={Delete02Icon}
                                              className="h-3.5 w-3.5"
                                            />
                                          </Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7 flex-shrink-0 bg-transparent"
                                            onClick={() => {
                                              const currentDisplay =
                                                item.quantity;
                                              const step = 0.1;
                                              const newDisplay = Math.max(
                                                0.1,
                                                currentDisplay - step,
                                              );
                                              updateFoodQuantity(
                                                item.foodId,
                                                newDisplay - currentDisplay,
                                              );
                                            }}
                                          >
                                            <HugeiconsIcon
                                              icon={MinusSignIcon}
                                              className="h-3 w-3"
                                            />
                                          </Button>
                                          <div className="flex-1">
                                            <Input
                                              type="text"
                                              inputMode="decimal"
                                              pattern="[0-9]*\.?[0-9]*"
                                              value={(() => {
                                                if (
                                                  item._inputValue !== undefined
                                                ) {
                                                  return item._inputValue;
                                                }
                                                return item.quantity % 1 === 0
                                                  ? item.quantity.toString()
                                                  : item.quantity.toFixed(1);
                                              })()}
                                              onChange={(e) => {
                                                const value = e.target.value;

                                                if (value === "") {
                                                  setMealPlan((prev) => {
                                                    const currentMeal =
                                                      prev[activeMeal];
                                                    const index =
                                                      currentMeal.findIndex(
                                                        (i) =>
                                                          i.foodId ===
                                                          item.foodId,
                                                      );
                                                    if (index >= 0) {
                                                      const updated = [
                                                        ...currentMeal,
                                                      ];
                                                      const existingItem =
                                                        updated[index];
                                                      if (existingItem) {
                                                        updated[index] = {
                                                          ...existingItem,
                                                          _inputValue: "",
                                                          quantity: 0,
                                                        };
                                                      }
                                                      return {
                                                        ...prev,
                                                        [activeMeal]: updated,
                                                      };
                                                    }
                                                    return prev;
                                                  });
                                                  return;
                                                }

                                                const numberRegex =
                                                  /^\d*\.?\d*$/;
                                                if (!numberRegex.test(value)) {
                                                  return;
                                                }

                                                const numValue =
                                                  parseFloat(value);

                                                if (
                                                  value.endsWith(".") ||
                                                  value.endsWith(".0") ||
                                                  numValue === 0
                                                ) {
                                                  setMealPlan((prev) => {
                                                    const currentMeal =
                                                      prev[activeMeal];
                                                    const index =
                                                      currentMeal.findIndex(
                                                        (i) =>
                                                          i.foodId ===
                                                          item.foodId,
                                                      );
                                                    if (index >= 0) {
                                                      const updated = [
                                                        ...currentMeal,
                                                      ];
                                                      const existingItem =
                                                        updated[index];
                                                      if (existingItem) {
                                                        updated[index] = {
                                                          ...existingItem,
                                                          _inputValue: value,
                                                        };
                                                      }
                                                      return {
                                                        ...prev,
                                                        [activeMeal]: updated,
                                                      };
                                                    }
                                                    return prev;
                                                  });
                                                  return;
                                                }

                                                if (
                                                  isNaN(numValue) ||
                                                  numValue < 0
                                                ) {
                                                  return;
                                                }

                                                setMealPlan((prev) => {
                                                  const currentMeal =
                                                    prev[activeMeal];
                                                  const index =
                                                    currentMeal.findIndex(
                                                      (i) =>
                                                        i.foodId ===
                                                        item.foodId,
                                                    );
                                                  if (index >= 0) {
                                                    const updated = [
                                                      ...currentMeal,
                                                    ];
                                                    const existingItem =
                                                      updated[index];
                                                    if (existingItem) {
                                                      updated[index] = {
                                                        ...existingItem,
                                                        _inputValue: value,
                                                      };
                                                    }
                                                    return {
                                                      ...prev,
                                                      [activeMeal]: updated,
                                                    };
                                                  }
                                                  return prev;
                                                });

                                                updateFoodQuantity(
                                                  item.foodId,
                                                  numValue - item.quantity,
                                                );
                                              }}
                                              onBlur={(e) => {
                                                const value = e.target.value;

                                                setMealPlan((prev) => {
                                                  const currentMeal =
                                                    prev[activeMeal];
                                                  const index =
                                                    currentMeal.findIndex(
                                                      (i) =>
                                                        i.foodId ===
                                                        item.foodId,
                                                    );
                                                  if (index >= 0) {
                                                    const updated = [
                                                      ...currentMeal,
                                                    ];
                                                    const existingItem =
                                                      updated[index];
                                                    if (existingItem) {
                                                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                      const {
                                                        _inputValue,
                                                        ...rest
                                                      } = existingItem;
                                                      updated[index] = rest;
                                                    }
                                                    return {
                                                      ...prev,
                                                      [activeMeal]: updated,
                                                    };
                                                  }
                                                  return prev;
                                                });

                                                if (
                                                  !value ||
                                                  value === "." ||
                                                  parseFloat(value) === 0
                                                ) {
                                                  updateFoodQuantity(
                                                    item.foodId,
                                                    1 - item.quantity,
                                                  );
                                                  toast.error(
                                                    "Cantidad inválida",
                                                    {
                                                      description:
                                                        "Se estableció la cantidad por defecto (1 porción)",
                                                      position: "top-center",
                                                      duration: 2000,
                                                    },
                                                  );
                                                  return;
                                                }

                                                const numValue =
                                                  parseFloat(value);
                                                if (numValue < 0.1) {
                                                  updateFoodQuantity(
                                                    item.foodId,
                                                    0.1 - item.quantity,
                                                  );
                                                  toast.error(
                                                    "Cantidad inválida",
                                                    {
                                                      description:
                                                        "La cantidad mínima es 0.1 porciones",
                                                      position: "top-center",
                                                      duration: 2000,
                                                    },
                                                  );
                                                }
                                              }}
                                              className="h-7 text-center text-xs w-full"
                                              placeholder="Porciones"
                                            />
                                          </div>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7 flex-shrink-0 bg-transparent"
                                            onClick={() => {
                                              const currentDisplay =
                                                item.quantity;
                                              const step = 0.1;
                                              const newDisplay =
                                                currentDisplay + step;
                                              updateFoodQuantity(
                                                item.foodId,
                                                newDisplay - currentDisplay,
                                              );
                                            }}
                                          >
                                            <HugeiconsIcon
                                              icon={PlusSignIcon}
                                              className="h-3 w-3"
                                            />
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </ScrollArea>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="text-xs text-muted-foreground mb-2">
                                Progreso diario
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span>Calorías</span>
                                  <span className="font-medium">
                                    {Math.round(dailyTotals.calories)} /{" "}
                                    {studentProfile.dailyCalorieTarget}
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
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
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <Textarea
                                placeholder="Notas (opcional)..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-[60px] resize-none text-xs"
                                disabled={isSubmitting}
                              />
                            </div>

                            <Button
                              className="w-full"
                              size="lg"
                              onClick={handleSubmit}
                              disabled={
                                isSubmitting ||
                                !studentProfile ||
                                dailyTotals.calories === 0 ||
                                dailyTotals.calories <
                                  studentProfile.dailyCalorieTarget ||
                                dailyTotals.protein <
                                  studentProfile.dailyProteinTarget ||
                                dailyTotals.carbs <
                                  studentProfile.dailyCarbTarget ||
                                dailyTotals.fat < studentProfile.dailyFatTarget
                              }
                            >
                              {isSubmitting ? (
                                <>
                                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                  Creando...
                                </>
                              ) : dailyTotals.calories <
                                studentProfile.dailyCalorieTarget ? (
                                `Faltan ${Math.round(studentProfile.dailyCalorieTarget - dailyTotals.calories)} kcal`
                              ) : dailyTotals.protein <
                                studentProfile.dailyProteinTarget ? (
                                `Faltan ${Math.round(studentProfile.dailyProteinTarget - dailyTotals.protein)}g proteína`
                              ) : dailyTotals.carbs <
                                studentProfile.dailyCarbTarget ? (
                                `Faltan ${Math.round(studentProfile.dailyCarbTarget - dailyTotals.carbs)}g carbohidratos`
                              ) : dailyTotals.fat <
                                studentProfile.dailyFatTarget ? (
                                `Faltan ${Math.round(studentProfile.dailyFatTarget - dailyTotals.fat)}g grasas`
                              ) : (
                                "Crear Plan"
                              )}
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No se pudo cargar el perfil del estudiante
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
