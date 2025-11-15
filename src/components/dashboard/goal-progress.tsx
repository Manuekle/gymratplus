"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useGoals, type GoalType } from "@/hooks/use-goals";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  WeightScaleIcon,
  SquareArrowUp01Icon,
  Target02Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/skeleton";

export default function GoalProgress() {
  const [mounted, setMounted] = useState(false);
  const { isLoading, goals, fetchGoals } = useGoals();

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadGoals = useCallback(async () => {
    await fetchGoals(undefined, "active");
  }, [fetchGoals]);

  useEffect(() => {
    if (mounted) {
      loadGoals();
    }
  }, [mounted, loadGoals]);

  if (!mounted) {
    return null;
  }

  const getGoalTypeIcon = (type: GoalType) => {
    switch (type) {
      case "weight":
        return WeightScaleIcon;
      case "strength":
        return SquareArrowUp01Icon;
      case "measurement":
        return Target02Icon;
      case "activity":
        return Calendar01Icon;
    }
  };

  const displayGoals = goals.slice(0, 3); // Mostrar máximo 3 objetivos

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-heading">
          Progreso de Objetivos
        </CardTitle>
        <CardDescription>Objetivos activos en progreso</CardDescription>
        <CardAction>
          <Link
            href="/dashboard/health"
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver más
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          ) : displayGoals.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <p className="text-xs text-muted-foreground mb-3">
                No hay objetivos activos
              </p>
              <Link
                href="/dashboard/health/goal"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Crear objetivo
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="h-3.5 w-3.5"
                />
              </Link>
            </div>
          ) : (
            displayGoals.map((goal, index) => {
              const progressValue = goal.progress || 0;
              const Icon = getGoalTypeIcon(goal.type as GoalType);

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.2 }}
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="p-1.5 rounded bg-muted flex-shrink-0">
                        <HugeiconsIcon icon={Icon} className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold truncate">
                          {goal.title}
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground ml-2 flex-shrink-0">
                      {progressValue.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={progressValue} className="h-1.5 mb-2" />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      {goal.currentValue} {goal.unit}
                    </span>
                    <span>
                      / {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}

          {!isLoading && goals.length > 3 && (
            <Link
              href="/dashboard/health/goals"
              className="block text-center pt-2 group"
            >
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Ver todos los objetivos ({goals.length})
              </span>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
