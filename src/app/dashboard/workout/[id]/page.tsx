"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import WorkoutExercise from "../../../../components/workouts/workout-exercise";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import ExerciseItem from "@/components/exercise-item";
import { Button } from "@/components/ui/button";
import { ArrowLeft01Icon } from "hugeicons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WorkoutSkeleton from "@/components/skeleton/workout-skeleton";

interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
}

interface WorkoutExercise {
  id: string;
  name: string;
  category: "Strength" | "Hypertrophy" | "Endurance";
  sets: number;
  reps: number;
  weight: number;
  order: number;
}

export default function WorkoutDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!session) return;

    const fetchWorkout = async () => {
      const res = await fetch(`/api/workouts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setWorkout(data);
      } else {
        router.push("/workouts");
      }
    };

    fetchWorkout();
  }, [id, session, router]);

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = workout?.exercises.findIndex((e) => e.id === active.id);
      const newIndex = workout?.exercises.findIndex((e) => e.id === over.id);

      if (oldIndex !== undefined && newIndex !== undefined) {
        setWorkout((prev) => ({
          ...prev!,
          exercises: arrayMove(prev!.exercises, oldIndex, newIndex),
        }));
      }
    }
  };

  if (!workout) return <WorkoutSkeleton />;

  return (
    <div>
      <Button
        variant="outline"
        className="mb-4"
        onClick={() => router.push("/dashboard/workout")}
      >
        <ArrowLeft01Icon className="mr-2 h-4 w-4" /> Volver a la lista
      </Button>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-4">
          <div className="w-full md:w-auto">
            <CardTitle className="text-lg md:text-xl">{workout.name}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {workout.description}
            </CardDescription>
          </div>

          <Button
            className="text-xs px-4 md:px-6"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            Agregar ejercicio
          </Button>
        </CardHeader>
        <CardContent>
          <div>
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={workout.exercises}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {workout.exercises.map((exercise) => (
                    <ExerciseItem key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </CardContent>
      </Card>
      <WorkoutExercise
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workoutId={workout.id}
      />
    </div>
  );
}
