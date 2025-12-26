import { ExerciseForm } from "../_components/exercise-form";
import { getExerciseById } from "@/app/admin/actions";
import { notFound } from "next/navigation";

export default async function EditExercisePage({
  params,
}: {
  params: { id: string };
}) {
  const exercise = await getExerciseById(params.id);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Exercise</h2>
        <p className="text-muted-foreground">Update exercise details.</p>
      </div>
      <ExerciseForm exercise={exercise} />
    </div>
  );
}
