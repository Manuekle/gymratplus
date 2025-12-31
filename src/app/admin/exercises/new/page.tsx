import { ExerciseForm } from "../_components/exercise-form";

export default function NewExercisePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-[-0.02em]">Añadir Nuevo Ejercicio</h2>
        <p className="text-muted-foreground">
          Crear un nuevo ejercicio con video tutorial.
        </p>
      </div>
      <ExerciseForm />
    </div>
  );
}
