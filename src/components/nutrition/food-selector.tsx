"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckmarkCircle01Icon,
  PlusSignCircleIcon,
  Search01Icon,
  StarCircleIcon,
} from "hugeicons-react";
import { toast } from "sonner";

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

type FoodSelectorProps = {
  onComplete: (entries: MealEntry[]) => void;
  mealType?: string;
};

export default function FoodSelector({
  onComplete,
  mealType,
}: FoodSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFoods, setSelectedFoods] = useState<MealEntry[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [suggestions, setSuggestions] = useState<Food[]>([]);

  const foodCategories = [
    { value: "all", label: "Todos" },
    { value: "proteína", label: "Proteínas" },
    { value: "carbohidrato", label: "Carbohidratos" },
    { value: "verdura", label: "Verduras" },
    { value: "fruta", label: "Frutas" },
    { value: "grasa", label: "Grasas" },
  ];

  useEffect(() => {
    fetchFoods();
    if (mealType) {
      fetchSuggestions();
    }
  }, [fetchFoods, fetchSuggestions, mealType]);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/food?query=${encodeURIComponent(searchQuery)}`;
      if (category !== "all") {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch foods");

      const data = await response.json();
      setFoods(data.foods);
    } catch (error) {
      console.error("Error fetching foods:", error);

      toast.error("Error", {
        description: "No se pudieron cargar los alimentos",
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, category]);

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/food/suggestions?mealType=${mealType}`
      );
      if (!response.ok) throw new Error("Failed to fetch suggestions");

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, [mealType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFoods();
  };

  const toggleFoodSelection = (food: Food) => {
    const existingIndex = selectedFoods.findIndex(
      (entry) => entry.foodId === food.id
    );

    if (existingIndex >= 0) {
      // Remove food
      setSelectedFoods(selectedFoods.filter((_, i) => i !== existingIndex));
    } else {
      // Add food with default quantity of 1
      if (!quantities[food.id]) {
        setQuantities({ ...quantities, [food.id]: 1 });
      }

      setSelectedFoods([
        ...selectedFoods,
        {
          foodId: food.id,
          food,
          quantity: quantities[food.id] || 1,
        },
      ]);
    }
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    setQuantities({ ...quantities, [foodId]: quantity });

    setSelectedFoods(
      selectedFoods.map((entry) => {
        if (entry.foodId === foodId) {
          return { ...entry, quantity };
        }
        return entry;
      })
    );
  };

  const handleComplete = () => {
    if (selectedFoods.length === 0) {
      toast.error("No hay alimentos seleccionados", {
        description: "Por favor, selecciona al menos un alimento",
      });
      return;
    }

    onComplete(selectedFoods);
  };

  const isFoodSelected = (foodId: string) => {
    return selectedFoods.some((entry) => entry.foodId === foodId);
  };

  return (
    <div className="space-y-4">
      {mealType && suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Sugerencias para ti</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestions.map((food) => (
              <div
                key={food.id}
                className={`flex items-center justify-between p-3 rounded-md border cursor-pointer ${
                  isFoodSelected(food.id)
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-accent"
                }`}
                onClick={() => toggleFoodSelection(food)}
              >
                <div className="flex-1">
                  <div className="font-medium">{food.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g
                    | G: {food.fat}g
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isFoodSelected(food.id) ? (
                    <Badge variant="default">
                      <CheckmarkCircle01Icon className="h-3 w-3 mr-1" />
                      Seleccionado
                    </Badge>
                  ) : (
                    <Button size="sm" variant="ghost">
                      <PlusSignCircleIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Buscar alimentos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Search01Icon className="h-4 w-4" />
        </Button>
      </form>

      <Tabs defaultValue="all" value={category} onValueChange={setCategory}>
        <TabsList className="flex flex-wrap h-auto">
          {foodCategories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="flex-1">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="h-[300px] overflow-y-auto rounded-md border bg-background p-1 no-scrollbar">
        {loading ? (
          <div className="space-y-2 p-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
          </div>
        ) : foods.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No se encontraron alimentos. Intenta con otra búsqueda.
          </div>
        ) : (
          <div className="space-y-2">
            {foods.map((food) => (
              <div
                key={food.id}
                className={`flex items-center justify-between p-3 border rounded-md cursor-pointer ${
                  isFoodSelected(food.id)
                    ? "bg-zinc-100 shadow-sm"
                    : "border-none hover:border-zinc-300"
                }`}
                onClick={() => toggleFoodSelection(food)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{food.name}</span>
                    {food.isFavorite && (
                      <StarCircleIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {food.calories} kcal | {food.serving}g por porción
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs space-x-1">
                    <Badge variant="outline">P: {food.protein}g</Badge>
                    <Badge variant="outline">C: {food.carbs}g</Badge>
                    <Badge variant="outline">G: {food.fat}g</Badge>
                  </div>
                  {isFoodSelected(food.id) ? (
                    <CheckmarkCircle01Icon className="h-5 w-5 text-primary" />
                  ) : (
                    <PlusSignCircleIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedFoods.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-sm">
            Alimentos seleccionados ({selectedFoods.length})
          </h4>
          <div className="space-y-2 h-[100px] overflow-y-auto no-scrollbar rounded-md border">
            {selectedFoods.map((entry) => (
              <div
                key={entry.foodId}
                className="flex items-center justify-between p-3 rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{entry.food.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(entry.food.calories * entry.quantity)} kcal
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newQuantity = Math.max(
                          1,
                          (entry.quantity || 1) - 1
                        );
                        updateQuantity(entry.foodId, newQuantity);
                      }}
                    >
                      -
                    </Button>
                    <span className="w-10 text-xs text-center">
                      {entry.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(entry.foodId, (entry.quantity || 1) + 1);
                      }}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFoodSelection(entry.food);
                    }}
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full" onClick={handleComplete}>
            Continuar con {selectedFoods.length} alimento
            {selectedFoods.length !== 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  );
}
