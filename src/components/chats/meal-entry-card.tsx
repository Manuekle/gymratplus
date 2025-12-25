"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      toast.success(`${data.foodName} guardado`);
    } catch (error) {
      toast.error("Error al guardar");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold">{data.foodName}</h3>
        {isSaved && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <HugeiconsIcon icon={Tick02Icon} className="h-3 w-3" />
            <span className="text-xs">Guardado</span>
          </div>
        )}
      </div>

      {/* Compact Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <div>
          <span className="text-xs text-zinc-500 block">kcal</span>
          <Input
            type="number"
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            disabled={isSaved}
            className="h-7 text-xs px-2"
          />
        </div>
        <div>
          <span className="text-xs text-zinc-500 block">Cant.</span>
          <Input
            type="number"
            step="0.1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={isSaved}
            className="h-7 text-xs px-2"
          />
        </div>
        <div>
          <span className="text-xs text-zinc-500 block">P (g)</span>
          <Input
            type="number"
            step="0.1"
            value={protein}
            onChange={(e) => setProtein(Number(e.target.value))}
            disabled={isSaved}
            className="h-7 text-xs px-2"
          />
        </div>
        <div>
          <span className="text-xs text-zinc-500 block">C (g)</span>
          <Input
            type="number"
            step="0.1"
            value={carbs}
            onChange={(e) => setCarbs(Number(e.target.value))}
            disabled={isSaved}
            className="h-7 text-xs px-2"
          />
        </div>
        <div>
          <span className="text-xs text-zinc-500 block">G (g)</span>
          <Input
            type="number"
            step="0.1"
            value={fat}
            onChange={(e) => setFat(Number(e.target.value))}
            disabled={isSaved}
            className="h-7 text-xs px-2"
          />
        </div>
        <div>
          <span className="text-xs text-zinc-500 block">Tipo</span>
          <Select
            value={mealType}
            onValueChange={(value: any) => setMealType(value)}
            disabled={isSaved}
          >
            <SelectTrigger className="h-7 text-xs px-2">
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
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="h-7 text-xs"
          >
            {isSaving ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="h-3 w-3 mr-1 animate-spin"
                />
                Guardando
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
