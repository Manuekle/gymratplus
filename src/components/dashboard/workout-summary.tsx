"use client";

import { useState, useEffect } from "react";

import { es } from "date-fns/locale";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Clock01Icon } from "@hugeicons/core-free-icons";

interface Exercise {
  // Define the exercise properties as needed, for example:
  name: string;
  reps?: number;
  sets?: number;
}

interface WorkoutSession {
  id: string;
  date: string;
  duration?: number;
  exercises: Exercise[];
  notes?: string;
}

export default function WorkoutSummary() {
  const [loading, setLoading] = useState(true);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);

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
      <div className="flex justify-between items-center w-full mb-4">
        <div className="flex items-center gap-2 w-full">
          <h2 className="text-2xl font-semibold  tracking-heading">
            Resumen de Entrenamientos
          </h2>
        </div>
        <Link
          href="/dashboard/workout/history"
          className="text-xs text-muted-foreground flex items-center gap-1 w-28  md:w-1/6 justify-end"
        >
          Ver todos
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="h-4 w-4 text-muted-foreground"
          />
        </Link>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border p-4 rounded-lg">
          <p className="text-sm font-semibold ">Semana actual</p>
          <div className="flex items-end mt-1">
            <span className="text-xl text-gray-400 font-semibold ">
              {currentWeek.completed}
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              / {currentWeek.total} completados
            </span>
          </div>
        </div>

        <div className="border p-4 rounded-lg">
          <p className="text-sm font-semibold ">Siguiente entrenamiento</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {currentWeek.nextWorkout}
          </p>
        </div>

        <div className="border p-4 rounded-lg">
          <p className="text-sm font-semibold ">Progreso mensual</p>
          <div className="flex items-center mt-1">
            <span className="text-xl font-semibold  text-muted-foreground">85%</span>
          </div>
        </div>
      </div> */}

      {/* <h3 className="text-sm text-muted-foreground mb-2">
        Entrenamientos recientes
      </h3> */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground space-x-4">
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
          <div className="justify-center py-16 items-center flex flex-col">
            <h2 className="text-sm font-medium">
              No hay entrenamientos recientes.
            </h2>
            <p className="text-muted-foreground text-xs">
              Inicia un nuevo entrenamiento para ver tu historial aquí.
            </p>
          </div>
        ) : (
          workoutSessions.slice(0, 2).map((session) => (
            <div key={session.id} className="p-3 border rounded-lg">
              <div className="flex justify-between">
                <h4 className="font-semibold  tracking-heading text-lg">
                  {" "}
                  {session.notes?.replace("Día: ", "") || "Entrenamiento"}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(session.date), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
              <div className="mt-2 flex items-center text-xs text-muted-foreground space-x-4">
                <div className="flex items-center">
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    className="h-3 w-3 mr-1 text-foreground"
                  />
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
