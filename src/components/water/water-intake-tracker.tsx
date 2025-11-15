"use client";

import { useWaterIntake } from "@/hooks/use-water-intake";
import { WaterBottle } from "@/components/water/water-bottle";
import { WaterControls } from "@/components/water/water-controls";
import { WaterHistoryChart } from "@/components/water/water-history-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect } from "react";

export function WaterIntakeTracker() {
  const {
    intake,
    targetIntake,
    history,
    isLoading,
    isHistoryLoading,
    isUpdating,
    error,
    addWater,
    removeWater,
  } = useWaterIntake();

  useEffect(() => {
    if (error) {
      toast.error("Error", {
        description: error,
      });
    }
  }, [error]);

  const fillPercentage = (intake / targetIntake) * 100;

  if (isLoading) {
    return (
      <div className="col-span-1 md:col-span-2 grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold  tracking-heading">
              Consumo de agua
            </CardTitle>
            <CardDescription className="text-xs">
              Registro diario de consumo de agua
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 flex flex-row items-center justify-center gap-16">
            <Skeleton className="h-64 w-32 rounded-3xl mx-8 md:mx-56" />
            <div className="mt-6 flex flex-col justify-center gap-2">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <Skeleton className="h-14 w-14 rounded-xl" />
              <Skeleton className="h-14 w-14 rounded-xl" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold  tracking-heading">
              Historial
            </CardTitle>
            <CardDescription className="text-xs">
              Métricas de consumo de agua
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 flex flex-col items-center">
            <Skeleton className="h-40 w-full mt-8" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="col-span-1 md:col-span-2 grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold  tracking-heading">
            Consumo de agua
          </CardTitle>
          <CardDescription className="text-xs">
            Registro diario de consumo de agua
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="space-y-6">
            <div className="flex flex-row justify-center items-center">
              <WaterBottle fillPercentage={fillPercentage} />
              <WaterControls
                intake={intake}
                onAdd={addWater}
                onRemove={removeWater}
                isUpdating={isUpdating}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-semibold  tracking-heading">
            Historial
          </CardTitle>
          <CardDescription className="text-xs">
            Métricas de consumo de agua
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div className="space-y-6">
            <WaterHistoryChart
              history={history}
              targetIntake={targetIntake}
              isLoading={isHistoryLoading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
