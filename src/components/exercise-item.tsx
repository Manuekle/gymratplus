"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Delete02Icon, DragDropHorizontalIcon } from "hugeicons-react";

const categoryColors = {
  Strength: "text-red-500",
  Hypertrophy: "text-purple-500",
  Endurance: "text-yellow-500",
};

interface Exercise {
  id: string;
  name: string;
  category: keyof typeof categoryColors;
  sets: number;
  reps: number;
}

export default function ExerciseItem({ exercise }: { exercise: Exercise }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4">
      {/* Icono de arrastre */}
      <DragDropHorizontalIcon
        size={24}
        {...attributes}
        {...listeners}
        className="cursor-grab border-none"
      />

      {/* Info del ejercicio */}
      <div className="flex-grow bg-background p-4 rounded-lg shadow-md border justify-between items-center flex">
        <div className="flex-grow bg-background">
          <h2 className="font-medium text-sm">{exercise.exercise.name}</h2>
          <span className="text-xs text-muted-foreground">
            <strong
              className={`text-xs font-medium ${
                categoryColors[exercise.category]
              }`}
            >
              {exercise.category}
            </strong>{" "}
            {exercise.sets} x {exercise.reps} reps
          </span>
          {/* <p className="text-muted-foreground text-xs">
            {exercise.sets} x {exercise.reps} reps
          </p> */}
        </div>

        {/* Categoría con colores */}
        <button>
          <Delete02Icon size={16} />
        </button>
      </div>
    </div>
  );
}
