import { Metadata } from "next";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import WorkoutSummary from "@/components/dashboard/workout-summary";
import NutritionSummary from "@/components/dashboard/nutrition-summary";
import UpcomingEvents from "@/components/dashboard/upcoming-events";
import ProgressChart from "@/components/dashboard/progress-chart";
import GoalProgress from "@/components/dashboard/goal-progress";

export const metadata: Metadata = {
  title: "Dashboard | Fitness App",
  description: "Panel de control principal de la aplicación de fitness",
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <DashboardHeader />
        <DashboardStats />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WorkoutSummary />
          <NutritionSummary />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ProgressChart />
          </div>
          <div className="space-y-6">
            <GoalProgress />
            <UpcomingEvents />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
