import { getExercises, deleteExercise } from "../actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  PlusSignIcon,
  Edit02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams?.query || "";
  const exercises = await getExercises(query);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Ejercicios (Videos)
          </h2>
          <p className="text-muted-foreground">
            Gestionar la biblioteca de ejercicios y video tutoriales.
          </p>
        </div>
        <Link href="/admin/exercises/new">
          <Button className="gap-2">
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
            Añadir Nuevo
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Grupo Muscular</TableHead>
              <TableHead>Dificultad</TableHead>
              <TableHead>Video</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  No se encontraron ejercicios.
                </TableCell>
              </TableRow>
            ) : (
              exercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className="font-medium">{exercise.name}</TableCell>
                  <TableCell>{exercise.muscleGroup}</TableCell>
                  <TableCell className="capitalize">
                    {exercise.difficulty}
                  </TableCell>
                  <TableCell>
                    {exercise.videoUrl ? (
                      <a
                        href={exercise.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Ver Video
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Sin video
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/exercises/${exercise.id}`}>
                        <Button variant="ghost" size="icon">
                          <HugeiconsIcon
                            icon={Edit02Icon}
                            className="h-4 w-4"
                          />
                        </Button>
                      </Link>
                      <DeleteButton id={exercise.id} />
                    </div>
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

function DeleteButton({ id }: { id: string }) {
  // Simple delete button without confirmation modal for speed in this iteration,
  // but in a real app would want a dialog.
  // Using a form to invoke the server action.
  return (
    <form
      action={async () => {
        "use server";
        await deleteExercise(id);
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
