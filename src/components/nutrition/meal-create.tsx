"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { getRecipesByMealType, type Recipe } from "@/lib/recipes";
import FoodSelector from "./food-selector";
import RecipeCard from "./recipe-card";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import {
  Clock01Icon,
  KitchenUtensilsIcon,
  ListViewIcon,
} from "hugeicons-react";
import TimePicker from "../ui/time-picker";

type MealProps = {
  date?: Date;
};

type Food = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: number;
  category: string;
  isFavorite?: boolean;
  userId?: string | null;
};

type MealEntry = {
  foodId: string;
  food: Food;
  quantity: number;
};

export function MealCreate({ date = new Date() }: MealProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mealType, setMealType] = useState("");
  const [mealTime, setMealTime] = useState(formatCurrentTime());
  const [selectedOption, setSelectedOption] = useState<
    "quick" | "custom" | "recipe"
  >("quick");
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const recipes = getRecipesByMealType(mealType);

  function formatCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const translateMealType = (type: string) => {
    const translations: { [key: string]: string } = {
      breakfast: "Desayuno",
      lunch: "Almuerzo",
      dinner: "Cena",
      snack: "Snack",
    };
    return translations[type] || type;
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);

    // Convert recipe to entries
    const recipeEntries: MealEntry[] = recipe.ingredients.map(
      (ingredient, index) => {
        // This is a simplified conversion - in a real app, you'd match ingredients to foods in your database
        return {
          foodId: `recipe-${recipe.id}-${index}`,
          food: {
            id: `recipe-${recipe.id}-${index}`,
            name: ingredient,
            calories: Math.round(recipe.calories / recipe.ingredients.length),
            protein:
              Math.round((recipe.protein / recipe.ingredients.length) * 10) /
              10,
            carbs:
              Math.round((recipe.carbs / recipe.ingredients.length) * 10) / 10,
            fat: Math.round((recipe.fat / recipe.ingredients.length) * 10) / 10,
            serving: 1,
            category: "recipe",
          },
          quantity: 1,
        };
      }
    );

    setEntries(recipeEntries);
    handleNext();
  };

  const handleAddEntries = (newEntries: MealEntry[]) => {
    setEntries(newEntries);
    handleNext();
  };

  const handleSaveMeal = async () => {
    if (entries.length === 0) {
      toast.error("No hay alimentos", {
        description: "Por favor, añade al menos un alimento a tu comida",
      });
      return;
    }

    setLoading(true);

    try {
      // Create date with the selected time
      const [hours, minutes] = mealTime.split(":").map(Number);
      const mealDate = new Date(date);
      mealDate.setHours(hours, minutes, 0, 0);

      const mealData = {
        date: mealDate.toISOString(),
        mealType,
        entries: entries.map((entry) => ({
          foodId: entry.foodId,
          quantity: entry.quantity,
        })),
      };

      console.log(mealData);

      const response = await fetch("/api/meal-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mealData),
      });

      if (!response.ok) {
        throw new Error("Failed to save meal");
      }

      toast.success("Comida guardada", {
        description: `Tu ${translateMealType(
          mealType
        )} ha sido registrado correctamente`,
      });

      router.refresh();
    } catch (error) {
      console.error("Error saving meal:", error);

      toast.error("Error", {
        description: "No se pudo guardar la comida",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totals = entries.reduce(
    (acc, entry) => {
      acc.calories += Math.round(entry.food.calories * entry.quantity);
      acc.protein += Number((entry.food.protein * entry.quantity).toFixed(1));
      acc.carbs += Number((entry.food.carbs * entry.quantity).toFixed(1));
      acc.fat += Number((entry.food.fat * entry.quantity).toFixed(1));
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs w-40">
          Registrar comida
        </Button>
      </DialogTrigger>
      <DialogContent className="w-xl">
        <div>
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <DialogTitle className="font-medium pb-4 text-md">
                  ¿Qué tipo de comida vas a registrar?
                </DialogTitle>
                <Tabs defaultValue={mealType} onValueChange={setMealType}>
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="breakfast">Desayuno</TabsTrigger>
                    <TabsTrigger value="lunch">Almuerzo</TabsTrigger>
                    <TabsTrigger value="dinner">Cena</TabsTrigger>
                    <TabsTrigger value="snack">Snack</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal-time">
                  Hora de {translateMealType(mealType)}
                </Label>
                <TimePicker
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <DialogTitle className="font-medium text-md">
                ¿Cómo quieres registrar tu {translateMealType(mealType)}?
              </DialogTitle>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  className={`cursor-pointer hover:border-zinc-300 ${
                    selectedOption === "quick"
                      ? "border-zinc-300 bg-primary/5"
                      : ""
                  }`}
                  onClick={() => setSelectedOption("quick")}
                >
                  <CardContent className="flex flex-col justify-center items-center p-3 w-full">
                    <Clock01Icon
                      size={32}
                      className="text-muted-foreground pb-2"
                    />
                    <h4 className="text-sm">Comida Rápida</h4>
                    <p className="text-xs text-center text-muted-foreground">
                      Sugerencias basadas en tu perfil
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer hover:border-zinc-300 ${
                    selectedOption === "recipe"
                      ? "border-zinc-300 bg-primary/5"
                      : ""
                  }`}
                  onClick={() => setSelectedOption("recipe")}
                >
                  <CardContent className="flex flex-col justify-center items-center p-3 w-full">
                    <KitchenUtensilsIcon
                      size={32}
                      className="text-muted-foreground pb-2"
                    />
                    <h4 className="text-sm">Receta</h4>
                    <p className="text-xs text-center text-muted-foreground">
                      Elige una receta completa
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer hover:border-zinc-300 ${
                    selectedOption === "custom"
                      ? "border-zinc-300 bg-primary/5"
                      : ""
                  }`}
                  onClick={() => setSelectedOption("custom")}
                >
                  <CardContent className="flex flex-col justify-center items-center p-3 w-full">
                    <ListViewIcon
                      size={32}
                      className="text-muted-foreground pb-2"
                    />
                    <h4 className="text-sm">Personalizado</h4>
                    <p className="text-xs text-center text-muted-foreground">
                      Selecciona alimentos individualmente
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <DialogTitle className="font-medium text-md">
                {selectedOption === "quick" &&
                  "Sugerencias para tu " + translateMealType(mealType)}
                {selectedOption === "recipe" &&
                  "Recetas para " + translateMealType(mealType)}
                {selectedOption === "custom" && "Selecciona tus alimentos"}
              </DialogTitle>

              {selectedOption === "quick" && (
                <div className="space-y-4">
                  <FoodSelector
                    onComplete={handleAddEntries}
                    mealType={mealType}
                  />
                </div>
              )}

              {selectedOption === "recipe" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1 no-scrollbar">
                    {recipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onClick={() => handleSelectRecipe(recipe)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedOption === "custom" && (
                <FoodSelector onComplete={handleAddEntries} />
              )}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6">
              <DialogTitle className="font-medium text-md">
                Confirma tu {translateMealType(mealType)}
              </DialogTitle>

              {selectedRecipe && (
                <div className="border p-4 rounded-md">
                  <h4 className="font-medium text-sm">{selectedRecipe.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedRecipe.description}
                  </p>
                  <div className="mt-2 flex justify-between text-xs">
                    <div>Calorías: {selectedRecipe.calories} kcal</div>
                    <div>Tiempo: {selectedRecipe.preparationTime} min</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Alimentos seleccionados</h4>
                {entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay alimentos seleccionados
                  </p>
                ) : (
                  <div className="space-y-2">
                    {entries.map((entry, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 rounded-md border"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {entry.food.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entry.quantity} porción
                            {entry.quantity !== 1 ? "es" : ""} (
                            {Math.round(entry.food.calories * entry.quantity)}{" "}
                            kcal)
                          </div>
                        </div>
                        <div className="text-xs">
                          P: {(entry.food.protein * entry.quantity).toFixed(1)}g
                          | C: {(entry.food.carbs * entry.quantity).toFixed(1)}g
                          | G: {(entry.food.fat * entry.quantity).toFixed(1)}g
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border p-4 rounded-md">
                <div className="flex justify-between font-medium mb-2">
                  <span className="text-sm">Total Calorías</span>
                  <Badge>{totals.calories} kcal</Badge>
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <div>Proteínas: {totals.protein}g</div>
                  <div>Carbohidratos: {totals.carbs}g</div>
                  <div>Grasas: {totals.fat}g</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          {step > 1 ? (
            <Button className="text-xs" variant="outline" onClick={handleBack}>
              Atrás
            </Button>
          ) : (
            <DialogClose asChild>
              <Button className="text-xs" type="button" variant="secondary">
                Cerrar
              </Button>
            </DialogClose>
          )}

          {step < 4 ? (
            <Button className="text-xs" onClick={handleNext}>
              Siguiente
            </Button>
          ) : (
            <Button
              className="text-xs"
              onClick={handleSaveMeal}
              disabled={loading || entries.length === 0}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
