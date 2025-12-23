import { prisma } from "@/lib/database/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  PlayCircleIcon,
  Dumbbell01Icon,
  Target01Icon,
  ChartBarLineIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import Image from "next/image";

interface ExerciseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ExerciseDetailPage({
  params,
}: ExerciseDetailPageProps) {
  const { id } = await params;

  const exercise = await prisma.exercise.findUnique({
    where: { id },
  });

  if (!exercise) {
    notFound();
  }

  // Helper to determine video type
  const isYoutube =
    exercise.videoUrl?.includes("youtube") ||
    exercise.videoUrl?.includes("youtu.be");

  return (
    <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="mb-6">
        <Button
          variant="ghost"
          asChild
          className="pl-0 hover:bg-transparent hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <Link href="/dashboard/exercises" className="flex items-center gap-2">
            <HugeiconsIcon icon={ArrowLeft02Icon} className="h-4 w-4" />
            Volver a la biblioteca
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Video & Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-zinc-800">
            {exercise.videoUrl ? (
              isYoutube ? (
                <iframe
                  src={exercise.videoUrl.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video controls className="w-full h-full">
                  <source src={exercise.videoUrl} type="video/mp4" />
                  Tu navegador no soporta el tag de video.
                </video>
              )
            ) : exercise.imageUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={exercise.imageUrl}
                  alt={exercise.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={PlayCircleIcon}
                    className="h-20 w-20 text-white/50"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                <HugeiconsIcon
                  icon={Dumbbell01Icon}
                  className="h-20 w-20 mb-4 opacity-50"
                />
                <p>Sin video disponible</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {exercise.name}
            </h1>

            <div className="flex flex-wrap gap-2 text-sm">
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm flex items-center gap-1.5 capitalize"
              >
                <HugeiconsIcon
                  icon={Target01Icon}
                  className="h-3.5 w-3.5 text-indigo-500"
                />
                {exercise.muscleGroup}
              </Badge>
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm flex items-center gap-1.5 capitalize"
              >
                <HugeiconsIcon
                  icon={Dumbbell01Icon}
                  className="h-3.5 w-3.5 text-indigo-500"
                />
                {exercise.equipment || "Sin equipo"}
              </Badge>
              <Badge
                variant={
                  exercise.difficulty === "beginner"
                    ? "default"
                    : exercise.difficulty === "intermediate"
                      ? "secondary"
                      : "destructive"
                }
                className="px-3 py-1 text-sm flex items-center gap-1.5 capitalize"
              >
                <HugeiconsIcon
                  icon={ChartBarLineIcon}
                  className="h-3.5 w-3.5"
                />
                {exercise.difficulty === "beginner"
                  ? "Principiante"
                  : exercise.difficulty === "intermediate"
                    ? "Intermedio"
                    : "Avanzado"}
              </Badge>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={InformationCircleIcon}
                  className="h-5 w-5 text-indigo-500"
                />
                Instrucciones Técnica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
                {exercise.description ||
                  "No hay descripción disponible para este ejercicio."}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tips & Metadata */}
        <div className="space-y-6">
          <Card className="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30">
            <CardHeader>
              <CardTitle className="text-lg text-indigo-900 dark:text-indigo-100">
                Beneficios Principales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-indigo-900/80 dark:text-indigo-200/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  Mejora la fuerza y resistencia del {exercise.muscleGroup}.
                </li>
                <li className="flex gap-3 text-sm text-indigo-900/80 dark:text-indigo-200/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  Ideal para rutinas de nivel {exercise.difficulty}.
                </li>
                <li className="flex gap-3 text-sm text-indigo-900/80 dark:text-indigo-200/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  Compatible con entrenamiento{" "}
                  {exercise.equipment
                    ? `con ${exercise.equipment}`
                    : "de peso corporal"}
                  .
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Placeholder for future AI/Tips content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips de Entrenador</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>
                Mantén siempre la espalda recta y el core activado. Controla la
                respiración: exhala al hacer fuerza, inhala al volver a la
                posición inicial.
              </p>
              <Separator />
              <p className="italic text-xs">
                * Si sientes dolor agudo, detente inmediatamente y consulta a tu
                instructor.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
