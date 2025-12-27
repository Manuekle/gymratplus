import { ExerciseForm } from "../_components/exercise-form";
import { getExerciseById } from "@/app/admin/actions";
import { notFound } from "next/navigation";

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = await getExerciseById(id);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Editar Ejercicio</h2>
        <p className="text-muted-foreground">Actualizar detalles del ejercicio.</p>
      </div>
      <ExerciseForm exercise={exercise} />
    </div>
  );
}
