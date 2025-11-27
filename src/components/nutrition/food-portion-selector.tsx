"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPredefinedPortions,
  calculateMacrosForPortion,
  formatPortionLabel,
  type FoodPortion,
} from "@/lib/nutrition/food-portions";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

interface FoodPortionSelectorProps {
  food: {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving: number;
    category: string;
    servingUnit?: string | null;
  };
  currentQuantity: number; // en porciones (servings)
  onQuantityChange: (quantity: number) => void;
  onClose?: () => void;
}

export function FoodPortionSelector({
  food,
  currentQuantity,
  onQuantityChange,
  onClose,
}: FoodPortionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState<"g" | "ml" | "unidad">("g");

  const servingBase = food.serving || 100;
  // Usar servingUnit del alimento si está disponible, sino inferir de la categoría
  const servingUnit: "g" | "ml" | "unidad" =
    (food.servingUnit as "g" | "ml" | "unidad") ||
    (food.category === "beverages"
      ? "ml"
      : food.category === "eggs"
        ? "unidad"
        : "g");

  const predefinedPortions = getPredefinedPortions(
    food.category,
    servingBase,
    servingUnit,
  );

  // Calcular cantidad actual en gramos/ml
  const currentQuantityInBase = currentQuantity * servingBase;

  const handlePortionSelect = (portion: FoodPortion) => {
    // Convertir a porciones (servings)
    const quantityInServings = portion.value / servingBase;
    onQuantityChange(quantityInServings);
    setIsOpen(false);
    onClose?.();
  };

  const handleCustomSubmit = () => {
    const value = parseFloat(customValue);
    if (isNaN(value) || value <= 0) {
      return;
    }

    // Convertir a gramos/ml base
    let baseValue = value;
    if (customUnit === "unidad") {
      baseValue = value * servingBase;
    }

    // Convertir a porciones (servings)
    const quantityInServings = baseValue / servingBase;
    onQuantityChange(quantityInServings);
    setCustomValue("");
    setIsOpen(false);
    onClose?.();
  };

  const baseMacros = {
    calories: food.calories,
    protein: food.protein,
    carbs: food.carbs,
    fat: food.fat,
  };

  const currentMacros = calculateMacrosForPortion(
    baseMacros,
    servingBase,
    currentQuantityInBase,
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="h-8 text-xs justify-between min-w-[120px]"
        >
          <span className="truncate">
            {formatPortionLabel(
              currentQuantityInBase,
              servingUnit,
              servingBase,
            )}
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className="ml-2 h-3 w-3 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-medium mb-2 block">
              Porciones predefinidas
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedPortions.map((portion, idx) => {
                const portionMacros = calculateMacrosForPortion(
                  baseMacros,
                  servingBase,
                  portion.value,
                );
                const isSelected =
                  Math.abs(portion.value - currentQuantityInBase) < 1;

                return (
                  <button
                    key={idx}
                    onClick={() => handlePortionSelect(portion)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-accent border-border"
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {portion.label}
                    </div>
                    <div className="text-xs opacity-80">
                      {portionMacros.calories} kcal
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-xs font-medium mb-2 block">
              Porción personalizada
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Cantidad"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="h-8 text-xs"
                min="0"
                step="0.1"
              />
              <Select
                value={customUnit}
                onValueChange={(value) =>
                  setCustomUnit(value as "g" | "ml" | "unidad")
                }
              >
                <SelectTrigger className="h-8 text-xs w-[100px]" size="default">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="unidad">unidad</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="default"
                onClick={handleCustomSubmit}
                className="h-8 text-xs"
              >
                Aplicar
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Calorías:</span>
                <span className="font-medium">
                  {Math.round(currentMacros.calories)} kcal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proteína:</span>
                <span className="font-medium">
                  {currentMacros.protein % 1 === 0
                    ? `${Math.round(currentMacros.protein)}g`
                    : `${currentMacros.protein.toFixed(1)}g`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carbohidratos:</span>
                <span className="font-medium">
                  {currentMacros.carbs % 1 === 0
                    ? `${Math.round(currentMacros.carbs)}g`
                    : `${currentMacros.carbs.toFixed(1)}g`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Grasas:</span>
                <span className="font-medium">
                  {currentMacros.fat % 1 === 0
                    ? `${Math.round(currentMacros.fat)}g`
                    : `${currentMacros.fat.toFixed(1)}g`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
