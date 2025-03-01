import DashboardStats from "@/components/dashboard/dashboard-stats";
import GoalProgress from "@/components/dashboard/goal-progress";
import NutritionSummary from "@/components/dashboard/nutrition-summary";
import ProgressChart from "@/components/dashboard/progress-chart";
import UpcomingEvents from "@/components/dashboard/upcoming-events";
import WorkoutSummary from "@/components/dashboard/workout-summary";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardStats />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProgressChart />
          <GoalProgress />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WorkoutSummary />
          <NutritionSummary />
        </div>
        <UpcomingEvents />
      </div>
    </DashboardLayout>
  );
}
