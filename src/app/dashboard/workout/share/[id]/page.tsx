"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download01Icon, Calendar01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { cloneWorkout } from "@/app/actions/workouts";
import WorkoutSkeleton from "@/components/skeleton/workout-skeleton";

interface WorkoutData {
    id: string;
    name: string;
    description: string;
    days: {
        exercises: {
            name: string;
            sets: number;
            reps: number;
        }[];
    }[];
}

export default function WorkoutSharePage() {
    const { id } = useParams();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [workout, setWorkout] = useState<WorkoutData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkout = async () => {
            try {
                const res = await fetch(`/api/workouts/${id}`);
                if (!res.ok) throw new Error("Rutina no encontrada");
                const data = await res.json();
                setWorkout(data);
            } catch (err) {
                setError("No pudimos cargar la rutina. Es posible que haya sido eliminada.");
            }
        };
        fetchWorkout();
    }, [id]);

    const handleImport = () => {
        startTransition(async () => {
            try {
                const result = await cloneWorkout(id as string);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Rutina importada correctamente");
                    router.push(`/dashboard/workout/${result.workoutId}`);
                }
            } catch (err) {
                toast.error("Error al importar la rutina");
            }
        });
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h2 className="text-xl font-semibold text-destructive">{error}</h2>
                <Button onClick={() => router.push("/dashboard")}>Volver al Dashboard</Button>
            </div>
        );
    }

    if (!workout) return <WorkoutSkeleton />;

    const exercisesCount = workout.days.reduce((acc, day) => acc + day.exercises.length, 0);

    return (
        <div className="container max-w-2xl mx-auto py-8 space-y-6">
            <Button
                variant="ghost"
                className="text-muted-foreground mb-4"
                onClick={() => router.push("/dashboard/friends")}
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
                Volver
            </Button>

            <div className="space-y-2">
                <Badge variant="secondary" className="w-fit">
                    Rutina Compartida
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight">{workout.name}</h1>
                {workout.description && (
                    <p className="text-muted-foreground">{workout.description}</p>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <HugeiconsIcon icon={Calendar01Icon} className="w-5 h-5 text-primary" />
                        Resumen
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg text-center">
                            <span className="block text-2xl font-bold">{workout.days.length}</span>
                            <span className="text-xs text-muted-foreground uppercase">Días</span>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg text-center">
                            <span className="block text-2xl font-bold">{exercisesCount}</span>
                            <span className="text-xs text-muted-foreground uppercase">Ejercicios</span>
                        </div>
                    </div>

                    <div className="pt-4">
                        <h3 className="text-xs font-medium mb-2">Ejercicios incluidos:</h3>
                        <ul className="space-y-2">
                            {workout.days[0]?.exercises.slice(0, 5).map((ex, i) => (
                                <li key={i} className="text-xs flex justify-between items-center p-2 bg-muted/50 rounded">
                                    <span>{ex.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {ex.sets}x{ex.reps}
                                    </span>
                                </li>
                            ))}
                            {exercisesCount > 5 && (
                                <li className="text-xs text-center text-muted-foreground pt-1">
                                    y {exercisesCount - 5} más...
                                </li>
                            )}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleImport}
                disabled={isPending}
            >
                <HugeiconsIcon icon={Download01Icon} className="w-5 h-5" />
                {isPending ? "Importando..." : "Guardar en Mis Rutinas"}
            </Button>
        </div>
    );
}
