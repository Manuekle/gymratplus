"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TimePicker from "@/components/ui/time-picker";
import { Icons } from "@/components/icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Calendar02Icon,
  Cancel01Icon,
  Delete02Icon,
  FavouriteIcon,
  FishFoodIcon,
  MinusSignIcon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
// import AddFoodsButton from "@/components/config/add-foods-button";
// import AddExerciseButton from "@/components/config/add-exercise-button";

type MealType = "desayuno" | "almuerzo" | "cena" | "snack";

const mealTypeLabels = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  cena: "Cena",
  snack: "Snack",
} as const;

type Food = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: number;
  category: MealType;
  isFavorite?: boolean;
};

type Recipe = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  mealType: string[];
};

type SelectedItem = {
  id: string;
  type: "food" | "recipe";
  data: Food;
  quantity: number;
  unit: string;
  _inputValue?: string;
};

// Helper function to validate meal type
const validateMealType = (type: string): MealType => {
  return type in mealTypeLabels ? (type as MealType) : "desayuno";
};

export default function RegisterFoodPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"foods" | "favorites">("foods");
  const [mealType, setMealType] = useState<MealType>("desayuno");
  const [mealTime, setMealTime] = useState(format(new Date(), "HH:mm"));
  const [mealDate, setMealDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<Set<string>>(new Set());

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/foods");
      if (!response.ok) {
        throw new Error("Error al cargar los alimentos");
      }
      const data = await response.json();

      // Convert meal types in the food data
      const foodsWithConvertedMealTypes = data.map(
        (food: Food & { mealType?: string | string[] }) => ({
          ...food,
          mealType: Array.isArray(food.mealType)
            ? food.mealType.map((mt: string) => validateMealType(mt))
            : [],
        }),
      );

      // Merge with favorites data
      const foodsWithFavorites = foodsWithConvertedMealTypes.map(
        (food: Food) => ({
          ...food,
          isFavorite: favoriteFoods.has(food.id),
        }),
      );

      setFoods(foodsWithFavorites);
    } catch (error) {
      console.error("Error fetching foods:", error);
      toast.error("Error al cargar los alimentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    // Load favorites from localStorage
    if (typeof window !== "undefined") {
      const savedFavorites = localStorage.getItem("favoriteFoods");
      if (savedFavorites) {
        setFavoriteFoods(new Set(JSON.parse(savedFavorites)));
      }
    }
  }, []);

  // Toggle favorite status for a food item
  const toggleFavorite = (foodId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setFavoriteFoods((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(foodId)) {
        newFavorites.delete(foodId);
      } else {
        newFavorites.add(foodId);
      }
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "favoriteFoods",
          JSON.stringify(Array.from(newFavorites)),
        );
      }
      return newFavorites;
    });

    // Update the foods state to reflect the favorite status
    setFoods((prevFoods) =>
      prevFoods.map((food) =>
        food.id === foodId ? { ...food, isFavorite: !food.isFavorite } : food,
      ),
    );
  };

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const favoriteFoodsList = filteredFoods.filter((food) =>
    favoriteFoods.has(food.id),
  );
  const nonFavoriteFoods = filteredFoods.filter(
    (food) => !favoriteFoods.has(food.id),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      toast.error("Error", {
        description: "Debes seleccionar al menos un alimento o receta",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Usamos directamente el tipo de comida en español
      const apiMealType = mealType;
      const localDate = new Date(mealDate);
      const [hours = 0, minutes = 0] = mealTime.split(":").map(Number);
      localDate.setHours(hours || 0, minutes || 0, 0, 0);

      const promises = selectedItems.map(async (selectedItem) => {
        // La cantidad ya está en gramos/ml (unidad base)
        const payload = {
          mealType: apiMealType, // Use the Spanish meal type for API
          consumedAt: localDate.toISOString(),
          quantity: selectedItem.quantity,
          ...(selectedItem.type === "food"
            ? { foodId: selectedItem.id }
            : { recipeId: selectedItem.id }),
        };

        const response = await fetch("/api/meal-logs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al registrar la comida");
        }
        return response.json();
      });

      await Promise.all(promises);

      toast.success("Comida registrada exitosamente");
      router.push("/dashboard/nutrition");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Error al registrar la comida",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleItemSelection = (
    item: Food | Recipe,
    type: "food" | "recipe",
  ) => {
    const existingIndex = selectedItems.findIndex(
      (selected) => selected.id === item.id && selected.type === type,
    );

    if (existingIndex >= 0) {
      const newSelectedItems = [...selectedItems];
      newSelectedItems.splice(existingIndex, 1);
      setSelectedItems(newSelectedItems);
    } else {
      const defaultUnit = type === "food" ? "g" : "porción";
      const defaultQuantity = type === "food" ? (item as Food).serving : 1;
      setSelectedItems([
        ...selectedItems,
        {
          id: item.id,
          type,
          data: item,
          quantity: defaultQuantity,
          unit: defaultUnit,
        },
      ]);
    }
  };

  const isItemSelected = (id: string, type: "food" | "recipe") => {
    return selectedItems.some((item) => item.id === id && item.type === type);
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    setSelectedItems((prevItems) => {
      const newItems = [...prevItems];
      const currentItem = newItems[index];
      if (currentItem) {
        newItems[index] = {
          ...currentItem,
          quantity: Math.max(0.1, newQuantity),
        };
        delete newItems[index]._inputValue;
      }
      return newItems;
    });
  };

  const removeItem = (index: number) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems.splice(index, 1);
    setSelectedItems(newSelectedItems);
  };

  const updateItemUnit = (index: number, newUnit: string) => {
    setSelectedItems((prevItems) => {
      const newItems = [...prevItems];
      const currentItem = newItems[index];
      if (currentItem) {
        const serving =
          currentItem.type === "food" ? (currentItem.data as Food).serving : 1;

        let defaultQuantity: number;

        switch (newUnit) {
          case "g":
          case "ml":
            defaultQuantity = serving;
            break;
          case "kg":
          case "L":
            defaultQuantity = 100;
            break;
          case "taza":
          case "vaso":
            defaultQuantity = 240;
            break;
          case "unidad":
          case "porción":
            defaultQuantity = serving;
            break;
          default:
            defaultQuantity = serving;
        }

        newItems[index] = {
          ...currentItem,
          unit: newUnit,
          quantity: defaultQuantity,
        };
        delete newItems[index]._inputValue;
      }
      return newItems;
    });
  };

  const getAvailableUnits = (item: SelectedItem) => {
    // For recipes, only show "porción"
    if (item.type === "recipe") {
      return [{ value: "porción", label: "Porción" }];
    }

    const food = item.data as Food;
    const category = food.category?.toLowerCase() || "";

    // Categories that should show liquid units
    const liquidCategories = [
      "bebida",
      "liquido",
      "líquido",
      "leche",
      "jugo",
      "agua",
      "infusión",
      "café",
      "té",
      "batido",
      "licuado",
      "smoothie",
    ];

    const isLiquid = liquidCategories.some((liquidCat) =>
      category.includes(liquidCat),
    );

    // For liquid foods, show liquid units
    // For solid foods, show solid units
    return isLiquid
      ? [
          { value: "ml", label: "Mililitros (ml)" },
          { value: "L", label: "Litros (L)" },
          { value: "taza", label: "Taza (240ml)" },
          { value: "vaso", label: "Vaso (240ml)" },
          { value: "porción", label: "Porción" },
        ]
      : [
          { value: "g", label: "Gramos (g)" },
          { value: "kg", label: "Kilogramos (kg)" },
          { value: "unidad", label: "Unidad" },
          { value: "porción", label: "Porción" },
        ];
  };

  const calculateTotals = () => {
    return selectedItems.reduce(
      (acc, item) => {
        const data = item.data;
        const quantityInGrams = item.quantity;

        const servingSize = item.type === "food" ? (data as Food).serving : 1;

        const ratio = quantityInGrams / servingSize;

        const calories = Math.round(data.calories * ratio);
        const protein = Math.max(
          0,
          Number.parseFloat((data.protein * ratio).toFixed(1)),
        );
        const carbs = Math.max(
          0,
          Number.parseFloat((data.carbs * ratio).toFixed(1)),
        );
        const fat = Math.max(
          0,
          Number.parseFloat((data.fat * ratio).toFixed(1)),
        );

        return {
          calories: acc.calories + calories,
          protein: acc.protein + protein,
          carbs: acc.carbs + carbs,
          fat: acc.fat + fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  };

  const renderFoodsList = () => {
    if (loading) {
      return (
        <div className="flex flex-col gap-3 justify-center items-center py-16 text-muted-foreground">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <p className="text-xs">Cargando...</p>
        </div>
      );
    }

    const items = activeTab === "favorites" ? favoriteFoodsList : filteredFoods;

    if (items.length === 0) {
      return (
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-xs">
            {searchQuery
              ? "No se encontraron resultados"
              : "No hay elementos disponibles"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((item) => {
          const isSelected = isItemSelected(
            item.id,
            activeTab === "foods" ? "food" : "recipe",
          );

          const totalMacros = item.protein * 4 + item.carbs * 4 + item.fat * 9;
          const proteinPercentage =
            totalMacros > 0 ? ((item.protein * 4) / totalMacros) * 100 : 0;
          const carbsPercentage =
            totalMacros > 0 ? ((item.carbs * 4) / totalMacros) * 100 : 0;
          const fatPercentage =
            totalMacros > 0 ? ((item.fat * 9) / totalMacros) * 100 : 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                toggleItemSelection(
                  item,
                  activeTab === "foods" ? "food" : "recipe",
                )
              }
              className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all hover:shadow-sm ${
                isSelected
                  ? "bg-zinc-100 dark:bg-zinc-800 shadow-sm"
                  : "bg-card hover:bg-accent/50 dark:hover:bg-zinc-800/70"
              }`}
            >
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1 sm:mb-2">
                    {activeTab === "foods"
                      ? `${(item as Food).serving}g`
                      : `${(item as Recipe).servings} ${(item as Recipe).servings === 1 ? "porción" : "porciones"}`}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    <span className="flex items-center">
                      <span className="text-red-500 dark:text-red-400 font-medium mr-1">
                        P:
                      </span>
                      <span className="text-foreground">{item.protein}g</span>
                    </span>
                    <span className="flex items-center">
                      <span className="text-blue-500 dark:text-blue-400 font-medium mr-1">
                        C:
                      </span>
                      <span className="text-foreground">{item.carbs}g</span>
                    </span>
                    <span className="flex items-center">
                      <span className="text-yellow-500 dark:text-yellow-400 font-medium mr-1">
                        G:
                      </span>
                      <span className="text-foreground">{item.fat}g</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    aria-label={
                      favoriteFoods.has(item.id)
                        ? "Quitar de favoritos"
                        : "Añadir a favoritos"
                    }
                  >
                    <HugeiconsIcon
                      icon={FavouriteIcon}
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${favoriteFoods.has(item.id) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                    />
                  </button>
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16">
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
                        strokeDasharray={`${proteinPercentage} ${100 - proteinPercentage}`}
                        strokeLinecap="round"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-blue-500"
                        strokeWidth="2.5"
                        strokeDasharray={`${carbsPercentage} ${100 - carbsPercentage}`}
                        strokeDashoffset={-proteinPercentage}
                        strokeLinecap="round"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-yellow-500"
                        strokeWidth="2.5"
                        strokeDasharray={`${fatPercentage} ${100 - fatPercentage}`}
                        strokeDashoffset={
                          -(proteinPercentage + carbsPercentage)
                        }
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs sm:text-xs font-semibold">
                        {item.calories}
                      </span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-muted-foreground">kcal</div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const totals = calculateTotals();

  const totalCaloriesFromMacros =
    totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;

  const totalCalories = Math.max(totals.calories, totalCaloriesFromMacros);

  const proteinPercentage =
    totalCalories > 0 ? ((totals.protein * 4) / totalCalories) * 100 : 0;
  const carbsPercentage =
    totalCalories > 0 ? ((totals.carbs * 4) / totalCalories) * 100 : 0;
  const fatPercentage =
    totalCalories > 0 ? ((totals.fat * 9) / totalCalories) * 100 : 0;

  const totalPercentage = proteinPercentage + carbsPercentage + fatPercentage;
  const adjustFactor = totalPercentage > 0 ? 100 / totalPercentage : 1;

  const adjustedProtein =
    Math.max(0, Math.min(100, proteinPercentage * adjustFactor)) || 0;
  const adjustedCarbs =
    Math.max(0, Math.min(100, carbsPercentage * adjustFactor)) || 0;
  const adjustedFat =
    Math.max(0, Math.min(100, 100 - adjustedProtein - adjustedCarbs)) || 0;

  return (
    <div>
      <div className="mb-4 flex md:flex-row flex-col justify-between w-full items-center gap-2">
        <Button
          variant="outline"
          className="text-xs"
          size="sm"
          onClick={() => router.push("/dashboard/nutrition")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />{" "}
          Volver a la lista
        </Button>
      </div>

      <Card className="w-full overflow-hidden">
        {/* <AddFoodsButton />
        <AddExerciseButton /> */}
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl font-semibold tracking-heading">
            Registrar Comida
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Registrar una comida para tu plan de nutrición
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Tipo de comida
              </Label>
              <Select
                value={mealType}
                onValueChange={(value: MealType) => setMealType(value)}
              >
                <SelectTrigger className="h-10 w-full text-xs">
                  <SelectValue placeholder="Selecciona un tipo de comida" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(mealTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-10 font-normal bg-transparent text-xs sm:text-xs"
                  >
                    <HugeiconsIcon
                      icon={Calendar02Icon}
                      className="mr-2 h-4 w-4 flex-shrink-0"
                    />
                    {format(mealDate, "dd/MM/yyyy", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    locale={es}
                    selected={mealDate}
                    onSelect={(date) => date && setMealDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Hora</Label>
              <TimePicker
                value={mealTime}
                onChange={(time) => setMealTime(time)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-xs"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchQuery("")}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as "foods" | "favorites")
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 h-10">
                  <TabsTrigger value="foods">Todos</TabsTrigger>
                  <TabsTrigger value="favorites" className="gap-1 sm:gap-2">
                    <HugeiconsIcon
                      icon={FavouriteIcon}
                      className="h-4 w-4 flex-shrink-0"
                    />
                    <span>Favoritos</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <ScrollArea className="h-[calc(100vh-420px)] sm:h-[calc(100vh-380px)] pr-2 -mr-2">
                <div className="pr-2">{renderFoodsList()}</div>
              </ScrollArea>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 sm:top-6 space-y-3 sm:space-y-4">
                <Card className="border-muted/50">
                  <CardContent className="p-3 sm:p-4">
                    {selectedItems.length === 0 ? (
                      <div className="text-center py-6 text-xs text-muted-foreground">
                        Selecciona alimentos para ver el resumen
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
                                strokeDasharray={`${adjustedProtein} ${100 - adjustedProtein}`}
                                strokeLinecap="round"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                className="stroke-blue-500"
                                strokeWidth="2.5"
                                strokeDasharray={`${adjustedCarbs} ${100 - adjustedCarbs}`}
                                strokeDashoffset={-adjustedProtein}
                                strokeLinecap="round"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                className="stroke-yellow-500"
                                strokeWidth="2.5"
                                strokeDasharray={`${adjustedFat} ${100 - adjustedFat}`}
                                strokeDashoffset={
                                  -(adjustedProtein + adjustedCarbs)
                                }
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold">
                                {totals.calories}
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
                              {totals.protein.toFixed(1)}g
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Proteína
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-blue-500/10">
                            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                              {totals.carbs.toFixed(1)}g
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Carbohidratos
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-yellow-500/10">
                            <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                              {totals.fat.toFixed(1)}g
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Grasas
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-2 mb-4">
                          <div className="text-xs text-muted-foreground mb-2">
                            {selectedItems.length}{" "}
                            {selectedItems.length === 1
                              ? "elemento"
                              : "elementos"}
                          </div>
                          <ScrollArea
                            className={
                              selectedItems.length > 3 ? "h-[300px]" : ""
                            }
                          >
                            <div className="space-y-2 pr-3">
                              {selectedItems.map((item, index) => {
                                const data = item.data;
                                const quantity = item.quantity;
                                const serving =
                                  item.type === "food"
                                    ? (data as Food).serving
                                    : 1;

                                const ratio = quantity / serving;
                                const calories = Math.round(
                                  data.calories * ratio,
                                );

                                return (
                                  <div
                                    key={`${item.type}-${item.id}`}
                                    className="p-3 rounded-lg border bg-card space-y-2"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-xs truncate">
                                          {data.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {calories} kcal
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeItem(index)}
                                      >
                                        <HugeiconsIcon
                                          icon={Delete02Icon}
                                          className="h-3.5 w-3.5"
                                        />
                                      </Button>
                                    </div>

                                    <div className="space-y-2">
                                      <Select
                                        value={item.unit}
                                        onValueChange={(value) =>
                                          updateItemUnit(index, value)
                                        }
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {getAvailableUnits(item).map(
                                            (unit) => (
                                              <SelectItem
                                                key={unit.value}
                                                value={unit.value}
                                              >
                                                {unit.label}
                                              </SelectItem>
                                            ),
                                          )}
                                        </SelectContent>
                                      </Select>

                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-7 w-7 flex-shrink-0 bg-transparent"
                                          onClick={() => {
                                            const currentDisplay = (() => {
                                              if (item.unit === "g")
                                                return item.quantity;
                                              if (item.unit === "kg")
                                                return item.quantity / 1000;
                                              if (item.unit === "ml")
                                                return item.quantity;
                                              if (item.unit === "L")
                                                return item.quantity / 1000;
                                              if (
                                                item.unit === "vaso" ||
                                                item.unit === "taza"
                                              )
                                                return item.quantity / 240;
                                              if (
                                                item.unit === "unidad" ||
                                                item.unit === "porción"
                                              ) {
                                                const itemServing =
                                                  item.type === "food"
                                                    ? (item.data as Food)
                                                        .serving
                                                    : 1;
                                                return (
                                                  item.quantity / itemServing
                                                );
                                              }
                                              return item.quantity;
                                            })();

                                            const step =
                                              item.unit === "g" ||
                                              item.unit === "unidad" ||
                                              item.unit === "porción"
                                                ? 1
                                                : 0.1;
                                            const newDisplay = Math.max(
                                              step,
                                              currentDisplay - step,
                                            );

                                            let newQuantity = 0;
                                            const itemServing =
                                              item.type === "food"
                                                ? (item.data as Food).serving
                                                : 1;

                                            switch (item.unit) {
                                              case "g":
                                              case "ml":
                                                newQuantity =
                                                  Math.round(newDisplay);
                                                break;
                                              case "kg":
                                              case "L":
                                                newQuantity = newDisplay * 1000;
                                                break;
                                              case "taza":
                                              case "vaso":
                                                newQuantity = newDisplay * 240;
                                                break;
                                              case "unidad":
                                              case "porción":
                                                newQuantity =
                                                  Math.round(newDisplay) *
                                                  itemServing;
                                                break;
                                              default:
                                                newQuantity = newDisplay;
                                            }

                                            updateItemQuantity(
                                              index,
                                              newQuantity,
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
                                            type="number"
                                            min="0"
                                            step={
                                              [
                                                "g",
                                                "unidad",
                                                "porción",
                                                "vaso",
                                              ].includes(item.unit)
                                                ? "1"
                                                : "0.1"
                                            }
                                            value={(() => {
                                              if (
                                                item._inputValue !== undefined
                                              ) {
                                                return item._inputValue;
                                              }

                                              if (item.unit === "g") {
                                                return Math.round(
                                                  item.quantity,
                                                ).toString();
                                              } else if (item.unit === "kg") {
                                                const kg = item.quantity / 1000;
                                                return kg % 1 === 0
                                                  ? kg.toString()
                                                  : kg.toFixed(1);
                                              } else if (item.unit === "ml") {
                                                return item.quantity % 1 === 0
                                                  ? item.quantity.toString()
                                                  : item.quantity.toFixed(1);
                                              } else if (item.unit === "L") {
                                                const L = item.quantity / 1000;
                                                return L % 1 === 0
                                                  ? L.toString()
                                                  : L.toFixed(1);
                                              } else if (
                                                item.unit === "vaso" ||
                                                item.unit === "taza"
                                              ) {
                                                const vasos =
                                                  item.quantity / 240;
                                                return vasos % 1 === 0
                                                  ? vasos.toString()
                                                  : vasos.toFixed(1);
                                              } else if (
                                                item.unit === "unidad" ||
                                                item.unit === "porción"
                                              ) {
                                                const itemServing =
                                                  item.type === "food"
                                                    ? (item.data as Food)
                                                        .serving
                                                    : 1;
                                                return Math.round(
                                                  item.quantity / itemServing,
                                                ).toString();
                                              }
                                              return item.quantity.toString();
                                            })()}
                                            onChange={(e) => {
                                              const value = e.target.value;

                                              if (value === "") {
                                                setSelectedItems((prev) => {
                                                  const newItems = [...prev];
                                                  newItems[index] = {
                                                    ...newItems[index],
                                                    _inputValue: "",
                                                    quantity: 0,
                                                  };
                                                  return newItems;
                                                });
                                                return;
                                              }

                                              const isWholeNumberUnit = [
                                                "g",
                                                "unidad",
                                                "porción",
                                              ].includes(item.unit);
                                              const numberRegex =
                                                isWholeNumberUnit
                                                  ? /^\d+$/
                                                  : /^\d*\.?\d*$/;

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
                                                setSelectedItems((prev) => {
                                                  const newItems = [...prev];
                                                  newItems[index] = {
                                                    ...newItems[index],
                                                    _inputValue: value,
                                                  };
                                                  return newItems;
                                                });
                                                return;
                                              }

                                              if (
                                                isNaN(numValue) ||
                                                numValue < 0
                                              ) {
                                                return;
                                              }

                                              setSelectedItems((prev) => {
                                                const newItems = [...prev];
                                                newItems[index] = {
                                                  ...newItems[index],
                                                  _inputValue: value,
                                                };
                                                return newItems;
                                              });

                                              let quantity = 0;
                                              const itemServing =
                                                item.type === "food"
                                                  ? (item.data as Food).serving
                                                  : 1;

                                              switch (item.unit) {
                                                case "g":
                                                  quantity =
                                                    Math.round(numValue);
                                                  break;
                                                case "kg":
                                                  quantity = numValue * 1000;
                                                  break;
                                                case "ml":
                                                  quantity = numValue;
                                                  break;
                                                case "L":
                                                  quantity = numValue * 1000;
                                                  break;
                                                case "taza":
                                                case "vaso":
                                                  quantity = numValue * 240;
                                                  break;
                                                case "unidad":
                                                case "porción":
                                                  quantity =
                                                    Math.round(numValue) *
                                                    itemServing;
                                                  break;
                                                default:
                                                  quantity = numValue;
                                              }

                                              updateItemQuantity(
                                                index,
                                                quantity,
                                              );
                                            }}
                                            onBlur={(e) => {
                                              const value = e.target.value;

                                              setSelectedItems((prev) => {
                                                const newItems = [...prev];
                                                delete newItems[index]
                                                  ._inputValue;
                                                return newItems;
                                              });

                                              if (
                                                !value ||
                                                value === "." ||
                                                parseFloat(value) === 0
                                              ) {
                                                const itemServing =
                                                  item.type === "food"
                                                    ? (item.data as Food)
                                                        .serving
                                                    : 1;

                                                const defaultQuantity =
                                                  {
                                                    g: 100,
                                                    kg: 100,
                                                    ml: 100,
                                                    L: 100,
                                                    vaso: 240,
                                                    taza: 240,
                                                    unidad: itemServing,
                                                    porción: itemServing,
                                                  }[item.unit] || 100;

                                                updateItemQuantity(
                                                  index,
                                                  defaultQuantity,
                                                );

                                                toast.error(
                                                  "Cantidad inválida",
                                                  {
                                                    description:
                                                      "Se estableció la cantidad por defecto",
                                                    position: "top-center",
                                                    duration: 2000,
                                                  },
                                                );
                                                return;
                                              }

                                              const numValue =
                                                parseFloat(value);
                                              if (numValue < 0) {
                                                const itemServing =
                                                  item.type === "food"
                                                    ? (item.data as Food)
                                                        .serving
                                                    : 1;
                                                const defaultQuantity =
                                                  item.unit === "g"
                                                    ? 100
                                                    : itemServing;
                                                updateItemQuantity(
                                                  index,
                                                  defaultQuantity,
                                                );

                                                toast.error(
                                                  "Cantidad inválida",
                                                  {
                                                    description:
                                                      "Por favor ingresa un número mayor a 0",
                                                    position: "top-center",
                                                    duration: 2000,
                                                  },
                                                );
                                              }
                                            }}
                                            className="h-7 text-center text-xs w-full"
                                            placeholder={
                                              item.unit === "g"
                                                ? "Gramos"
                                                : item.unit === "kg"
                                                  ? "Kilogramos"
                                                  : item.unit === "ml"
                                                    ? "Mililitros"
                                                    : item.unit === "L"
                                                      ? "Litros"
                                                      : item.unit ===
                                                            "unidad" ||
                                                          item.unit ===
                                                            "porción"
                                                        ? "Unidades"
                                                        : "Cantidad"
                                            }
                                          />
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-7 w-7 flex-shrink-0 bg-transparent"
                                          onClick={() => {
                                            const currentDisplay = (() => {
                                              if (item.unit === "g")
                                                return item.quantity;
                                              if (item.unit === "kg")
                                                return item.quantity / 1000;
                                              if (item.unit === "ml")
                                                return item.quantity;
                                              if (item.unit === "L")
                                                return item.quantity / 1000;
                                              if (
                                                item.unit === "vaso" ||
                                                item.unit === "taza"
                                              )
                                                return item.quantity / 240;
                                              if (
                                                item.unit === "unidad" ||
                                                item.unit === "porción"
                                              ) {
                                                const itemServing =
                                                  item.type === "food"
                                                    ? (item.data as Food)
                                                        .serving
                                                    : 1;
                                                return (
                                                  item.quantity / itemServing
                                                );
                                              }
                                              return item.quantity;
                                            })();

                                            const step =
                                              item.unit === "g" ||
                                              item.unit === "unidad" ||
                                              item.unit === "porción"
                                                ? 1
                                                : 0.1;
                                            const newDisplay =
                                              currentDisplay + step;

                                            let newQuantity = 0;
                                            const itemServing =
                                              item.type === "food"
                                                ? (item.data as Food).serving
                                                : 1;

                                            switch (item.unit) {
                                              case "g":
                                              case "ml":
                                                newQuantity =
                                                  Math.round(newDisplay);
                                                break;
                                              case "kg":
                                              case "L":
                                                newQuantity = newDisplay * 1000;
                                                break;
                                              case "taza":
                                              case "vaso":
                                                newQuantity = newDisplay * 240;
                                                break;
                                              case "unidad":
                                              case "porción":
                                                newQuantity =
                                                  Math.round(newDisplay) *
                                                  itemServing;
                                                break;
                                              default:
                                                newQuantity = newDisplay;
                                            }

                                            updateItemQuantity(
                                              index,
                                              newQuantity,
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
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        </div>

                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleSubmit}
                          disabled={submitting || selectedItems.length === 0}
                        >
                          {submitting ? (
                            <>
                              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            "Guardar comida"
                          )}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
