"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// Tipo para los ejercicios
export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number | number;
  rest: string;
};

interface WorkoutTableProps {
  exercises: Exercise[];
  isLoading?: boolean;
}

export function WorkoutTable({
  exercises,
  isLoading = false,
}: WorkoutTableProps) {
  if (isLoading) {
    return <WorkoutTableSkeleton />;
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ejercicio</TableHead>
              <TableHead className="w-[100px] text-center">Sets</TableHead>
              <TableHead className="w-[100px] text-center">Reps</TableHead>
              <TableHead className="w-[120px] text-center">Descanso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exercises.length > 0 ? (
              exercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className="font-medium">{exercise.name}</TableCell>
                  <TableCell className="text-center">{exercise.sets}</TableCell>
                  <TableCell className="text-center">{exercise.reps}</TableCell>
                  <TableCell className="text-center">{exercise.rest}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No hay ejercicios para este día.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function WorkoutTableSkeleton() {
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-6 w-24" />
              </TableHead>
              <TableHead className="w-[100px] text-center">
                <Skeleton className="h-6 w-12 mx-auto" />
              </TableHead>
              <TableHead className="w-[100px] text-center">
                <Skeleton className="h-6 w-12 mx-auto" />
              </TableHead>
              <TableHead className="w-[120px] text-center">
                <Skeleton className="h-6 w-16 mx-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-6 w-full max-w-[200px]" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-6 w-8 mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-6 w-10 mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-6 w-14 mx-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
