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

type Food = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: number;
  category: "breakfast" | "lunch" | "dinner" | "snack" | "other";
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
  data: Food | Recipe;
  quantity: number;
  unit: string;
};

export default function RegistrarComidaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("foods");
  const [mealType, setMealType] = useState("desayuno");
  const [mealTime, setMealTime] = useState(format(new Date(), "HH:mm"));
  const [mealDate, setMealDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  useEffect(() => {
    fetchFoods();
    fetchRecipes();
  }, []);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/foods");
      if (!response.ok) {
        throw new Error("Error al cargar los alimentos");
      }
      const data = await response.json();
      setFoods(data);
    } catch (error) {
      console.error("Error fetching foods:", error);
      toast.error("Error", {
        description: "No se pudieron cargar los alimentos",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/recipes");
      if (!response.ok) {
        throw new Error("Error al cargar las recetas");
      }
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      toast.error("Error", {
        description: "No se pudieron cargar las recetas",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      recipe.mealType.includes(mealType)
  );

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("Error", {
        description: "Debes seleccionar al menos un alimento o receta",
      });
      return;
    }

    setSubmitting(true);

    try {
      const localDate = new Date(mealDate);
      const [hours = 0, minutes = 0] = mealTime.split(":").map(Number);
      localDate.setHours(hours || 0, minutes || 0, 0, 0);

      const promises = selectedItems.map(async (selectedItem) => {
        const quantity = selectedItem.quantity;

        const payload = {
          mealType,
          consumedAt: localDate.toISOString(),
          quantity: quantity,
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
          throw new Error(errorData.error || "Error al registrar las comidas");
        }

        return response.json();
      });

      await Promise.all(promises);
      router.push("/dashboard/nutrition");
      toast.success("Comidas registradas correctamente");
    } catch (error) {
      console.error("Error adding meal logs:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "No se pudieron registrar las comidas",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleItemSelection = (
    item: Food | Recipe,
    type: "food" | "recipe"
  ) => {
    const existingIndex = selectedItems.findIndex(
      (selected) => selected.id === item.id && selected.type === type
    );

    if (existingIndex >= 0) {
      const newSelectedItems = [...selectedItems];
      newSelectedItems.splice(existingIndex, 1);
      setSelectedItems(newSelectedItems);
    } else {
      const defaultUnit = type === "food" ? "g" : "porción";
      setSelectedItems([
        ...selectedItems,
        {
          id: item.id,
          type,
          data: item,
          quantity: type === "food" ? (item as Food).serving : 1,
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
        const defaultQuantity =
          newUnit === "g" && currentItem.type === "food"
            ? (currentItem.data as Food).serving
            : 1;

        newItems[index] = {
          ...currentItem,
          unit: newUnit,
          quantity: defaultQuantity,
        };
      }
      return newItems;
    });
  };

  const getAvailableUnits = (item: SelectedItem) => {
    if (item.type === "recipe") {
      return [
        { value: "porción", label: "Porción" },
        { value: "unidad", label: "Unidad" },
      ];
    }

    const food = item.data as Food;
    const category = food.category?.toLowerCase() || "";

    const baseUnits = [
      { value: "g", label: "Gramos (g)" },
      { value: "porción", label: "Porción" },
      { value: "unidad", label: "Unidad" },
    ];

    if (
      category.includes("bebida") ||
      category.includes("liquido") ||
      category.includes("líquido")
    ) {
      return [
        ...baseUnits,
        { value: "ml", label: "Mililitros (ml)" },
        { value: "L", label: "Litros (L)" },
        { value: "taza", label: "Taza" },
      ];
    }

    return baseUnits;
  };

  const calculateTotals = () => {
    return selectedItems.reduce(
      (acc, item) => {
        const data = item.data;
        const quantity = item.quantity;
        const serving =
          item.type === "food"
            ? (data as Food).serving
            : (data as Recipe).servings;

        let ratio = 1;

        if (item.unit === "g" || item.unit === "ml") {
          ratio = quantity / serving;
        } else if (item.unit === "kg" || item.unit === "L") {
          ratio = (quantity * 1000) / serving;
        } else if (item.unit === "taza") {
          ratio = (quantity * 240) / serving;
        } else if (item.unit === "porción" || item.unit === "unidad") {
          ratio = quantity;
        }

        const calories = Math.round(data.calories * ratio);
        const protein = Number.parseFloat((data.protein * ratio).toFixed(1));
        const carbs = Number.parseFloat((data.carbs * ratio).toFixed(1));
        const fat = Number.parseFloat((data.fat * ratio).toFixed(1));

        return {
          calories: acc.calories + calories,
          protein: acc.protein + protein,
          carbs: acc.carbs + carbs,
          fat: acc.fat + fat,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
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

    const items = activeTab === "foods" ? filteredFoods : filteredRecipes;

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
            activeTab === "foods" ? "food" : "recipe"
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
              onClick={() =>
                toggleItemSelection(
                  item,
                  activeTab === "foods" ? "food" : "recipe"
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
                      <span className="text-muted-foreground mr-1">P:</span>
                      {item.protein}g
                    </span>
                    <span className="flex items-center">
                      <span className="text-muted-foreground mr-1">C:</span>
                      {item.carbs}g
                    </span>
                    <span className="flex items-center">
                      <span className="text-muted-foreground mr-1">G:</span>
                      {item.fat}g
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
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
                        className="stroke-blue-500"
                        strokeWidth="2.5"
                        strokeDasharray={`${proteinPercentage} ${100 - proteinPercentage}`}
                        strokeLinecap="round"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-amber-500"
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
                        className="stroke-rose-500"
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
  const totalMacros = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;
  const proteinPercentage =
    totalMacros > 0 ? ((totals.protein * 4) / totalMacros) * 100 : 0;
  const carbsPercentage =
    totalMacros > 0 ? ((totals.carbs * 4) / totalMacros) * 100 : 0;
  const fatPercentage =
    totalMacros > 0 ? ((totals.fat * 9) / totalMacros) * 100 : 0;

  return (
    <div className="pb-20 md:pb-6">
      <div className="mb-4 flex justify-between w-full items-center">
        <Button
          variant="outline"
          className="text-xs bg-transparent"
          size="sm"
          onClick={() => router.push("/dashboard/nutrition")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Volver a la lista</span>
        </Button>
      </div>

      <Card className="w-full overflow-hidden">
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
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="h-10 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desayuno">Desayuno</SelectItem>
                  <SelectItem value="almuerzo">Almuerzo</SelectItem>
                  <SelectItem value="cena">Cena</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
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
            {/* Left column - Browse foods */}
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
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 h-10">
                  <TabsTrigger
                    value="foods"
                    className="gap-1 sm:gap-2 text-xs sm:text-xs"
                  >
                    <HugeiconsIcon
                      icon={FishFoodIcon}
                      className="h-4 w-4 flex-shrink-0"
                    />
                    <span>Alimentos</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="recipes"
                    className="gap-1 sm:gap-2 text-xs sm:text-xs"
                  >
                    <HugeiconsIcon
                      icon={FavouriteIcon}
                      className="h-4 w-4 flex-shrink-0"
                    />
                    <span>Recetas</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <ScrollArea className="h-[calc(100vh-420px)] sm:h-[calc(100vh-380px)] pr-2 -mr-2">
                <div className="pr-2">{renderFoodsList()}</div>
              </ScrollArea>
            </div>

            {/* Right column - Selected items summary */}
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
                                className="stroke-blue-500"
                                strokeWidth="2.5"
                                strokeDasharray={`${proteinPercentage} ${100 - proteinPercentage}`}
                                strokeLinecap="round"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                className="stroke-amber-500"
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
                                className="stroke-rose-500"
                                strokeWidth="2.5"
                                strokeDasharray={`${fatPercentage} ${100 - fatPercentage}`}
                                strokeDashoffset={
                                  -(proteinPercentage + carbsPercentage)
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
                          <div className="text-center p-2 rounded-lg bg-blue-500/10">
                            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                              {totals.protein.toFixed(1)}g
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Proteína
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-amber-500/10">
                            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                              {totals.carbs.toFixed(1)}g
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Carbos
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-rose-500/10">
                            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
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
                                    : (data as Recipe).servings;

                                let ratio = 1;
                                if (item.unit === "g" || item.unit === "ml") {
                                  ratio = quantity / serving;
                                } else if (
                                  item.unit === "kg" ||
                                  item.unit === "L"
                                ) {
                                  ratio = (quantity * 1000) / serving;
                                } else if (item.unit === "taza") {
                                  ratio = (quantity * 240) / serving;
                                } else if (
                                  item.unit === "porción" ||
                                  item.unit === "unidad"
                                ) {
                                  ratio = quantity;
                                }

                                const calories = Math.round(
                                  data.calories * ratio
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
                                        className="h-6 w-6 flex-shrink-0"
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
                                            )
                                          )}
                                        </SelectContent>
                                      </Select>

                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-7 w-7 flex-shrink-0 bg-transparent"
                                          onClick={() =>
                                            updateItemQuantity(
                                              index,
                                              Math.max(0.1, item.quantity - 0.5)
                                            )
                                          }
                                        >
                                          <HugeiconsIcon
                                            icon={MinusSignIcon}
                                            className="h-3 w-3"
                                          />
                                        </Button>
                                        <div className="flex-1">
                                          <Input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={item.quantity || ""}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              if (value === "") {
                                                updateItemQuantity(index, 0);
                                              } else {
                                                const numValue =
                                                  Number.parseFloat(value);
                                                if (
                                                  !isNaN(numValue) &&
                                                  numValue >= 1
                                                ) {
                                                  updateItemQuantity(
                                                    index,
                                                    Math.max(
                                                      1,
                                                      Math.floor(numValue)
                                                    )
                                                  );
                                                }
                                              }
                                            }}
                                            onBlur={(e) => {
                                              if (
                                                !e.target.value ||
                                                Number(e.target.value) < 1
                                              ) {
                                                toast.error(
                                                  "La cantidad mínima es 1",
                                                  {
                                                    description:
                                                      "Por favor ingresa un número mayor o igual a 1",
                                                    position: "top-center",
                                                    duration: 2000,
                                                  }
                                                );
                                                updateItemQuantity(index, 1);
                                              }
                                            }}
                                            className="h-7 text-center text-xs w-full"
                                            placeholder="Cantidad"
                                          />
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="h-7 w-7 flex-shrink-0 bg-transparent"
                                          onClick={() =>
                                            updateItemQuantity(
                                              index,
                                              item.quantity + 0.5
                                            )
                                          }
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
