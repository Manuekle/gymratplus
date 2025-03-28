"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  DataTable,
  TableSkeleton,
  createSortableColumn,
  // createDateColumn,
  createActionsColumn,
  createDateColumn,
} from "@/components/ui/data-table";
import { toast } from "sonner";
import { Delete02Icon, EyeIcon } from "hugeicons-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon } from "hugeicons-react";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/icons";

interface Workout {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

// Datos de ejemplo

export default function WorkoutsTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;

    const fetchWorkouts = async () => {
      const res = await fetch("/api/workouts");
      if (res.ok) {
        const data = await res.json();
        // setWorkouts(data);
        console.log(data);
        const timer = setTimeout(() => {
          setWorkouts(data);
          setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
      }
    };

    fetchWorkouts();
  }, [session]);

  // Funciones para manejar acciones
  const handleViewDetails = (workout: Workout) => {
    console.log(`Ver detalles de ${workout.name}`);
    router.push(`/dashboard/workout/${workout.id}`);
    // alert(`Navegando a los detalles de la tienda: ${workout.name}`);
  };

  // const handleEdit = (workout: Workout) => {
  //   console.log(`Editar ${workout.name}`);
  //   alert(`Editando tienda: ${workout.name}`);
  // };

  const handleDelete = async (workout: Workout) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/workouts/${workout.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        toast.success("¡Rutina eliminada!", {
          description: `La rutina "${workout.name}" ha sido eliminada correctamente.`,
          duration: 3000,
        });
        setWorkoutToDelete(null);
      }
    } catch (error) {
      console.error("Error eliminando la rutina:", error);
      toast.error("Error al eliminar", {
        description: `No se pudo eliminar la rutina "${workout.name}". Por favor, intenta nuevamente.`,
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
      window.location.reload();
    }
  };

  const columns = [
    createDateColumn<Workout>("createdAt", "Fecha", "dd/MM/yyyy"),
    createSortableColumn<Workout>("name", "Nombre"),
    // createSortableColumn<Workout>("description", "Descripción"),
    createActionsColumn<Workout>("", [
      {
        label: "Ver rutina",
        icon: EyeIcon,
        onClick: handleViewDetails,
      },
      {
        label: "Eliminar",
        icon: Delete02Icon,
        onClick: (workout) => setWorkoutToDelete(workout),
      },
    ]),
  ];

  return (
    <div>
      {isLoading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={workouts}
            filterColumn="name"
            defaultPageSize={10}
          />
          <Dialog
            open={!!workoutToDelete}
            onOpenChange={(open) => !open && setWorkoutToDelete(null)}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  Eliminar rutina
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (workoutToDelete) {
                    handleDelete(workoutToDelete);
                  }
                }}
                className="space-y-4"
              >
                <div className="mb-4 w-full border rounded-lg p-4 flex flex-col bg-destructive/5">
                  <span className="flex items-center gap-2 pb-1 text-destructive">
                    <AlertCircleIcon size={16} />
                    <AlertTitle className="text-sm font-semibold">
                      ¡Cuidado!
                    </AlertTitle>
                  </span>
                  <AlertDescription className="text-sm text-destructive mt-2">
                    ¿Estás seguro de que deseas eliminar la rutina "
                    {workoutToDelete?.name}"? Esta acción no se puede deshacer.
                  </AlertDescription>
                  <div className="flex flex-col md:flex-row gap-2 max-w-full pt-4">
                    <DialogClose asChild>
                      <Button variant="outline" size="sm" className="text-xs">
                        Cancelar
                      </Button>
                    </DialogClose>
                    <Button
                      size="sm"
                      className="text-xs px-4"
                      type="submit"
                      variant="destructive"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          Eliminando
                        </>
                      ) : (
                        "Eliminar"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
