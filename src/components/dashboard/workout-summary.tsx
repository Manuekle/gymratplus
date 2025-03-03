import { ArrowRight, Clock } from "lucide-react";
import { Button } from "../ui/button";

export default function WorkoutSummary() {
  const currentWeek = {
    completed: 3,
    total: 5,
    nextWorkout: "Entrenamiento de espalda y bíceps",
  };

  const recentWorkouts = [
    {
      name: "Entrenamiento de piernas",
      date: "Hoy",
      duration: "45 min",
      exercises: 6,
      intensity: "Alta",
    },
    {
      name: "Entrenamiento de pecho y tríceps",
      date: "Ayer",
      duration: "50 min",
      exercises: 5,
      intensity: "Media",
    },
    {
      name: "Entrenamiento de hombros",
      date: "Lunes",
      duration: "40 min",
      exercises: 4,
      intensity: "Media-Alta",
    },
  ];

  return (
    <div className="p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">Resumen de Entrenamientos</h2>
        </div>
        <button className="text-xs text-gray-500 flex items-center gap-1">
          Ver todos <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border p-4 rounded-lg">
          <p className="text-sm font-bold">Semana actual</p>
          <div className="flex items-end mt-1">
            <span className="text-xl text-gray-400 font-bold">
              {currentWeek.completed}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              / {currentWeek.total} completados
            </span>
          </div>
        </div>

        <div className="border p-4 rounded-lg">
          <p className="text-sm font-bold">Siguiente entrenamiento</p>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {currentWeek.nextWorkout}
          </p>
        </div>

        <div className="border p-4 rounded-lg">
          <p className="text-sm font-bold">Progreso mensual</p>
          <div className="flex items-center mt-1">
            <span className="text-xl font-bold text-gray-500">85%</span>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-medium mb-2">Entrenamientos recientes</h3>
      <div className="space-y-3">
        {recentWorkouts.map((workout, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <div className="flex justify-between">
              <h4 className="font-medium">{workout.name}</h4>
              <span className="text-xs text-gray-500">{workout.date}</span>
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{workout.duration}</span>
              </div>
              <div>
                <span>{workout.exercises} ejercicios</span>
              </div>
              <div>
                <span>Intensidad: {workout.intensity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Button className="w-full border rounded-lg text-xs font-medium transition-colors">
          Iniciar nuevo entrenamiento
        </Button>
      </div>
    </div>
  );
}
