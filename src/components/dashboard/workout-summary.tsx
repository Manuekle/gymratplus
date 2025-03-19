"use client";

import { useState, useEffect } from "react";
import { ArrowRight01Icon, Clock01Icon } from "hugeicons-react";
import { Button } from "../ui/button";
import { es } from "date-fns/locale";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function WorkoutSummary() {
  const [loading, setLoading] = useState(true);
  const [workoutSessions, setWorkoutSessions] = useState<any[]>([]);

  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      try {
        const response = await fetch("/api/workout-session/history");
        if (response.ok) {
          const data = await response.json();
          setWorkoutSessions(data);
        }
      } catch (error) {
        console.error("Error al cargar el historial de entrenamientos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutHistory();
  }, []);

  return (
    <div className="p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">Resumen de Entrenamientos</h2>
        </div>
        <Link
          href="workout/history"
          className="text-xs text-gray-500 flex items-center gap-1"
        >
          Ver todos
          <ArrowRight01Icon className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
      </div> */}

      <h3 className="text-sm font-medium mb-2">Entrenamientos recientes</h3>
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : workoutSessions.length === 0 ? (
          <div className="justify-center h-24 md:h-80 items-center flex flex-col">
            <h2 className="text-sm font-medium">
              No hay entrenamientos recientes.
            </h2>
            <p className="text-muted-foreground text-xs">
              Inicia un nuevo entrenamiento para ver tu historial aquí.
            </p>
          </div>
        ) : (
          workoutSessions.map((session) => (
            <div key={session.id} className="p-3 border rounded-lg">
              <div className="flex justify-between">
                <h4 className="font-medium">
                  {" "}
                  {session.notes?.replace("Día: ", "") || "Entrenamiento"}
                </h4>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(session.date), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
              <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Clock01Icon className="h-3 w-3 mr-1 text-foreground" />
                  <span>
                    {session.duration ? `${session.duration} min` : "N/A"}
                  </span>
                </div>
                <div>
                  <span>{session.exercises.length} ejercicios</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* <div className="mt-4 text-center">
        <Button className="w-full border rounded-lg text-xs font-medium transition-colors">
          Iniciar nuevo entrenamiento
        </Button>
      </div> */}
    </div>
  );
}
