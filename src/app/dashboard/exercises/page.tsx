"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, PlayCircle, Dumbbell, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";
import Image from "next/image";

interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  imageUrl?: string;
}

const MUSCLE_GROUPS = [
  { value: "all", label: "Todos los músculos" },
  { value: "pecho", label: "Pecho" },
  { value: "espalda", label: "Espalda" },
  { value: "piernas", label: "Piernas" },
  { value: "hombros", label: "Hombros" },
  { value: "brazos", label: "Brazos" },
  { value: "abdomen", label: "Abdomen" },
  { value: "cardio", label: "Cardio" },
];

const DIFFICULTIES = [
  { value: "all", label: "Todas las dificultades" },
  { value: "beginner", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (muscle && muscle !== "all") params.append("muscle", muscle);
        if (difficulty && difficulty !== "all")
          params.append("difficulty", difficulty);

        const response = await fetch(`/api/exercises?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setExercises(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [debouncedSearch, muscle, difficulty]);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Biblioteca de Ejercicios
          </h1>
          <p className="text-muted-foreground mt-1">
            Explora y aprende la técnica correcta de más de 100 ejercicios.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ejercicio..."
              className="pl-9 bg-white dark:bg-zinc-950"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={muscle} onValueChange={setMuscle}>
            <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-zinc-950">
              <SelectValue placeholder="Músculo" />
            </SelectTrigger>
            <SelectContent>
              {MUSCLE_GROUPS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-zinc-950">
              <SelectValue placeholder="Dificultad" />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <CardHeader>
                <div className="h-6 w-3/4 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-zinc-100 dark:bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No se encontraron ejercicios</h3>
          <p className="text-muted-foreground">
            Intenta con otros filtros o términos de búsqueda.
          </p>
          <Button
            variant="link"
            onClick={() => {
              setSearch("");
              setMuscle("all");
              setDifficulty("all");
            }}
            className="mt-2"
          >
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/dashboard/exercises/${exercise.id}`}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="relative h-48 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                  {exercise.imageUrl ? (
                    <Image
                      src={exercise.imageUrl}
                      alt={exercise.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Dumbbell className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-black/80 rounded-full p-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <PlayCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <Badge
                    className="absolute top-3 right-3 capitalize shadow-sm"
                    variant={
                      exercise.difficulty === "beginner"
                        ? "default"
                        : exercise.difficulty === "intermediate"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {exercise.difficulty === "beginner"
                      ? "Principiante"
                      : exercise.difficulty === "intermediate"
                        ? "Intermedio"
                        : "Avanzado"}
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {exercise.name}
                      </CardTitle>
                      <CardDescription className="capitalize flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                        {exercise.muscleGroup}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {exercise.description || "Sin descripción disponible."}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
