import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { PlusSignIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getAdminWorkouts, deleteWorkout } from "../actions";

export default async function AdminWorkoutsPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams?.query || "";
  const workouts = await getAdminWorkouts(query);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.02em]">
            Entrenamientos (Plantillas)
          </h2>
          <p className="text-muted-foreground">
            Gestionar plantillas de entrenamiento del sistema.
          </p>
        </div>
        <Link href="/admin/workouts/new">
          <Button className="gap-2">
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
            Crear Plantilla
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Ejercicios</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workouts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center h-24 text-muted-foreground"
                >
                  No se encontraron plantillas.
                </TableCell>
              </TableRow>
            ) : (
              workouts.map((workout) => (
                <TableRow key={workout.id}>
                  <TableCell className="font-medium">
                    <div>{workout.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {workout.description}
                    </div>
                  </TableCell>
                  <TableCell>{workout.exercises.length} ejercicios</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                      {workout.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteWorkoutButton id={workout.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function DeleteWorkoutButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await deleteWorkout(id);
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive/90"
      >
        <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
      </Button>
    </form>
  );
}
