"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WorkoutsTable from "../tables/workouts-table";
import { WorkoutGeneratorForm } from "../workout-generator/workout-generator-form";
import ExerciseButtons from "../config/add-exercise-button";

export default function WorkoutCreator() {
  return (
    <Card className="">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Mis Rutinas
        </CardTitle>
        <CardDescription className="text-xs">
          Aquí puedes ver tus rutinas de entrenamiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <WorkoutGeneratorForm />
          <ExerciseButtons />
          <WorkoutsTable />
        </div>
      </CardContent>
    </Card>
  );
}
