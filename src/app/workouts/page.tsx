"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { exercisesData } from "@/data/exercises";
import WorkoutModal from "@/components/workouts/workout-modal";
import ExerciseItem from "@/components/exercise-item";

export default function WorkoutPage() {
  const [exercises, setExercises] = useState(exercisesData);

  const handleDelete = (id) => {
    setExercises(exercises.filter((ex) => ex.id !== id)); // ✅ Filtra la lista para eliminar
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Mi Workout</h1>

        {/* Modal para agregar ejercicios */}
        <WorkoutModal
          onAddExercise={(exercise: { id: string; name: string }) =>
            setExercises([...exercises, exercise])
          }
        />

        {/* Lista de ejercicios con Drag & Drop */}
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={exercises}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {exercises.map((exercise) => (
                <ExerciseItem
                  key={exercise.id}
                  exercise={exercise}
                  handleDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </DashboardLayout>
  );
}
