import { Progress } from "@/components/ui/progress";
import { ArrowRight01Icon } from "hugeicons-react";

export default function NutritionSummary() {
  const macros = [
    { name: "Calorías", consumed: 1850, goal: 2200, unit: "kcal" },
    { name: "Proteínas", consumed: 95, goal: 120, unit: "g" },
    { name: "Carbohidratos", consumed: 180, goal: 220, unit: "g" },
    { name: "Grasas", consumed: 55, goal: 70, unit: "g" },
  ];

  const calculatePercentage = (consumed: number, goal: number) => {
    return Math.min(Math.round((consumed / goal) * 100), 100);
  };

  return (
    <div className="bg-black p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {/* <Utensils className="h-5 w-5 text-green-500" /> */}
          <h2 className="text-lg font-bold">Resumen Nutricional</h2>
        </div>
        <button className="text-xs text-gray-500 flex items-center gap-1">
          Ver detalles <ArrowRight01Icon className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {macros.map((macro, index) => {
          const percentage = calculatePercentage(macro.consumed, macro.goal);
          return (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{macro.name}</span>
                <span className="text-sm">
                  {macro.consumed} / {macro.goal} {macro.unit}
                </span>
              </div>
              <div className="py-1">
                <Progress value={percentage} className="h-2" />
              </div>
              {/* <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    percentage >= 100
                      ? "bg-red-500"
                      : percentage >= 80
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div> */}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="text-sm font-medium mb-2">Comidas de hoy</h3>
        <div className="space-y-2">
          {["Desayuno", "Almuerzo", "Merienda", "Cena"].map((meal, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-4 px-3 border rounded-lg"
            >
              <span className="text-sm">{meal}</span>
              {index <= 1 ? (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Completado
                </span>
              ) : (
                <span className="text-xs text-gray-500">Pendiente</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
