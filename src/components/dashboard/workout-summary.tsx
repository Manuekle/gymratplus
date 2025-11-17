"use client";

import { useState, useEffect } from "react";

import { es } from "date-fns/locale";
import { Skeleton } from "../ui/skeleton";
import {
  formatDistanceToNow,
  differenceInDays,
  isToday,
  isYesterday,
} from "date-fns";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { EmptyState } from "@/components/ui/empty-state";
import { WorkoutReminderAlert } from "@/components/workout/workout-reminder-alert";

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
  const [lastWorkoutDate, setLastWorkoutDate] = useState<Date | null>(null);

  const fetchWorkoutHistory = async () => {
    try {
      const response = await fetch("/api/workout-session/history");
      if (response.ok) {
        const data = await response.json();
        setWorkoutSessions(data);
        // Obtener la fecha del último entrenamiento
        if (data && data.length > 0) {
          const lastSession = data[0];
          setLastWorkoutDate(new Date(lastSession.date));
        } else {
          setLastWorkoutDate(null);
        }
      }
    } catch (error) {
      console.error("Error al cargar el historial de entrenamientos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  return (
    <div className="p-4 md:p-6 rounded-lg shadow-sm border">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-heading">
            Resumen de Entrenamientos
          </h2>
        </div>
        <Link
          href="/dashboard/workout/history"
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors self-start sm:self-auto"
        >
          Ver todos
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {/* Alerta de recordatorio si no ha entrenado en varios días */}
      {!loading && (
        <WorkoutReminderAlert
          lastWorkoutAt={lastWorkoutDate}
          onRestDayMarked={() => {
            // Refrescar los datos después de marcar un día de descanso
            fetchWorkoutHistory();
          }}
        />
      )}

      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border p-4 rounded-lg">
          <p className="text-xs font-semibold ">Semana actual</p>
          <div className="flex items-end mt-1">
            <span className="text-xl text-gray-400 font-semibold ">
              {currentWeek.completed}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              / {currentWeek.total} completados
            </span>
          </div>
        </div>

        <div className="border p-4 rounded-lg">
          <p className="text-xs font-semibold ">Siguiente entrenamiento</p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {currentWeek.nextWorkout}
          </p>
        </div>

        <div className="border p-4 rounded-lg">
          <p className="text-xs font-semibold ">Progreso mensual</p>
          <div className="flex items-center mt-1">
            <span className="text-xl font-semibold  text-muted-foreground">85%</span>
          </div>
        </div>
      </div> */}

      {/* <h3 className="text-xs text-muted-foreground mb-2">
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
          <EmptyState
            title="No hay entrenamientos recientes"
            description="Inicia un nuevo entrenamiento para ver tu historial aquí."
            action={{
              label: "Iniciar entrenamiento",
              href: "/dashboard/workout/active",
            }}
          />
        ) : (
          workoutSessions.slice(0, 2).map((session) => (
            <div key={session.id} className="p-3 sm:p-4 border rounded-lg">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <h4 className="font-semibold tracking-heading text-base sm:text-lg">
                  {session.notes?.replace("Día: ", "") || "Entrenamiento"}
                </h4>
                <span className="text-xs text-muted-foreground sm:text-right">
                  {(() => {
                    const sessionDate = new Date(session.date);
                    sessionDate.setHours(0, 0, 0, 0);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const daysDiff = differenceInDays(today, sessionDate);

                    if (daysDiff === 0) {
                      return "Hoy";
                    } else if (daysDiff === 1) {
                      return "Ayer";
                    } else {
                      return `Hace ${daysDiff} ${daysDiff === 1 ? "día" : "días"}`;
                    }
                  })()}
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
