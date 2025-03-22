"use client";

import { useState, useEffect } from "react";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import TimePicker from "@/components/ui/time-picker";
import { Icons } from "@/components/icons";
import {
  Calendar02Icon,
  Cancel01Icon,
  Delete02Icon,
  FavouriteIcon,
  FishFoodIcon,
  MinusSignIcon,
  PlusSignIcon,
  Search01Icon,
  // Tick02Icon,
} from "hugeicons-react";

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
};

type AddMealLogButtonProps = {
  selectedDate?: Date;
};

function MacroCircle({
  calories,
  protein,
  carbs,
  fat,
  size = 120,
}: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  size?: number;
}) {
  // Cálculos de calorías y porcentajes
  const proteinCalories = protein * 4;
  const carbsCalories = carbs * 4;
  const fatCalories = fat * 9;
  const totalCalories = proteinCalories + carbsCalories + fatCalories;

  // Cálculo de porcentajes para el gráfico
  const proteinPct =
    totalCalories > 0 ? (proteinCalories * 100) / totalCalories : 0;
  const carbsPct =
    totalCalories > 0 ? (carbsCalories * 100) / totalCalories : 0;
  const fatPct = totalCalories > 0 ? (fatCalories * 100) / totalCalories : 0;

  // Cálculo de stroke-dasharray y stroke-dashoffset
  const circumference = 2 * Math.PI * 45;
  const proteinDash = (proteinPct / 100) * circumference;
  const carbsDash = (carbsPct / 100) * circumference;
  const fatDash = (fatPct / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
        {/* Círculo base invisible */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
          className="opacity-0"
        />

        {/* Proteínas (amarillo) */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#FFD700"
          strokeWidth="10"
          strokeDasharray={`${proteinDash} ${circumference}`}
          strokeLinecap="round"
        />

        {/* Carbohidratos (verde) */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="10"
          strokeDasharray={`${carbsDash} ${circumference}`}
          strokeDashoffset={-proteinDash}
          strokeLinecap="round"
        />

        {/* Grasas (naranja) */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#FF9800"
          strokeWidth="10"
          strokeDasharray={`${fatDash} ${circumference}`}
          strokeDashoffset={-(proteinDash + carbsDash)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-sm tracking-tight font-bold">{calories}</span>
          <span className="text-xs text-muted-foreground block">kcal</span>
        </div>
      </div>
    </div>
  );
}

export function AddMealLogButton({ selectedDate }: AddMealLogButtonProps = {}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("foods");
  const [mealType, setMealType] = useState("desayuno");
  const [mealTime, setMealTime] = useState(format(new Date(), "HH:mm"));
  const [mealDate, setMealDate] = useState<Date>(selectedDate || new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"select" | "review">("select");

  // Estado para los alimentos seleccionados
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      fetchFoods();
      fetchRecipes();
    }
  }, [open]);

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

  const resetForm = () => {
    setMealType("desayuno");
    setMealTime(format(new Date(), "HH:mm"));
    setMealDate(selectedDate || new Date());
    setSearchQuery("");
    setSelectedItems([]);
    setNotes("");
    setActiveTab("foods");
    setStep("select");
    setEditingItemIndex(null);
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("Error", {
        description: "Debes seleccionar al menos un alimento o receta",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Crear una fecha con la zona horaria local
      const localDate = new Date(mealDate);
      const [hours, minutes] = mealTime.split(":").map(Number);

      // Establecer las horas y minutos
      localDate.setHours(hours, minutes, 0, 0);

      // Crear un array de promesas para enviar cada alimento
      const promises = selectedItems.map(async (selectedItem) => {
        const item = selectedItem.data;
        const quantity = selectedItem.quantity;

        const payload = {
          mealType,
          consumedAt: localDate.toISOString(),
          quantity: quantity,
          notes: notes || null,
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
          throw new Error(`Error al registrar ${item.name}`);
        }

        return response.json();
      });

      // Esperar a que todas las promesas se resuelvan
      await Promise.all(promises);

      setOpen(false);
      resetForm();

      toast.success("Comidas registradas", {
        description: `Se han registrado ${selectedItems.length} alimentos correctamente`,
      });

      // Recargar la página para mostrar los nuevos registros
      window.location.reload();
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
    // Verificar si el item ya está seleccionado
    const existingIndex = selectedItems.findIndex(
      (selected) => selected.id === item.id && selected.type === type
    );

    if (existingIndex >= 0) {
      // Si ya está seleccionado, lo quitamos
      const newSelectedItems = [...selectedItems];
      newSelectedItems.splice(existingIndex, 1);
      setSelectedItems(newSelectedItems);
    } else {
      // Si no está seleccionado, lo añadimos
      setSelectedItems([
        ...selectedItems,
        {
          id: item.id,
          type,
          data: item,
          quantity: 1,
        },
      ]);
    }
  };

  const isItemSelected = (id: string, type: "food" | "recipe") => {
    return selectedItems.some((item) => item.id === id && item.type === type);
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems[index] = {
      ...newSelectedItems[index],
      quantity: Math.max(0.1, newQuantity),
    };
    setSelectedItems(newSelectedItems);
  };

  const removeItem = (index: number) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems.splice(index, 1);
    setSelectedItems(newSelectedItems);
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

        const ratio = quantity / serving;
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

  const renderItemDetails = () => {
    if (editingItemIndex === null || !selectedItems[editingItemIndex])
      return null;

    const selectedItem = selectedItems[editingItemIndex];
    const item = selectedItem.data;
    const quantity = selectedItem.quantity;
    const serving =
      selectedItem.type === "food"
        ? (item as Food).serving
        : (item as Recipe).servings;

    // Calcular valores nutricionales
    const ratio = quantity / serving;
    const calories = Math.round(item.calories * ratio);
    const protein = Number.parseFloat((item.protein * ratio).toFixed(1));
    const carbs = Number.parseFloat((item.carbs * ratio).toFixed(1));
    const fat = Number.parseFloat((item.fat * ratio).toFixed(1));

    return (
      <div className="space-y-6">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-semibold">{item.name}</h3>
              <p className="text-xs text-muted-foreground">
                {selectedItem.type === "food"
                  ? `${(item as Food).serving}g por porción`
                  : `${(item as Recipe).servings} porciones`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingItemIndex(null)}
            >
              <Cancel01Icon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <MacroCircle
              calories={item.calories}
              protein={item.protein}
              carbs={item.carbs}
              fat={item.fat}
              size={100}
            />

            <div className="space-y-1 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-warning">Proteínas</span>
                <span>{item.protein}g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-success">Carbos</span>
                <span>{item.carbs}g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-destructive">Grasas</span>
                <span>{item.fat}g</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="quantity">Cantidad</Label>
            <div className="flex items-center gap-2 mt-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateItemQuantity(
                    editingItemIndex,
                    selectedItem.quantity - 0.5
                  )
                }
              >
                <MinusSignIcon className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="0.1"
                step="0.1"
                value={selectedItem.quantity}
                onChange={(e) =>
                  updateItemQuantity(
                    editingItemIndex,
                    Number.parseFloat(e.target.value) || 0.1
                  )
                }
                className="text-center text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateItemQuantity(
                    editingItemIndex,
                    selectedItem.quantity + 0.5
                  )
                }
              >
                <PlusSignIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/20">
            <h4 className="font-medium text-sm mb-2">
              Total para {quantity} {quantity === 1 ? "porción" : "porciones"}:
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Calorías:</span>
                <span className="ml-2 font-medium">{calories} kcal</span>
              </div>
              <div>
                <span className="text-muted-foreground">Proteínas:</span>
                <span className="ml-2 font-medium">{protein}g</span>
              </div>
              <div>
                <span className="text-muted-foreground">Carbos:</span>
                <span className="ml-2 font-medium">{carbs}g</span>
              </div>
              <div>
                <span className="text-muted-foreground">Grasas:</span>
                <span className="ml-2 font-medium">{fat}g</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            className="text-xs px-6"
            size="sm"
            onClick={() => setEditingItemIndex(null)}
          >
            Guardar
          </Button>
        </div>
      </div>
    );
  };

  const renderSelectedItemsList = () => {
    if (selectedItems.length === 0) {
      return (
        <div className="text-center py-6 border rounded-lg">
          <p className="text-sm text-muted-foreground">
            No has seleccionado ningún alimento
          </p>
        </div>
      );
    }

    const totals = calculateTotals();

    return (
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-muted/20">
          <h4 className="font-medium mb-2 text-sm">Totales:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Calorías:</span>
              <span className="ml-2 font-medium">{totals.calories} kcal</span>
            </div>
            <div>
              <span className="text-muted-foreground">Proteínas:</span>
              <span className="ml-2 font-medium">{totals.protein}g</span>
            </div>
            <div>
              <span className="text-muted-foreground">Carbos:</span>
              <span className="ml-2 font-medium">{totals.carbs}g</span>
            </div>
            <div>
              <span className="text-muted-foreground">Grasas:</span>
              <span className="ml-2 font-medium">{totals.fat}g</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {selectedItems.map((item, index) => {
            const data = item.data;
            const quantity = item.quantity;
            const serving =
              item.type === "food"
                ? (data as Food).serving
                : (data as Recipe).servings;

            const ratio = quantity / serving;
            const calories = Math.round(data.calories * ratio);

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="p-3 border rounded-lg flex items-center gap-3"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-sm">{data.name}</h3>
                    <span className="text-xs font-medium">{calories} kcal</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {quantity}{" "}
                    {item.type === "food"
                      ? "g"
                      : quantity === 1
                      ? "porción"
                      : "porciones"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="border"
                  onClick={() => setEditingItemIndex(index)}
                >
                  <PlusSignIcon size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="border"
                  onClick={() => removeItem(index)}
                >
                  <Delete02Icon size={12} />
                </Button>
              </div>
            );
          })}
        </div>

        <div>
          <Label className="text-xs md:text-sm" htmlFor="notes">
            Notas (opcional)
          </Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Añade notas sobre esta comida"
            className="mt-1 text-xs md:text-sm"
          />
        </div>
      </div>
    );
  };

  const renderFoodsList = () => {
    if (loading) {
      return (
        <div className="flex flex-col gap-2 justify-center items-center py-36 text-muted-foreground text-xs">
          <Icons.spinner className="h-12 w-12 animate-spin" />
          Buscando
        </div>
      );
    }

    const items = activeTab === "foods" ? filteredFoods : filteredRecipes;

    if (items.length === 0) {
      return (
        <div className="text-center py-40">
          <p className="text-muted-foreground text-sm">
            {searchQuery
              ? "No se encontraron resultados para tu búsqueda"
              : activeTab === "foods"
              ? "No hay alimentos disponibles"
              : "No hay recetas disponibles para este tipo de comida"}
          </p>
          {!searchQuery && (
            <p className="text-sm mt-2">
              <Link
                href="/nutrition/admin"
                className="text-primary hover:underline"
              >
                Ir a administración para inicializar datos
              </Link>
            </p>
          )}
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

          return (
            <button
              key={item.id}
              className={`w-full p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-4 ${
                isSelected
                  ? "border-zinc-200 dark:border-zinc-800 shadow-sm bg-muted/50"
                  : ""
              }`}
              onClick={() =>
                toggleItemSelection(
                  item,
                  activeTab === "foods" ? "food" : "recipe"
                )
              }
              type="button"
            >
              <div className="relative">
                <MacroCircle
                  calories={item.calories}
                  protein={item.protein}
                  carbs={item.carbs}
                  fat={item.fat}
                  size={60}
                />
                {/* {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-primary dark:text-black text-white rounded-full p-1">
                    <Tick02Icon size={12} />
                  </div>
                )} */}
              </div>

              <div className="flex-1 text-left">
                <h3 className="font-semibold tracking-tight">{item.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {activeTab === "foods"
                    ? `${(item as Food).serving}g por porción`
                    : `${(item as Recipe).servings} porciones`}
                </p>
                <div className="flex gap-4 text-xs mt-1">
                  <span className="text-[#FFD700]">P: {item.protein}g</span>
                  <span className="text-[#4CAF50]">C: {item.carbs}g</span>
                  <span className="text-[#FF9800]">G: {item.fat}g</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-xs px-6" size="sm">
          Registrar Comida
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Registrar Comida
          </DialogTitle>
          <DialogDescription className="text-xs">
            Selecciona los alimentos y recetas que has consumido
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs md:text-sm" htmlFor="mealType">
                Tipo de Comida
              </Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger
                  id="mealType"
                  className="mt-1 text-xs md:text-sm"
                >
                  <SelectValue placeholder="Selecciona el tipo de comida" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="text-xs md:text-sm" value="desayuno">
                    Desayuno
                  </SelectItem>
                  <SelectItem className="text-xs md:text-sm" value="almuerzo">
                    Almuerzo
                  </SelectItem>
                  <SelectItem className="text-xs md:text-sm" value="cena">
                    Cena
                  </SelectItem>
                  <SelectItem className="text-xs md:text-sm" value="snack">
                    Snack
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs md:text-sm" htmlFor="mealTime">
                Hora
              </Label>
              <div className="mt-1">
                <TimePicker
                  value={mealTime}
                  onChange={(time) => setMealTime(time)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs md:text-sm" htmlFor="mealDate">
              Fecha
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal mt-1 text-xs md:text-sm"
                  id="mealDate"
                >
                  <Calendar02Icon className="mr-2 h-4 w-4" />
                  {format(mealDate, "PPP", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={mealDate}
                  onSelect={(date) => date && setMealDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {editingItemIndex !== null ? (
          renderItemDetails()
        ) : step === "review" ? (
          <>
            {renderSelectedItemsList()}

            <div className="flex justify-between gap-2 mt-4">
              <Button
                className="text-xs px-6"
                size="sm"
                variant="outline"
                onClick={() => setStep("select")}
              >
                Volver a selección
              </Button>
              <Button
                className="text-xs px-6"
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || selectedItems.length === 0}
              >
                {submitting ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Guardando
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-primary/10">
                  {selectedItems.length} seleccionados
                </Badge>
              </div>
              {selectedItems.length > 0 && (
                <Button
                  size="sm"
                  className="text-xs px-6"
                  onClick={() => setStep("review")}
                >
                  Continuar
                </Button>
              )}
            </div>

            <div className="relative mt-2">
              <Search01Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alimento o receta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs md:text-sm"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <Cancel01Icon className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-2"
            >
              <TabsList className="grid w-full grid-cols-2 text-xs md:text-sm">
                <TabsTrigger value="foods" className="flex items-center gap-2">
                  <FishFoodIcon className="h-4 w-4" />
                  Alimentos
                </TabsTrigger>
                <TabsTrigger
                  value="recipes"
                  className="flex items-center gap-2"
                >
                  <FavouriteIcon className="h-4 w-4" />
                  Recetas
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[150px] md:h-[400px] mt-4 pr-4">
                {renderFoodsList()}
              </ScrollArea>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
