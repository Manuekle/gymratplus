"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Exercise {
  name: string;
  muscleGroup: string;
  exerciseId: string;
}

interface ExerciseGroupSelectProps {
  exercises: Record<string, { muscleGroup: string; exerciseId: string }>;
  selectedExercises: string[];
  onExerciseSelect: (exerciseName: string) => void;
  className?: string;
}

export function ExerciseGroupSelect({
  exercises,
  selectedExercises,
  onExerciseSelect,
  className,
}: ExerciseGroupSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Convert exercises object to array and group by muscle group
  const exercisesByGroup = Object.entries(exercises).reduce<
    Record<string, Exercise[]>
  >((groups, [name, { muscleGroup, exerciseId }]) => {
    const group = muscleGroup || "Otros";
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push({ name, muscleGroup: group, exerciseId });
    return groups;
  }, {});

  // Sort muscle groups alphabetically

  // Filter exercises based on search term
  const filteredGroups = searchTerm
    ? Object.fromEntries(
        Object.entries(exercisesByGroup)
          .map(([group, exercises]) => [
            group,
            exercises.filter((ex) =>
              ex.name.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
          ])
          .filter(([, exercises]) => exercises.length > 0),
      )
    : exercisesByGroup;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${className} ${selectedExercises.length > 0 ? "text-foreground" : "text-muted-foreground"}`}
        >
          {selectedExercises.length > 0
            ? `${selectedExercises.length} ejercicio${selectedExercises.length === 1 ? "" : "s"} seleccionado${selectedExercises.length === 1 ? "" : "s"}`
            : "Seleccionar ejercicios"}

          <HugeiconsIcon
            icon={UnfoldMoreIcon}
            className="ml-2 h-4 w-4 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar ejercicios"
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>No se encontraron ejercicios.</CommandEmpty>
          <CommandList className="max-h-[300px] overflow-auto">
            {Object.entries(filteredGroups).map(([group, exercises]) => (
              <CommandGroup key={group} heading={group}>
                {exercises
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((exercise) => (
                    <CommandItem
                      key={exercise.exerciseId}
                      value={exercise.name}
                      onSelect={() => {
                        onExerciseSelect(exercise.name);
                      }}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">{exercise.name}</span>
                      {selectedExercises.includes(exercise.name) && (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          className="ml-2 h-4 w-4 text-primary"
                        />
                      )}
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
