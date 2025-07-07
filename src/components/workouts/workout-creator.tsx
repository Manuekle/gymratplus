"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WorkoutsTable from "../tables/workouts-table";
import { WorkoutGenerator } from "../workout-generator/workout-generator";
// import ExerciseButtons from "../config/add-exercise-button";

export default function WorkoutCreator() {
  return (
    <Card className="">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-semibold  tracking-heading">
          Mis Rutinas
        </CardTitle>
        <CardDescription className="text-xs">
          Aquí puedes ver tus rutinas de entrenamiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="">
          <WorkoutGenerator />
          <WorkoutsTable />
        </div>
      </CardContent>
    </Card>
  );
}
