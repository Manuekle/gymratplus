"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

import { CardDescription, CardTitle } from "@/components/ui/card";
import WorkoutSkeleton from "@/components/skeleton/workout-skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import StartWorkout from "@/components/workouts/start-workout";
import { WorkoutNew } from "@/components/workout/workout-new";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Calendar01Icon } from "@hugeicons/core-free-icons";

interface Workout {
  id: string;
  name: string;
  description: string;
  type: string;
  days: {
    day: string;
    exercises: {
      id: string;
      name: string;
      sets: number;
      reps: number;
      restTime: number;
      notes?: string;
    }[];
  }[];
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: number;
    restTime: number;
    notes?: string;
  }[];
}

export default function WorkouPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    const fetchWorkout = async () => {
      const res = await fetch(`/api/workouts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setWorkout(data);
        setError(null);
      } else {
        const errorData = await res.json();
        setError(
          errorData?.error === "Workout no encontrado" ||
            errorData?.error === "Workout no encontrado o no autorizado"
            ? "No tienes permiso para ver este workout o no existe."
            : errorData?.error || "Error al cargar el workout.",
        );
        setWorkout(null);
      }
    };

    fetchWorkout();
  }, [id, session, router]);

  const handleDeleteWorkout = async () => {
    if (!workout) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/workouts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Workout eliminado correctamente");
        router.push("/dashboard/workout");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar el workout");
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar el workout",
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center gap-4">
        <h2 className="text-lg font-semibold text-destructive">{error}</h2>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/workout")}
        >
          Volver a la lista de entrenamientos
        </Button>
      </div>
    );
  }

  if (!workout) return <WorkoutSkeleton />;

  return (
    <div>
      <div className="mb-4 flex md:flex-row flex-col justify-between w-full items-center gap-4 md:gap-2">
        <Button
          variant="outline"
          className="text-xs w-full md:w-auto"
          size="sm"
          onClick={() => router.push("/dashboard/workout")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />{" "}
          Volver a la lista
        </Button>
        <span className="flex flex-row gap-2 text-xs w-full md:w-auto">
          <StartWorkout workout={workout} />
        </span>
      </div>

      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-start gap-8">
          <div className="flex flex-col gap-1 w-full">
            <CardTitle className="text-2xl font-semibold  tracking-heading">
              {workout.name}
            </CardTitle>
            <CardDescription className="text-xs">
              {workout.description}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Eliminar
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <HugeiconsIcon icon={Calendar01Icon} className="h-3 w-3" />
              {workout.days.length} días
            </Badge>
          </div>
        </div>

        <div className="pt-4">
          <Tabs defaultValue={workout.days[0]?.day || ""}>
            {workout.days.map((day, dayIndex) => (
              <TabsContent key={dayIndex} value={day.day}>
                <WorkoutNew
                  workoutId={workout.id}
                  exercises={day.exercises}
                  days={workout.days.map((d) => d.day)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="overflow-y-auto pt-8 xl:pt-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-semibold tracking-heading">
              ¿Estás seguro de eliminar este workout?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el workout "{workout.name}" y todos sus datos asociados.
              <div className="mt-4">
                <p className="text-xs font-medium mb-2">
                  Escribe el nombre del workout para confirmar:
                </p>
                <Input
                  placeholder={`Escribe "${workout.name}"`}
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmationText !== workout.name || isDeleting}
              onClick={handleDeleteWorkout}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
