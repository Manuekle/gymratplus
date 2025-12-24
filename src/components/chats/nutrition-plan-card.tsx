"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Restaurant02Icon,
  FireIcon,
  OrganicFoodIcon,
  CheckmarkCircle02Icon,
  FloppyDiskIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils/utils";

interface NutritionPlanCardProps {
  plan: {
    calories: number;
    goal: string;
    mealsPerDay: number;
    dietaryType: string;
    description?: string;
  };
  onSave?: () => void;
  isSaved?: boolean;
}

export function NutritionPlanCard({
  plan,
  onSave,
  isSaved,
}: NutritionPlanCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="w-full max-w-md my-2 border-green-500/20 bg-card overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2 bg-green-500/5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <HugeiconsIcon
              icon={Restaurant02Icon}
              className="h-4 w-4 text-green-600 dark:text-green-400"
            />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">
              Plan Nutricional
            </CardTitle>
            <p className="text-xs text-muted-foreground capitalize">
              {plan.dietaryType}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="capitalize text-[10px] h-5 border-green-200 text-green-700 dark:text-green-400"
        >
          {plan.goal.replace("_", " ")}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs">
            <HugeiconsIcon
              icon={FireIcon}
              className="h-4 w-4 text-muted-foreground"
            />
            <span>{plan.calories} kcal/día</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <HugeiconsIcon
              icon={OrganicFoodIcon}
              className="h-4 w-4 text-muted-foreground"
            />
            <span>{plan.mealsPerDay} comidas/día</span>
          </div>
        </div>

        {plan.description && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs font-medium text-muted-foreground">
                Detalles del plan
              </p>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full"
                >
                  <HugeiconsIcon
                    icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon}
                    className="h-3 w-3"
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
              {plan.description}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>

      <CardFooter className="p-3 bg-muted/20 flex justify-end gap-2">
        <Button
          variant={isSaved ? "outline" : "default"}
          size="sm"
          onClick={onSave}
          disabled={isSaved}
          className={cn(
            "text-xs h-8 gap-1.5",
            isSaved &&
              "border-green-500 text-green-600 hover:text-green-700 bg-green-50 dark:bg-green-950/20",
          )}
        >
          {isSaved ? (
            <>
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="h-3.5 w-3.5"
              />
              Guardado
            </>
          ) : (
            <>
              <HugeiconsIcon icon={FloppyDiskIcon} className="h-3.5 w-3.5" />
              Guardar Plan
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
