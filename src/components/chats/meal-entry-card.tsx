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
    <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold truncate pr-2">{data.foodName}</h3>
        {isSaved && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 animate-in zoom-in duration-300">
            <HugeiconsIcon icon={Tick02Icon} className="h-3 w-3" />
            <span className="text-xs whitespace-nowrap">Guardado</span>
          </div>
        )}
      </div>

      {/* Responsive Grid - 2 cols on mobile, 3 on tablet, 6 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 animate-in slide-in-from-bottom-3 duration-500 delay-100">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 dark:text-zinc-400 block">
            Calorías
          </label>
          <Input
            type="number"
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            disabled={isSaved}
            className="h-8 text-xs px-2 transition-all duration-200 focus:scale-[1.02]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 dark:text-zinc-400 block">
            Cantidad (g)
          </label>
          <Input
            type="number"
            step="0.1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={isSaved}
            className="h-8 text-xs px-2 transition-all duration-200 focus:scale-[1.02]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 dark:text-zinc-400 block">
            Proteína (g)
          </label>
          <Input
            type="number"
            step="0.1"
            value={protein}
            onChange={(e) => setProtein(Number(e.target.value))}
            disabled={isSaved}
            className="h-8 text-xs px-2 transition-all duration-200 focus:scale-[1.02]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 dark:text-zinc-400 block">
            Carbos (g)
          </label>
          <Input
            type="number"
            step="0.1"
            value={carbs}
            onChange={(e) => setCarbs(Number(e.target.value))}
            disabled={isSaved}
            className="h-8 text-xs px-2 transition-all duration-200 focus:scale-[1.02]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 dark:text-zinc-400 block">
            Grasas (g)
          </label>
          <Input
            type="number"
            step="0.1"
            value={fat}
            onChange={(e) => setFat(Number(e.target.value))}
            disabled={isSaved}
            className="h-8 text-xs px-2 transition-all duration-200 focus:scale-[1.02]"
          />
        </div>
        <div className="space-y-1 col-span-2 md:col-span-1">
          <label className="text-xs text-zinc-500 dark:text-zinc-400 block">
            Tipo
          </label>
          <Select
            value={mealType}
            onValueChange={(value: any) => setMealType(value)}
            disabled={isSaved}
          >
            <SelectTrigger className="h-8 text-xs px-2 transition-all duration-200 focus:scale-[1.02]">
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
        <div className="flex justify-end animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="h-8 text-xs transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {isSaving ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="h-3 w-3 mr-1.5 animate-spin"
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
