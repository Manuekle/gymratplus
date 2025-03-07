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
// import WorkoutModal from "./workout-modal";

export default function WorkoutCreator() {
  return (
    <Card className="">
      <CardHeader className="pb-2">
        <CardTitle>Mis Rutinas</CardTitle>
        <CardDescription className="text-xs">
          Aquí puedes ver tus rutinas de entrenamiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <WorkoutGeneratorForm />
          {/* <WorkoutModal /> */}
          <WorkoutsTable />
        </div>
      </CardContent>
    </Card>
  );
}
