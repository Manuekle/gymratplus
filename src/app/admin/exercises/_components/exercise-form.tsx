"use client";

import { useFormStatus } from "react-dom";
import { createExercise, updateExercise } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ExerciseFormProps {
  exercise?: {
    id: string;
    name: string;
    description: string | null;
    muscleGroup: string;
    equipment: string | null;
    videoUrl: string | null;
    difficulty: string;
  };
}

export function ExerciseForm({ exercise }: ExerciseFormProps) {
  const isEditing = !!exercise;
  const router = useRouter();

  // We need to handle the Select separately because it doesn't work natively with FormData in simplified examples often,
  // but using a hidden input or controlled state is best.
  // Actually, Shadcn Select usually works if we give it a name, but let's verify.
  // Shadcn's Select primitive is Radix UI, which DOES inject a hidden input if `name` is passed.
  // So we can just use `name="difficulty"`.

  async function handleSubmit(formData: FormData) {
    if (isEditing && exercise) {
      const result = await updateExercise(exercise.id, null, formData);
      if (result?.errors) {
        // handle errors
        toast.error(result.message);
      } else if (result?.message) {
        toast.success("Ejercicio Actualizado");
      }
    } else {
      const result = await createExercise(null, formData);
      if (result?.errors) {
        toast.error(result.message);
      } else if (result?.message) {
        toast.success("Ejercicio Creado");
        // Redirect is handled in server action but sometimes client needs help if error handling is complex
      }
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              placeholder="ej. Press de Banca"
              defaultValue={exercise?.name}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe el ejercicio..."
              defaultValue={exercise?.description || ""}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="muscleGroup">Grupo Muscular</Label>
              <Input
                id="muscleGroup"
                name="muscleGroup"
                placeholder="ej. Pecho"
                defaultValue={exercise?.muscleGroup}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="equipment">Equipamiento</Label>
              <Input
                id="equipment"
                name="equipment"
                placeholder="ej. Barra"
                defaultValue={exercise?.equipment || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="difficulty">Dificultad</Label>
              <Select
                name="difficulty"
                defaultValue={exercise?.difficulty || "beginner"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar dificultad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="videoUrl">URL del Video</Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                type="url"
                placeholder="https://youtube.com/..."
                defaultValue={exercise?.videoUrl || ""}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <SubmitButton isEditing={isEditing} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? "Actualizar Ejercicio" : "Crear Ejercicio"}
    </Button>
  );
}
