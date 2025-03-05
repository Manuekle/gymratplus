"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Delete02Icon,
  DragDropHorizontalIcon,
  EyeIcon,
  MoreVerticalCircle01Icon,
  MoreVerticalIcon,
  WasteIcon,
} from "hugeicons-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Exercise {
  id: string;
  name: string;
  weight: string;
  sets: number;
  reps: number;
}

export default function ExerciseItem({ exercise }: { exercise: Exercise }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: exercise.id });

  const router = useRouter();

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
        className="cursor-grab text-muted-foreground"
      />

      {/* Info del ejercicio */}
      <div className="flex-grow bg-background p-4 rounded-lg shadow-md border justify-between items-center flex">
        <div className="flex-grow bg-background">
          <h2 className="font-medium text-sm">{exercise.exercise.name}</h2>
          <span className="text-xs text-muted-foreground">
            {exercise.weight || 0}kg - {exercise.sets || 0} x {exercise.reps}{" "}
            reps
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-muted-foreground">
              <EyeIcon className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem className="text-muted-foreground">
              <Delete02Icon className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
