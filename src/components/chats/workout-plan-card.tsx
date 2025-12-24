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
  Dumbbell03Icon,
  Time02Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  FloppyDiskIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils/utils";

interface WorkoutPlanCardProps {
  plan: {
    focus: string;
    daysPerWeek: number;
    durationMinutes: number;
    difficulty: string;
    description?: string; // Optional detailed text if we want to show it
  };
  onSave?: () => void;
  isSaved?: boolean;
}

export function WorkoutPlanCard({
  plan,
  onSave,
  isSaved,
}: WorkoutPlanCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card className="w-full max-w-md my-2 border-primary/20 bg-card overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <HugeiconsIcon
              icon={Dumbbell03Icon}
              className="h-4 w-4 text-primary"
            />
          </div>
          <div>
            <CardTitle className="text-xs font-bold">
              Plan de Entrenamiento
            </CardTitle>
            <p className="text-xs text-muted-foreground capitalize">
              {plan.focus}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="capitalize text-xs h-5">
          {plan.difficulty}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs">
            <HugeiconsIcon
              icon={Calendar03Icon}
              className="h-4 w-4 text-muted-foreground"
            />
            <span>{plan.daysPerWeek} días/semana</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <HugeiconsIcon
              icon={Time02Icon}
              className="h-4 w-4 text-muted-foreground"
            />
            <span>{plan.durationMinutes} min/sesión</span>
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
