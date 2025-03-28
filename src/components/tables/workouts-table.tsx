"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DataTable,
  TableSkeleton,
  createSortableColumn,
  createActionsColumn,
  createDateColumn,
} from "@/components/ui/data-table";
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
import { useWorkouts } from "@/hooks/use-workouts";

interface Workout {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function WorkoutsTable() {
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);
  const router = useRouter();
  const { workouts, isLoading, isDeleting, deleteWorkout } = useWorkouts();

  const handleViewDetails = (workout: Workout) => {
    router.push(`/dashboard/workout/${workout.id}`);
  };

  const handleDelete = async (workout: Workout) => {
    await deleteWorkout(workout.id, workout.name);
    setWorkoutToDelete(null);
  };

  const columns = [
    createDateColumn<Workout>("createdAt", "Fecha", "dd/MM/yyyy"),
    createSortableColumn<Workout>("name", "Nombre"),
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
