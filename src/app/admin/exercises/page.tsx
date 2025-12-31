import { getExercises, deleteExercise } from "../actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  PlusSignIcon,
  Edit02Icon,
  Delete02Icon,
  DumbbellIcon,
  VideoReplayIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams?.query || "";
  const exercises = await getExercises(query);

  // Group exercises by muscle group
  const groupedExercises = exercises.reduce(
    (acc, exercise) => {
      const group = exercise.muscleGroup || "otros";
      if (!acc[group]) acc[group] = [];
      acc[group].push(exercise);
      return acc;
    },
    {} as Record<string, typeof exercises>
  );

  const muscleGroupColors: Record<string, string> = {
    pecho: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    espalda: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    piernas: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    hombros: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    brazos: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    core: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    cardio: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    "full body": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  };

  const difficultyColors: Record<string, string> = {
    beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    advanced: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-[-0.02em]">
            Biblioteca de Ejercicios
          </h2>
          <p className="text-muted-foreground mt-1">
            {exercises.length} ejercicios disponibles
          </p>
        </div>
        <Link href="/admin/exercises/new">
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
            Añadir Ejercicio
          </Button>
        </Link>
      </div>

      {/* Exercise Grid */}
      {exercises.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <HugeiconsIcon
              icon={DumbbellIcon}
              className="h-12 w-12 text-muted-foreground/50 mb-4"
            />
            <h3 className="text-lg font-medium mb-1">No hay ejercicios</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Comienza agregando tu primer ejercicio
            </p>
            <Link href="/admin/exercises/new">
              <Button>
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                Añadir Ejercicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedExercises).map(([muscleGroup, groupExercises]) => (
            <div key={muscleGroup} className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-xs font-semibold capitalize ${muscleGroupColors[muscleGroup.toLowerCase()] ||
                    "bg-muted text-muted-foreground"
                    }`}
                >
                  {muscleGroup}
                </Badge>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  {groupExercises.length} ejercicio{groupExercises.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groupExercises.map((exercise) => (
                  <Card
                    key={exercise.id}
                    className="group transition-all duration-200 hover:shadow-md"
                  >
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-xs leading-tight line-clamp-2 mb-2">
                              {exercise.name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge
                                variant="secondary"
                                className={`text-xs capitalize ${difficultyColors[exercise.difficulty || "intermediate"]
                                  }`}
                              >
                                {exercise.difficulty || "intermediate"}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                            <HugeiconsIcon
                              icon={DumbbellIcon}
                              className="h-4 w-4 text-primary"
                            />
                          </div>
                        </div>

                        {/* Video Status */}
                        {exercise.videoUrl ? (
                          <a
                            href={exercise.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline"
                          >
                            <HugeiconsIcon icon={VideoReplayIcon} className="h-4 w-4" />
                            Ver video
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <HugeiconsIcon icon={VideoReplayIcon} className="h-4 w-4" />
                            Sin video
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-border/50">
                          <Link href={`/admin/exercises/${exercise.id}`} className="flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                            >
                              <HugeiconsIcon icon={Edit02Icon} className="h-3.5 w-3.5" />
                              Editar
                            </Button>
                          </Link>
                          <DeleteButton id={exercise.id} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await deleteExercise(id);
      }}
    >
      <Button
        variant="outline"
        size="sm"
        className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
      >
        <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
        Eliminar
      </Button>
    </form>
  );
}
