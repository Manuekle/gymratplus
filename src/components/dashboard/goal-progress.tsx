import { Progress } from "@/components/ui/progress";
import { ArrowRight01Icon } from "hugeicons-react";

export default function GoalProgress() {
  const goals = [
    {
      title: "Pérdida de peso",
      target: "5kg",
      progress: 60,
      timeframe: "2 meses",
      color: "bg-blue-500",
    },
    {
      title: "Entrenamientos semanales",
      target: "4 sesiones",
      progress: 75,
      timeframe: "Esta semana",
      color: "bg-green-500",
    },
    {
      title: "Consumo de proteínas",
      target: "120g diarios",
      progress: 85,
      timeframe: "Hoy",
      color: "bg-white",
    },
  ];

  return (
    <div className="p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Progreso de Objetivos</h2>
        <button className="text-xs text-gray-500 flex items-center gap-1">
          Ver todos <ArrowRight01Icon className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">{goal.title}</span>
              <span className="text-sm text-gray-500">
                {goal.progress}% completado
              </span>
            </div>
            <div className="py-1">
              <Progress value={goal.progress} className="h-2" />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Meta: {goal.target}</span>
              <span className="text-xs text-gray-500">{goal.timeframe}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
