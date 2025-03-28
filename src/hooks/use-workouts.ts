import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

interface Workout {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

// Estado global para los workouts
let globalWorkouts: Workout[] = [];
let globalSubscribers: ((workouts: Workout[]) => void)[] = [];

const notifySubscribers = () => {
  globalSubscribers.forEach((callback) => callback(globalWorkouts));
};

export function useWorkouts() {
  const [isLoading, setIsLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>(globalWorkouts);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const fetchWorkouts = useCallback(async () => {
    try {
      const res = await fetch("/api/workouts");
      if (res.ok) {
        const data = await res.json();
        globalWorkouts = data;
        setWorkouts(data);
        notifySubscribers();
      } else {
        throw new Error("Error al obtener los entrenamientos");
      }
    } catch (error) {
      console.error("Error fetching workouts:", error);
      toast.error("Error al cargar los entrenamientos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteWorkout = useCallback(
    async (workoutId: string, workoutName: string) => {
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/workouts/${workoutId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          toast.success("¡Rutina eliminada!", {
            description: `La rutina "${workoutName}" ha sido eliminada correctamente.`,
            duration: 3000,
          });
          globalWorkouts = globalWorkouts.filter((w) => w.id !== workoutId);
          setWorkouts(globalWorkouts);
          notifySubscribers();
        } else {
          throw new Error("Error al eliminar el entrenamiento");
        }
      } catch (error) {
        console.error("Error eliminando la rutina:", error);
        toast.error("Error al eliminar", {
          description: `No se pudo eliminar la rutina "${workoutName}". Por favor, intenta nuevamente.`,
          duration: 4000,
        });
      } finally {
        setIsDeleting(false);
      }
    },
    []
  );

  // Suscribirse a cambios globales
  useEffect(() => {
    const callback = (newWorkouts: Workout[]) => {
      setWorkouts(newWorkouts);
    };
    globalSubscribers.push(callback);
    return () => {
      globalSubscribers = globalSubscribers.filter((cb) => cb !== callback);
    };
  }, []);

  // Cargar entrenamientos cuando cambie la sesión
  useEffect(() => {
    if (!session) return;
    fetchWorkouts();
  }, [session, fetchWorkouts]);

  // Actualizar los datos cuando cambie la ruta
  useEffect(() => {
    fetchWorkouts();
  }, [pathname, fetchWorkouts]);

  return {
    workouts,
    isLoading,
    isDeleting,
    deleteWorkout,
    refreshWorkouts: fetchWorkouts,
  };
}
