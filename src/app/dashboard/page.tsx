import type { Metadata } from "next";

import GoalProgress from "@/components/dashboard/goal-progress";
import NutritionSummary from "@/components/dashboard/nutrition-summary";
import ProgressChart from "@/components/dashboard/progress-chart";
import WorkoutSummary from "@/components/dashboard/workout-summary";
import AnimatedLayout from "@/components/layouts/animated-layout";

export const metadata: Metadata = {
  title: "Dashboard - GymRat+",
  description: "Panel principal con el resumen de tu actividad y progreso",
  keywords: "dashboard, panel, resumen, actividad, progreso",
};

export default function DashboardPage() {
  return (
    <AnimatedLayout>
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
    </AnimatedLayout>
  );
}
