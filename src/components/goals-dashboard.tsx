"use client";

import { useEffect, useState } from "react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
// import { useTheme } from "next-themes";
import { useGoals, type Goal, type GoalType } from "@/hooks/use-goals";
import { Button } from "@/components/ui/button";
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
import GoalProgressForm from "@/components/goal-progress-form";
import { Icons } from "./icons";
import {
  Award01Icon,
  Calendar01Icon,
  SquareArrowUp01Icon,
  Target02Icon,
  WeightScaleIcon,
} from "hugeicons-react";
import { NewGoal } from "./goals/new-goal";
import { UpdateGoal } from "./goals/update-goal";

export function GoalsDashboard() {
  // const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<GoalType | "weight">("weight");
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const { isLoading, goals, fetchGoals } = useGoals();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadGoals();
    }
  }, [mounted, activeTab]);

  const loadGoals = async () => {
    if (activeTab === "all") {
      await fetchGoals();
    } else {
      await fetchGoals(activeTab);
    }
  };

  const handleUpdateProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowProgressForm(true);
  };

  const handleFormSuccess = () => {
    setShowProgressForm(false);
    setSelectedGoal(null);
    setEditingGoal(null);
    loadGoals();
  };

  if (!mounted) {
    return null;
  }

  // const currentTheme = theme === "system" ? systemTheme : theme;
  // const isDark = currentTheme === "dark";

  const getGoalTypeIcon = (type: GoalType) => {
    switch (type) {
      case "weight":
        return <WeightScaleIcon size={18} className="text-blue-500" />;
      case "strength":
        return <SquareArrowUp01Icon size={18} className="text-purple-500" />;
      case "measurement":
        return <Target02Icon size={18} className="text-green-500" />;
      case "activity":
        return <Calendar01Icon size={18} className="text-orange-500" />;
    }
  };

  const getGoalStatusColor = (goal: Goal) => {
    if (goal.status === "completed") return "bg-green-500";
    if (goal.status === "abandoned") return "bg-gray-500";

    // Si tiene fecha objetivo, verificar si está próxima
    if (goal.targetDate) {
      const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());
      if (daysLeft < 0) return "bg-red-500"; // Vencido
      if (daysLeft < 7) return "bg-yellow-500"; // Próximo a vencer
    }

    return "bg-blue-500";
  };

  const getGoalStatusText = (goal: Goal) => {
    if (goal.status === "completed") return "Completado";
    if (goal.status === "abandoned") return "Abandonado";

    // Si tiene fecha objetivo, mostrar días restantes
    if (goal.targetDate) {
      const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());
      if (daysLeft < 0) return "Vencido";
      if (daysLeft === 0) return "Hoy";
      if (daysLeft === 1) return "Mañana";
      return `${daysLeft} días restantes`;
    }

    return "En progreso";
  };

  const renderGoalCard = (goal: Goal) => {
    const progressValue = goal.progress || 0;

    return (
      <Card key={goal.id} className="w-full mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex flex-row gap-2 items-center justify-center">
              {getGoalTypeIcon(goal.type as GoalType)}
              <CardTitle className="text-sm font-normal capitalize">
                {goal.title}
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className={`${getGoalStatusColor(goal)} text-white`}
            >
              {getGoalStatusText(goal)}
            </Badge>
          </div>
          <CardDescription>{goal.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span>Progreso:</span>
                <span className="font-medium">{progressValue.toFixed(0)}%</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Valor inicial:</span>
                <p className="font-medium">
                  {goal.initialValue} {goal.unit}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor actual:</span>
                <p className="font-medium">
                  {goal.currentValue} {goal.unit}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Objetivo:</span>
                <p className="font-medium">
                  {goal.targetValue} {goal.unit}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Fecha inicio:</span>
                <p className="font-medium">
                  {format(new Date(goal.startDate), "d MMM yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-2">
          <UpdateGoal goal={goal} onSuccess={handleFormSuccess} />
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="w-full space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as GoalType | "weight")}
      >
        <div className="flex md:flex-row flex-col justify-between">
          <TabsList className="mb-4 tracking-wider gap-3">
            <TabsTrigger value="weight">Peso</TabsTrigger>
            <TabsTrigger value="strength">Fuerza</TabsTrigger>
            <TabsTrigger value="measurement">Medidas</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>
          <NewGoal
            onSuccess={handleFormSuccess}
            initialData={editingGoal || undefined}
          />
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-28">
              <Icons.spinner className="h-12 w-12 text-muted-foreground animate-spin" />
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-28">
              <Award01Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-sm font-medium mb-2">No hay objetivos</h3>
              <p className="text-muted-foreground text-xs mb-4">
                Establece objetivos para hacer seguimiento de tu progreso
              </p>
              <NewGoal
                onSuccess={handleFormSuccess}
                initialData={editingGoal || undefined}
              />
            </div>
          ) : (
            <div className="gap-4">{goals.map(renderGoalCard)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
