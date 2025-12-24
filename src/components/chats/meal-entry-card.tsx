"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Tick02Icon } from "@hugeicons/core-free-icons";

interface MealEntryCardProps {
  data: {
    foodName: string;
    estimatedCalories: number;
    estimatedProtein: number;
    estimatedCarbs: number;
    estimatedFat: number;
    mealType: "desayuno" | "almuerzo" | "cena" | "snack";
    quantity: number;
    needsConfirmation: boolean;
  };
}

export function MealEntryCard({ data }: MealEntryCardProps) {
  const [calories, setCalories] = useState(data.estimatedCalories);
  const [protein, setProtein] = useState(data.estimatedProtein);
  const [carbs, setCarbs] = useState(data.estimatedCarbs);
  const [fat, setFat] = useState(data.estimatedFat);
  const [mealType, setMealType] = useState(data.mealType);
  const [quantity, setQuantity] = useState(data.quantity);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/nutrition/save-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName: data.foodName,
          calories,
          protein,
          carbs,
          fat,
          mealType,
          quantity,
          consumedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Error saving meal");

      setIsSaved(true);
      toast.success(`${data.foodName} guardado correctamente`);
    } catch (error) {
      toast.error("Hubo un error al guardar la comida");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden border-zinc-200/50 dark:border-zinc-800/50 bg-gradient-to-br from-zinc-50/50 to-white dark:from-zinc-950/50 dark:to-zinc-900/50">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              {data.foodName}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Estimación de calorías y macros
            </p>
          </div>
          {isSaved && (
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <HugeiconsIcon icon={Tick02Icon} className="h-4 w-4" />
              <span className="text-xs font-medium">Guardado</span>
            </div>
          )}
        </div>

        {/* Editable Fields */}
        <div className="grid grid-cols-2 gap-3">
          {/* Calories */}
          <div className="space-y-1.5">
            <Label htmlFor="calories" className="text-xs">
              Calorías
            </Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              disabled={isSaved}
              className="h-9 text-sm"
            />
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label htmlFor="quantity" className="text-xs">
              Cantidad
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={isSaved}
              className="h-9 text-sm"
            />
          </div>

          {/* Protein */}
          <div className="space-y-1.5">
            <Label htmlFor="protein" className="text-xs">
              Proteína (g)
            </Label>
            <Input
              id="protein"
              type="number"
              step="0.1"
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
              disabled={isSaved}
              className="h-9 text-sm"
            />
          </div>

          {/* Carbs */}
          <div className="space-y-1.5">
            <Label htmlFor="carbs" className="text-xs">
              Carbohidratos (g)
            </Label>
            <Input
              id="carbs"
              type="number"
              step="0.1"
              value={carbs}
              onChange={(e) => setCarbs(Number(e.target.value))}
              disabled={isSaved}
              className="h-9 text-sm"
            />
          </div>

          {/* Fat */}
          <div className="space-y-1.5">
            <Label htmlFor="fat" className="text-xs">
              Grasas (g)
            </Label>
            <Input
              id="fat"
              type="number"
              step="0.1"
              value={fat}
              onChange={(e) => setFat(Number(e.target.value))}
              disabled={isSaved}
              className="h-9 text-sm"
            />
          </div>

          {/* Meal Type */}
          <div className="space-y-1.5">
            <Label htmlFor="mealType" className="text-xs">
              Tipo de comida
            </Label>
            <Select
              value={mealType}
              onValueChange={(value: any) => setMealType(value)}
              disabled={isSaved}
            >
              <SelectTrigger className="h-9 text-sm">
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
        </div>

        {/* Save Button */}
        {!isSaved && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-9 text-sm"
          >
            {isSaving ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="h-4 w-4 mr-2 animate-spin"
                />
                Guardando...
              </>
            ) : (
              "Guardar comida"
            )}
          </Button>
        )}

        {/* Info */}
        <p className="text-xs text-zinc-500 text-center">
          Puedes ajustar los valores antes de guardar
        </p>
      </div>
    </Card>
  );
}