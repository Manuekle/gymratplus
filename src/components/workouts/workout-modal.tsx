"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export default function WorkoutModal() {
  // const [open, setOpen] = useState(false);
  const router = useRouter();

  const [workout, setWorkout] = useState({
    name: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setWorkout({ ...workout, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workout),
    });

    if (response.ok) {
      // router.push("/workout"); // Redirigir a la lista de Workouts
      router.refresh(); // Recargar la página actual
    } else {
      alert("Error al crear el workout");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild className="mb-8">
        <Button className="text-xs" size="sm">
          Crear rutina
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-0 w-full">
        <DialogHeader>
          <DialogTitle className="text-md font-medium">
            Crear nueva rutina
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Dale un nombre de acuerdo a tu rutina
          </DialogDescription>
        </DialogHeader>
        <Input
          type="text"
          name="name"
          placeholder="Nombre de la rutina"
          value={workout.name}
          onChange={handleChange}
          required
        />
        <Textarea
          name="description"
          placeholder="Descripción"
          value={workout.description}
          style={{ resize: "none" }}
          rows={3}
          onChange={handleChange}
        />

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            type="submit"
            className="text-xs"
            size="sm"
          >
            Crear rutina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
