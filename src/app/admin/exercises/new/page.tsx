import { ExerciseForm } from "../_components/exercise-form";

export default function NewExercisePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Exercise</h2>
        <p className="text-muted-foreground">
          Create a new exercise with video tutorial.
        </p>
      </div>
      <ExerciseForm />
    </div>
  );
}
