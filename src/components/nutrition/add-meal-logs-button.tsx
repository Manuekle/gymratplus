"use client";

import { useState, useEffect } from "react";
import {
  PlusCircle,
  Search,
  Heart,
  Database,
  X,
  Plus,
  Minus,
  Calendar,
  Check,
  Trash,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
  defaultMealType?: "desayuno" | "almuerzo" | "cena" | "snack";
  buttonText?: string;
  planId?: string;
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
  // Calcular porcentajes para el gráfico circular
  const total = protein * 4 + carbs * 4 + fat * 9;
  const proteinPct = total > 0 ? (protein * 4 * 100) / total : 0;
  const carbsPct = total > 0 ? (carbs * 4 * 100) / total : 0;
  const fatPct = total > 0 ? (fat * 9 * 100) / total : 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {/* Círculo base */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="10"
          className="opacity-20"
        />

        {/* Proteínas (amarillo) */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--warning))"
          strokeWidth="10"
          strokeDasharray={`${proteinPct} ${100 - proteinPct}`}
          strokeLinecap="round"
        />

        {/* Carbohidratos (verde) */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--success))"
          strokeWidth="10"
          strokeDasharray={`${carbsPct} ${100 - carbsPct}`}
          strokeDashoffset={-proteinPct}
          strokeLinecap="round"
        />

        {/* Grasas (naranja) */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--destructive))"
          strokeWidth="10"
          strokeDasharray={`${fatPct} ${100 - fatPct}`}
          strokeDashoffset={-(proteinPct + carbsPct)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-2xl font-bold">{calories}</span>
          <span className="text-sm text-muted-foreground block">kcal</span>
        </div>
      </div>
    </div>
  );
}

export function AddMealLogButton({
  selectedDate,
  defaultMealType = "desayuno",
  buttonText = "Registrar Comida",
  planId,
}: AddMealLogButtonProps = {}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("foods");
  const [mealType, setMealType] = useState(defaultMealType);
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

  // Actualizar el tipo de comida cuando cambia el prop defaultMealType
  useEffect(() => {
    setMealType(defaultMealType);
  }, [defaultMealType]);

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
    setMealType(defaultMealType);
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
          planId: planId, // Incluir el planId si está disponible
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
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedItem.type === "food"
                  ? `${(item as Food).serving}g por porción`
                  : `${(item as Recipe).servings} porciones`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingItemIndex(null)}
            >
              <X className="h-4 w-4" />
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
                <Minus className="h-4 w-4" />
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
                className="text-center"
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
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/20">
            <h4 className="font-medium mb-2">
              Total para {quantity} {quantity === 1 ? "porción" : "porciones"}:
            </h4>
            <div className="grid grid-cols-2 gap-4">
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
          <Button variant="outline" onClick={() => setEditingItemIndex(null)}>
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
          <p className="text-muted-foreground">
            No has seleccionado ningún alimento
          </p>
        </div>
      );
    }

    const totals = calculateTotals();

    return (
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-muted/20">
          <h4 className="font-medium mb-2">Totales:</h4>
          <div className="grid grid-cols-2 gap-4">
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
                  <div className="flex justify-between">
                    <h3 className="font-medium">{data.name}</h3>
                    <span className="text-sm font-medium">{calories} kcal</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
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
                  onClick={() => setEditingItemIndex(index)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <div>
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Añade notas sobre esta comida"
            className="mt-1"
          />
        </div>
      </div>
    );
  };

  const renderFoodsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    const items = activeTab === "foods" ? filteredFoods : filteredRecipes;

    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
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
                isSelected ? "border-primary bg-primary/5" : ""
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
                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-left">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "foods"
                    ? `${(item as Food).serving}g por porción`
                    : `${(item as Recipe).servings} porciones`}
                </p>
                <div className="flex gap-4 text-xs mt-1">
                  <span className="text-warning">P: {item.protein}g</span>
                  <span className="text-success">C: {item.carbs}g</span>
                  <span className="text-destructive">G: {item.fat}g</span>
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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Registrar Comida</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mealType">Tipo de Comida</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger id="mealType" className="mt-1">
                  <SelectValue placeholder="Selecciona el tipo de comida" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desayuno">Desayuno</SelectItem>
                  <SelectItem value="almuerzo">Almuerzo</SelectItem>
                  <SelectItem value="cena">Cena</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mealTime">Hora</Label>
              <div className="mt-1">
                <TimePicker
                  value={mealTime}
                  onChange={(time) => setMealTime(time)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="mealDate">Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal mt-1"
                  id="mealDate"
                >
                  <Calendar className="mr-2 h-4 w-4" />
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
              <Button variant="outline" onClick={() => setStep("select")}>
                Volver a selección
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || selectedItems.length === 0}
              >
                {submitting ? "Guardando..." : "Guardar"}
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
                <Button size="sm" onClick={() => setStep("review")}>
                  Continuar
                </Button>
              )}
            </div>

            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alimento o receta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-2"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="foods" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Alimentos
                </TabsTrigger>
                <TabsTrigger
                  value="recipes"
                  className="flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Recetas
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[400px] mt-4 pr-4">
                {renderFoodsList()}
              </ScrollArea>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
