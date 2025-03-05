"use client";

import WorkoutModal from "@/components/workouts/workout-modal";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WorkoutsTable from "../tables/workouts-table";

export default function WorkoutCreator() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Mis Rutinas</CardTitle>
        <CardDescription className="text-xs">
          Aquí puedes ver tus rutinas de entrenamiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <WorkoutModal />
          <WorkoutsTable />
        </div>
      </CardContent>
    </Card>
  );
}
