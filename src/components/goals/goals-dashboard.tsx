"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
// import { useTheme } from "next-themes";
import { useGoals, type Goal, type GoalType } from "@/hooks/use-goals";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { UpdateGoal } from "./update-goal";
import ProgressSkeleton from "../skeleton/progress-skeleton";
import { DeleteGoal } from "./delete-goal";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  SquareArrowUp01Icon,
  Target02Icon,
  WeightScaleIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function GoalsDashboard() {
  // const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<GoalType | "all">("all");

  const { isLoading, goals, fetchGoals } = useGoals();

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadGoals = useCallback(async () => {
    if (activeTab === "all") {
      // Solo mostrar objetivos activos en el dashboard
      await fetchGoals(undefined, "active");
    } else {
      await fetchGoals(activeTab, "active");
    }
  }, [activeTab, fetchGoals]);

  useEffect(() => {
    if (mounted) {
      loadGoals();
    }
  }, [mounted, loadGoals]);

  const handleFormSuccess = async () => {
    await fetchGoals(
      activeTab === "all" ? undefined : activeTab,
      undefined,
      true,
    );
  };

  if (!mounted) {
    return null;
  }

  // const currentTheme = theme === "system" ? systemTheme : theme;
  // const isDark = currentTheme === "dark";

  const getGoalTypeIcon = (type: GoalType) => {
    switch (type) {
      case "weight":
        return (
          <HugeiconsIcon
            icon={WeightScaleIcon}
            size={18}
            className="text-black dark:text-white"
          />
        );
      case "strength":
        return (
          <HugeiconsIcon
            icon={SquareArrowUp01Icon}
            size={18}
            className="text-black dark:text-white"
          />
        );
      case "measurement":
        return (
          <HugeiconsIcon
            icon={Target02Icon}
            size={18}
            className="text-black dark:text-white"
          />
        );
      case "activity":
        return (
          <HugeiconsIcon
            icon={Calendar01Icon}
            size={18}
            className="text-black dark:text-white"
          />
        );
    }
  };

  const getGoalStatusColor = (goal: Goal) => {
    if (goal.status === "completed") return "";
    if (goal.status === "abandoned") return "";

    // Si tiene fecha objetivo, verificar si está próxima
    if (goal.targetDate) {
      const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());
      if (daysLeft < 0) return ""; // Vencido
      if (daysLeft < 7) return ""; // Próximo a vencer
    }

    return "";
  };

  const getGoalStatusText = (goal: Goal) => {
    if (goal.status === "completed") return "Completado";
    if (goal.status === "abandoned") return "Abandonado";

    // Si tiene fecha objetivo, mostrar días restantes
    if (goal.targetDate) {
      const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());
      if (daysLeft <= 0) return "Vencido";
      if (daysLeft === 1) return "Mañana";
      return `${daysLeft} días restantes`;
    }

    return "En progreso";
  };

  const renderGoalCard = (goal: Goal, index: number) => {
    const progressValue = goal.progress || 0;

    return (
      <motion.div
        key={goal.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
      >
        <Card className="w-full mb-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-lg bg-muted mt-0.5">
                  {getGoalTypeIcon(goal.type as GoalType)}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-2xl font-semibold tracking-heading mb-1">
                    {goal.title}
                  </CardTitle>
                  {goal.description && (
                    <CardDescription className="text-muted-foreground text-xs line-clamp-2">
                      {goal.description}
                    </CardDescription>
                  )}
                </div>
              </div>
              <Badge
                variant="outline"
                className={`${getGoalStatusColor(goal)} text-xs flex-shrink-0`}
              >
                {getGoalStatusText(goal)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pt-0">
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-semibold text-primary">
                    {progressValue.toFixed(0)}%
                  </span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[10px]">
                    Valor inicial
                  </span>
                  <p className="font-medium">
                    {goal.initialValue} {goal.unit}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[10px]">
                    Valor actual
                  </span>
                  <p className="font-medium text-primary">
                    {goal.currentValue} {goal.unit}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground text-[10px]">
                    Objetivo
                  </span>
                  <p className="font-medium">
                    {goal.targetValue} {goal.unit}
                  </p>
                </div>
                {goal.targetDate && (
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[10px]">
                      Fecha objetivo
                    </span>
                    <p className="font-medium">
                      {format(new Date(goal.targetDate), "d MMM yyyy", {
                        locale: es,
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-3 gap-2 border-t">
            <UpdateGoal goal={goal} onSuccess={handleFormSuccess} />
            <DeleteGoal goal={goal} onSuccess={handleFormSuccess} />
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="w-full space-y-6">
      <Tabs
        className="space-y-4"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as GoalType | "all")}
      >
        <div className="flex sm:flex-col md:flex-row flex-col gap-4 md:gap-0 justify-between items-center">
          <div className="w-full md:w-fit overflow-x-auto md:overflow-visible">
            <TabsList className="inline-flex flex-wrap h-auto gap-1.5 sm:gap-2 p-1.5 w-full sm:w-auto min-w-0">
              <TabsTrigger value="all" className="flex-shrink-0">
                Todos
              </TabsTrigger>
              <TabsTrigger value="weight" className="flex-shrink-0">
                Peso
              </TabsTrigger>
              <TabsTrigger value="strength" className="flex-shrink-0">
                Fuerza
              </TabsTrigger>
              <TabsTrigger value="measurement" className="flex-shrink-0">
                Medidas
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-shrink-0">
                Actividad
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex items-center gap-2 w-full md:w-fit">
            <Link href="/dashboard/health/goals/history">
              <Button size="sm" className="text-xs" variant="outline">
                Ver historial
              </Button>
            </Link>
            <Link href="/dashboard/health/goal">
              <Button size="sm" className="text-xs w-full" variant="default">
                Nuevo objetivo
              </Button>
            </Link>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center ">
              {/* <Icons.spinner className="h-12 w-12 text-muted-foreground animate-spin" /> */}
              <ProgressSkeleton />
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xs font-medium mb-2">
                No hay objetivos activos
              </h3>
              <p className="text-muted-foreground text-xs mb-4 max-w-sm mx-auto">
                Establece objetivos para hacer seguimiento de tu progreso y
                alcanzar tus metas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal, index) => renderGoalCard(goal, index))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
