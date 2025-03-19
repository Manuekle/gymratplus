// import { Progress } from "@/components/ui/progress";
import { GoalsDashboard } from "../goals-dashboard";

export default function GoalProgress() {
  return (
    <div className="p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Progreso de Objetivos</h2>
      </div>
      <div className="space-y-4">
        <GoalsDashboard />
      </div>
    </div>
  );
}
