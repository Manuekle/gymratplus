"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight01Icon, Clock01Icon } from "hugeicons-react";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

export default function WorkoutSummary() {
  const router = useRouter();
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
  console.log(workoutSessions);
  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <Icons.spinner className="h-8 w-8 animate-spin" />
  //     </div>
  //   );
  // }

  // if (workoutSessions.length === 0) {
  //   return (
  //     <div className="text-center p-8">
  //       <h2 className="text-xl font-bold mb-4">
  //         No hay entrenamientos completados
  //       </h2>
  //       <Button onClick={() => router.push("/workouts")}>
  //         Iniciar un entrenamiento
  //       </Button>
  //     </div>
  //   );
  // }
  return (
    <Card className="">
      <CardHeader className="pb-2 w-full flex flex-row justify-between">
        <span>
          <CardTitle>Historial</CardTitle>
          <CardDescription className="text-xs">
            Aquí puedes ver tu resumen de entrenamientos
          </CardDescription>
        </span>
        <Link
          href="workout/history"
          className="text-xs text-muted-foreground flex items-center gap-1"
        >
          Ver todos <ArrowRight01Icon className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
