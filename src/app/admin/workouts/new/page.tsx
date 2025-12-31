import { WorkoutForm } from "../_components/workout-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function NewWorkoutPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/workouts">
          <Button variant="ghost" size="icon">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-[-0.02em]">
            Nueva Plantilla de Entrenamiento
          </h2>
          <p className="text-muted-foreground">
            Crear una nueva rutina de entrenamiento del sistema.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <WorkoutForm />
      </div>
    </div>
  );
}
