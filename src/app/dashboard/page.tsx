import type { Metadata } from "next";

import GoalProgress from "@/components/dashboard/goal-progress";
import NutritionSummary from "@/components/dashboard/nutrition-summary";
import ProgressChart from "@/components/dashboard/progress-chart";
import WorkoutSummary from "@/components/dashboard/workout-summary";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Aplicación de fitness para seguimiento de entrenamientos y nutrición",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProgressChart />
        <GoalProgress />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WorkoutSummary />
        <NutritionSummary />
      </div>
    </div>
  );
}
