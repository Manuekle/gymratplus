"use client";

import React from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { es } from "date-fns/locale";
import { useGoals, type Goal, type GoalType } from "@/hooks/use-goals";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Calendar01Icon,
  Calendar02Icon,
  SquareArrowUp01Icon,
  Target02Icon,
  WeightScaleIcon,
  Award01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

export default function GoalsHistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<GoalType | "all">("all");
  const { isLoading, goals, fetchGoals } = useGoals();
  const [hasLoaded, setHasLoaded] = React.useState(false);

  const loadGoals = React.useCallback(async () => {
    setHasLoaded(false);
    try {
      if (activeTab === "all") {
        await fetchGoals(undefined, "completed", true);
      } else {
        await fetchGoals(activeTab, "completed", true);
      }
    } finally {
      setHasLoaded(true);
    }
  }, [activeTab, fetchGoals]);

  React.useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const getGoalTypeLabel = (type: GoalType) => {
    const labels: Record<GoalType, string> = {
      weight: "Peso",
      strength: "Fuerza",
      measurement: "Medidas",
      activity: "Actividad",
    };
    return labels[type] || type;
  };

  const groupedGoals = React.useMemo(() => {
    const groups: Record<string, Goal[]> = {};

    goals.forEach((goal) => {
      if (!goal.completedDate) return;
      const date = format(new Date(goal.completedDate), "yyyy-MM");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(goal);
    });

    return groups;
  }, [goals]);

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    const totalGoals = goals.length;
    const totalDays = goals.reduce((acc, goal) => {
      if (goal.completedDate && goal.startDate) {
        const days = Math.ceil(
          (new Date(goal.completedDate).getTime() -
            new Date(goal.startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return acc + days;
      }
      return acc;
    }, 0);
    const averageDays = totalGoals > 0 ? Math.round(totalDays / totalGoals) : 0;
    const byType = goals.reduce(
      (acc, goal) => {
        acc[goal.type] = (acc[goal.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return {
      totalGoals,
      averageDays,
      byType,
    };
  }, [goals]);

  const renderGoalCard = (goal: Goal) => {
    const progressValue = goal.progress || 100;
    const daysToComplete =
      goal.completedDate && goal.startDate
        ? Math.ceil(
            (new Date(goal.completedDate).getTime() -
              new Date(goal.startDate).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;
    const completedDate = goal.completedDate
      ? new Date(goal.completedDate)
      : null;

    return (
      <Card
        key={goal.id}
        className="overflow-hidden transition-all duration-300"
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-semibold tracking-heading">
                {goal.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-2 pt-1">
                <HugeiconsIcon icon={Calendar02Icon} size={12} />
                {completedDate && format(completedDate, "PPP", { locale: es })}
              </p>
            </div>
            <div className="text-right">
              <Badge
                variant="default"
                className="bg-green-500 hover:bg-green-600"
              >
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="h-3 w-3 mr-1"
                />
                Completado
              </Badge>
              <p className="text-xs font-medium mt-2">
                {progressValue.toFixed(0)}% completado
              </p>
              <Progress value={progressValue} className="h-2 w-full mt-1" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pt-4">
          {goal.description && (
            <p className="text-xs text-muted-foreground mb-4">
              {goal.description}
            </p>
          )}

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 rounded-md border">
              <p className="text-xs text-muted-foreground">Inicial</p>
              <p className="font-semibold tracking-heading">
                {goal.initialValue} {goal.unit}
              </p>
            </div>
            <div className="text-center p-2 rounded-md border">
              <p className="text-xs text-muted-foreground">Objetivo</p>
              <p className="font-semibold tracking-heading">
                {goal.targetValue} {goal.unit}
              </p>
            </div>
            <div className="text-center p-2 rounded-md border border-green-500/50 bg-green-500/5">
              <p className="text-xs text-muted-foreground">Final</p>
              <p className="font-semibold tracking-heading text-green-600 dark:text-green-400">
                {goal.currentValue} {goal.unit}
              </p>
            </div>
          </div>

          {daysToComplete && (
            <div className="text-center p-2 rounded-md border mb-4">
              <p className="text-xs text-muted-foreground">
                Tiempo de completado
              </p>
              <p className="font-semibold tracking-heading">
                {daysToComplete} {daysToComplete === 1 ? "día" : "días"}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center pt-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Award01Icon} className="h-3 w-3" />
              <span>
                {getGoalTypeLabel(goal.type as GoalType)} • Completado{" "}
                {completedDate &&
                  format(completedDate, "d MMM yyyy", { locale: es })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading || !hasLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="mb-2 text-xs w-full md:w-auto"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
              <Skeleton className="h-4 w-24 inline-block" />
            </Button>
            <Skeleton className="h-8 w-48 mt-4" />
          </div>
        </div>
        {/* Skeleton de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Card
                key={i}
                className="px-4 py-8 flex flex-row justify-between items-center"
              >
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </Card>
            ))}
        </div>

        {/* Skeleton de Tabs */}
        <div className="flex gap-4 pb-6">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>

        {/* Skeleton de tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-4 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-40" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
              </Card>
            ))}
        </div>
      </div>
    );
  }

  if (hasLoaded && goals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/health/goals")}
              className="mb-2 text-xs w-full md:w-auto"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
              Volver a objetivos
            </Button>
            <CardTitle className="text-2xl font-semibold tracking-heading pt-4">
              Historial de Objetivos
            </CardTitle>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
          <h2 className="text-xs font-medium">No hay objetivos completados</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            Aún no has completado ningún objetivo. Crea uno para comenzar a
            registrar tu progreso.
          </p>
          <Button
            size="sm"
            className="text-xs"
            onClick={() => router.push("/dashboard/health/goal")}
          >
            Crear objetivo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/health/goals")}
            className="mb-2 text-xs w-full md:w-auto"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
            Volver a objetivos
          </Button>
          <CardTitle className="text-2xl font-semibold tracking-heading pt-4">
            Historial de Objetivos
          </CardTitle>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-900 dark:to-gray-800">
          <CardContent className="px-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="gap-2 flex flex-col">
                <p className="text-xs md:text-xs text-muted-foreground dark:text-muted-foreground">
                  Total de objetivos
                </p>
                <p className="text-2xl font-semibold tracking-heading">
                  {stats.totalGoals}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-800 flex items-center justify-center">
                <HugeiconsIcon
                  icon={Target02Icon}
                  className="h-6 w-6 text-pink-600 dark:text-pink-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900 dark:to-gray-800">
          <CardContent className="px-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="gap-2 flex flex-col">
                <p className="text-xs md:text-xs text-muted-foreground dark:text-muted-foreground">
                  Tiempo promedio
                </p>
                <p className="text-2xl font-semibold">
                  {stats.averageDays} días
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  className="h-6 w-6 text-blue-600 dark:text-blue-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900 dark:to-gray-800">
          <CardContent className="px-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="gap-2 flex flex-col">
                <p className="text-xs md:text-xs text-muted-foreground dark:text-muted-foreground">
                  Objetivos de peso
                </p>
                <p className="text-2xl font-semibold">
                  {stats.byType.weight || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                <HugeiconsIcon
                  icon={WeightScaleIcon}
                  className="h-6 w-6 text-green-600 dark:text-green-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900 dark:to-gray-800">
          <CardContent className="px-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="gap-2 flex flex-col">
                <p className="text-xs md:text-xs text-muted-foreground dark:text-muted-foreground">
                  Objetivos de fuerza
                </p>
                <p className="text-2xl font-semibold">
                  {stats.byType.strength || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                <HugeiconsIcon
                  icon={SquareArrowUp01Icon}
                  className="h-6 w-6 text-purple-600 dark:text-purple-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pestañas para filtrar */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as GoalType | "all")}
      >
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 mb-4 gap-2 sm:gap-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="weight">Peso</TabsTrigger>
          <TabsTrigger value="strength">Fuerza</TabsTrigger>
          <TabsTrigger value="measurement">Medidas</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent
          value={activeTab}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {Object.entries(groupedGoals)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, goalsInMonth]) => (
              <React.Fragment key={date}>
                {goalsInMonth.map((goal) => renderGoalCard(goal))}
              </React.Fragment>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
