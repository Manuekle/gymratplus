"use client";

import { useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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

type AddMealLogButtonProps = {
  selectedDate?: Date;
};

export function AddMealLogButton({ selectedDate }: AddMealLogButtonProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("foods");
  const [mealType, setMealType] = useState("desayuno");
  const [mealTime, setMealTime] = useState(format(new Date(), "HH:mm"));
  const [mealDate, setMealDate] = useState<Date>(selectedDate || new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      toast({
        title: "Error",
        description: "No se pudieron cargar los alimentos",
        variant: "destructive",
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
      toast({
        title: "Error",
        description: "No se pudieron cargar las recetas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchFoods();
      fetchRecipes();
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
    setSelectedItemId("");
    setQuantity("1");
    setNotes("");
    setActiveTab("foods");
  };

  const handleSubmit = async () => {
    if (!selectedItemId) {
      toast({
        title: "Error",
        description: "Debes seleccionar un alimento o receta",
        variant: "destructive",
      });
      return;
    }

    if (!quantity || Number.parseFloat(quantity) <= 0) {
      toast({
        title: "Error",
        description: "La cantidad debe ser mayor que cero",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create a date object with the selected date and time
      const consumedAt = new Date(mealDate);
      const [hours, minutes] = mealTime.split(":").map(Number);

      // Establecer las horas y minutos sin modificar la fecha
      consumedAt.setHours(hours, minutes, 0, 0);

      console.log("Fecha seleccionada:", mealDate);
      console.log("Hora seleccionada:", mealTime);
      console.log("Fecha final a enviar:", consumedAt.toISOString());

      const payload = {
        mealType,
        consumedAt: consumedAt.toISOString(),
        quantity: Number.parseFloat(quantity),
        notes: notes || null,
        ...(activeTab === "foods"
          ? { foodId: selectedItemId }
          : { recipeId: selectedItemId }),
      };

      console.log("Enviando datos:", payload);

      const response = await fetch("/api/meal-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", response.status, errorData);
        throw new Error(
          `Error al registrar la comida: ${response.status} ${
            errorData.error || ""
          }`
        );
      }

      const data = await response.json();
      console.log("Respuesta exitosa:", data);

      setOpen(false);
      resetForm();

      toast({
        title: "Comida registrada",
        description: "La comida ha sido registrada correctamente",
      });

      // Reload the page to show the new meal log
      window.location.reload();
    } catch (error) {
      console.error("Error adding meal log:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo registrar la comida",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="text-xs">
          Registrar Comida
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Registrar Comida</DialogTitle>
          <DialogDescription>
            Registra lo que has comido para llevar un seguimiento de tu
            alimentación
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mealType" className="text-right">
              Tipo de Comida
            </Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger className="col-span-3">
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mealDate" className="text-right">
              Fecha
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    {format(mealDate, "PPP")}
                    <span className="sr-only">Seleccionar fecha</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={mealDate}
                    onSelect={(date) => date && setMealDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mealTime" className="text-right">
              Hora
            </Label>
            <Input
              id="mealTime"
              type="time"
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="foods">Alimentos</TabsTrigger>
            <TabsTrigger value="recipes">Recetas</TabsTrigger>
          </TabsList>

          <div className="flex items-center border rounded-md px-3 py-2 mt-4">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 p-0 shadow-none focus-visible:ring-0"
            />
          </div>

          <TabsContent value="foods" className="mt-2">
            <div className="h-[300px] overflow-y-auto border rounded-md p-2">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <p>Cargando alimentos...</p>
                </div>
              ) : filteredFoods.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full p-4 text-center">
                  <p className="text-muted-foreground mb-2">
                    {searchQuery
                      ? "No se encontraron alimentos que coincidan con la búsqueda"
                      : "No hay alimentos disponibles"}
                  </p>
                  {!searchQuery && (
                    <p className="text-sm">
                      Ve a la página de{" "}
                      <Link
                        href="/nutrition/admin"
                        className="text-primary hover:underline"
                      >
                        Administración
                      </Link>{" "}
                      para inicializar los alimentos
                    </p>
                  )}
                </div>
              ) : (
                <RadioGroup
                  value={selectedItemId}
                  onValueChange={setSelectedItemId}
                >
                  <div className="space-y-2">
                    {filteredFoods.map((food) => (
                      <div key={food.id} className="flex items-start space-x-2">
                        <RadioGroupItem
                          value={food.id}
                          id={`food-${food.id}`}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={`food-${food.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <Card className="border-0 shadow-none hover:bg-muted/50">
                            <CardHeader className="p-3 pb-1">
                              <CardTitle className="text-base">
                                {food.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {food.category} - {food.serving}g por porción
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <div className="grid grid-cols-4 gap-1 text-xs">
                                <div>
                                  <span className="text-muted-foreground">
                                    Calorías:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {food.calories}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    P:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {food.protein}g
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    C:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {food.carbs}g
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    G:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {food.fat}g
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="mt-2">
            <div className="h-[300px] overflow-y-auto border rounded-md p-2">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <p>Cargando recetas...</p>
                </div>
              ) : filteredRecipes.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full p-4 text-center">
                  <p className="text-muted-foreground mb-2">
                    {searchQuery
                      ? "No se encontraron recetas que coincidan con la búsqueda"
                      : mealType
                      ? "No hay recetas disponibles para este tipo de comida"
                      : "No hay recetas disponibles"}
                  </p>
                  {!searchQuery && !filteredRecipes.length && (
                    <p className="text-sm">
                      Ve a la página de{" "}
                      <Link
                        href="/nutrition/admin"
                        className="text-primary hover:underline"
                      >
                        Administración
                      </Link>{" "}
                      para inicializar las recetas
                    </p>
                  )}
                </div>
              ) : (
                <RadioGroup
                  value={selectedItemId}
                  onValueChange={setSelectedItemId}
                >
                  <div className="space-y-2">
                    {filteredRecipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="flex items-start space-x-2"
                      >
                        <RadioGroupItem
                          value={recipe.id}
                          id={`recipe-${recipe.id}`}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={`recipe-${recipe.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <Card className="border-0 shadow-none hover:bg-muted/50">
                            <CardHeader className="p-3 pb-1">
                              <CardTitle className="text-base">
                                {recipe.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {recipe.servings}{" "}
                                {recipe.servings > 1 ? "porciones" : "porción"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                              <div className="grid grid-cols-4 gap-1 text-xs">
                                <div>
                                  <span className="text-muted-foreground">
                                    Calorías:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {recipe.calories}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    P:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {recipe.protein}g
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    C:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {recipe.carbs}g
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    G:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {recipe.fat}g
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-4 items-center gap-4 mt-4">
          <Label htmlFor="quantity" className="text-right">
            Cantidad
          </Label>
          <Input
            id="quantity"
            type="number"
            min="0.1"
            step="0.1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4 mt-4">
          <Label htmlFor="notes" className="text-right">
            Notas
          </Label>
          <Input
            id="notes"
            placeholder="Notas adicionales (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="col-span-3"
          />
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Registrando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
