"use client";

import { useState } from "react";
import { GoalProgress } from "@/components/dashboard/goal-progress";
import { NutritionSummary } from "@/components/dashboard/nutrition-summary";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { WorkoutSummary } from "@/components/dashboard/workout-summary";
import { AnimatedLayout } from "@/components/layout/animated-layout";

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRecordAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AnimatedLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProgressChart
            refreshKey={refreshKey}
            onRecordAdded={handleRecordAdded}
          />
          <GoalProgress />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WorkoutSummary />
          <NutritionSummary />
        </div>
      </div>
    </AnimatedLayout>
  );
}
