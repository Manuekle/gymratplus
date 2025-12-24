"use client";

import { useState } from "react";
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
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Tick02Icon, RiceBowl01Icon } from "@hugeicons/core-free-icons";

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
    <Card className="w-full min-w-[300px] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <HugeiconsIcon icon={RiceBowl01Icon} className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold leading-none">{data.foodName}</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wide">
              {mealType}
            </p>
          </div>
        </div>

        {isSaved ? (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 gap-1 pr-2">
            <HugeiconsIcon icon={Tick02Icon} className="w-3 h-3" />
            GUARDADO
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            EDITAR
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Calorías</Label>
            <div className="relative">
              <Input
                type="number"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                disabled={isSaved}
                className="h-9 pr-8 tabular-nums font-medium"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">kcal</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Porciones</Label>
            <Input
              type="number"
              step="0.5"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={isSaved}
              className="h-9 tabular-nums font-medium"
            />
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase text-blue-500 font-bold tracking-wider">Prot (g)</Label>
            <Input
              type="number"
              value={protein}
              onChange={(e) => setProtein(Number(e.target.value))}
              disabled={isSaved}
              className="h-8 text-xs tabular-nums bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30 focus-visible:ring-blue-500/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase text-orange-500 font-bold tracking-wider">Carb (g)</Label>
            <Input
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(Number(e.target.value))}
              disabled={isSaved}
              className="h-8 text-xs tabular-nums bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/30 focus-visible:ring-orange-500/30"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase text-yellow-500 font-bold tracking-wider">Grasa (g)</Label>
            <Input
              type="number"
              value={fat}
              onChange={(e) => setFat(Number(e.target.value))}
              disabled={isSaved}
              className="h-8 text-xs tabular-nums bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/30 focus-visible:ring-yellow-500/30"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-3">
        <Select
          value={mealType}
          onValueChange={(value: any) => setMealType(value)}
          disabled={isSaved}
        >
          <SelectTrigger className="h-9 w-[130px] text-xs font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desayuno">Desayuno</SelectItem>
            <SelectItem value="almuerzo">Almuerzo</SelectItem>
            <SelectItem value="cena">Cena</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
          </SelectContent>
        </Select>

        {!isSaved && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 h-9 text-xs font-bold uppercase tracking-wide"
          >
            {isSaving ? (
              <HugeiconsIcon
                icon={Loading03Icon}
                className="h-3 w-3 animate-spin mr-2"
              />
            ) : (
              "Confirmar"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
