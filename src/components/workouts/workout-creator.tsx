"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const exerciseSchema = z.object({
  id: z.string().optional(),
  exerciseId: z.string().min(1, "Por favor selecciona un ejercicio"),
  sets: z.coerce.number().min(1, "Mínimo 1 serie"),
  reps: z.coerce.number().min(1, "Mínimo 1 repetición"),
  weight: z.coerce.number().optional(),
  restTime: z.coerce.number().optional(),
  notes: z.string().optional(),
});

const workoutSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, "Añade al menos un ejercicio"),
});

// Demo de lista de ejercicios disponibles
const availableExercises = [
  { id: "ex1", name: "Press de banca", muscleGroup: "Pecho" },
  { id: "ex2", name: "Sentadillas", muscleGroup: "Piernas" },
  { id: "ex3", name: "Pull ups", muscleGroup: "Espalda" },
  { id: "ex4", name: "Press militar", muscleGroup: "Hombros" },
  { id: "ex5", name: "Curl de bíceps", muscleGroup: "Brazos" },
  { id: "ex6", name: "Extensiones de tríceps", muscleGroup: "Brazos" },
  { id: "ex7", name: "Peso muerto", muscleGroup: "Espalda" },
  { id: "ex8", name: "Extensiones de cuádriceps", muscleGroup: "Piernas" },
  { id: "ex9", name: "Aperturas con mancuernas", muscleGroup: "Pecho" },
];

type WorkoutFormValues = z.infer<typeof workoutSchema>;

export function WorkoutCreator() {
  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: "",
      description: "",
      exercises: [
        {
          exerciseId: "",
          sets: 3,
          reps: 10,
          weight: 0,
          restTime: 60,
          notes: "",
        },
      ],
    },
  });

  const { fields, append, remove, move } = form.useFieldArray({
    name: "exercises",
    keyName: "key",
  });

  async function onSubmit(data: WorkoutFormValues) {
    try {
      // Aquí iría la lógica para guardar el entrenamiento
      console.log("Workout data:", data);
      toast.success("Entrenamiento guardado correctamente");
      // Aquí se podría redirigir a la lista de entrenamientos o limpiar el formulario
    } catch (error) {
      toast.error("Error al guardar el entrenamiento");
      console.error(error);
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Crear nueva rutina</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la rutina</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Rutina de pecho y hombros"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe tu rutina..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Ejercicios</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      exerciseId: "",
                      sets: 3,
                      reps: 10,
                      weight: 0,
                      restTime: 60,
                      notes: "",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir ejercicio
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center p-4 border border-dashed rounded-md">
                  No hay ejercicios en esta rutina. Añade uno para comenzar.
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.key}
                      className="flex items-start gap-4 p-4 border rounded-md bg-slate-50"
                    >
                      <div className="cursor-move mt-4">
                        <GripVertical className="h-5 w-5 text-gray-400" />
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`exercises.${index}.exerciseId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ejercicio</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un ejercicio" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availableExercises.map((exercise) => (
                                    <SelectItem
                                      key={exercise.id}
                                      value={exercise.id}
                                    >
                                      {exercise.name} ({exercise.muscleGroup})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name={`exercises.${index}.sets`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Series</FormLabel>
                                <FormControl>
                                  <Input type="number" min={1} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`exercises.${index}.reps`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Repeticiones</FormLabel>
                                <FormControl>
                                  <Input type="number" min={1} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name={`exercises.${index}.weight`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Peso (kg)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    step={2.5}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`exercises.${index}.restTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descanso (seg)</FormLabel>
                                <FormControl>
                                  <Input type="number" min={0} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="md:col-span-3">
                          <FormField
                            control={form.control}
                            name={`exercises.${index}.notes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notas (opcional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Detalles adicionales..."
                                    className="resize-none h-20"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Guardar entrenamiento
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
