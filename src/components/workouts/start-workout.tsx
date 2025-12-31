"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

const truncateText = (text: string, maxLength: number = 20): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};
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
import { Icons } from "@/components/icons";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";

type Exercise = {
  id: string;
  name: string;
  notes?: string;
  sets: number;
  reps: number | string;
  restTime: number;
};

type Day = {
  day: string;
  exercises: Exercise[];
};

type WorkoutProps = {
  id: string;
  name: string;
  description: string;
  days: Day[];
};

export default function StartWorkout({ workout }: { workout: WorkoutProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // State for wizard steps: 1 = Day, 2 = Mode, 3 = Summary/Start
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<"simple" | "intermediate" | "advanced">("simple");
  const [showModeHelp, setShowModeHelp] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeWorkoutExists, setActiveWorkoutExists] = useState(false);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  const workoutData = workout;
  const days = useMemo(() => workoutData.days || [], [workoutData.days]);

  // Check for active workout on open
  const checkActiveWorkout = async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/workout-session/active");
      if (response.ok) {
        const data = await response.json();
        setActiveWorkoutExists(true);
        setActiveWorkoutId(data.id);
      } else {
        setActiveWorkoutExists(false);
        setActiveWorkoutId(null);
      }
    } catch (error) {
      console.error("Error al verificar entrenamiento activo:", error);
      setActiveWorkoutExists(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (dialogOpen) {
      checkActiveWorkout();
      // Reset logic when opening
      setStep(1);
      setSelectedDay("");
      setSelectedMode("simple");
    }
  }, [dialogOpen]);

  useEffect(() => {
    if (selectedDay) {
      const selectedExercises =
        days.find((d) => d.day === selectedDay)?.exercises || [];
      setExercises(selectedExercises);
    }
  }, [selectedDay, days]);

  const handleStartWorkout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/workout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: selectedDay, exercises, workoutMode: selectedMode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar los ejercicios");
      }

      const data = await response.json();
      console.log("Entrenamiento iniciado:", data);

      setDialogOpen(false);

      toast.success("Entrenamiento iniciado", {
        description: "Redirigiendo a la página de entrenamiento activo...",
      });

      setTimeout(() => {
        router.push("/dashboard/workout/active");
      }, 500);
    } catch (error) {
      console.error("Error al guardar ejercicios:", error);
      toast.error("Error", {
        description: "Error al iniciar entrenamiento",
      });
      setLoading(false);
    }
  };

  const continueActiveWorkout = () => {
    setDialogOpen(false);
    toast.info("Continuando entrenamiento", {
      description: "Redirigiendo a tu entrenamiento activo...",
    });
    setTimeout(() => {
      router.push("/dashboard/workout/active");
    }, 500);
  };

  const finishAndStartNew = async () => {
    if (!activeWorkoutId) return;

    setLoading(true);
    try {
      const completeResponse = await fetch("/api/workout-session/complete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutSessionId: activeWorkoutId,
          completed: true,
          notes: "Finalizado automáticamente para iniciar nuevo entrenamiento",
        }),
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(
          errorData.error || "Error al finalizar el entrenamiento activo",
        );
      }

      // Start new workout
      await handleStartWorkout();

    } catch (error) {
      console.error("Error:", error);
      toast.error("Error", {
        description: "Error al procesar la operación",
      });
      setLoading(false);
    }
  };

  // Steps Logic
  const goNext = () => {
    if (step === 1 && selectedDay) setStep(2);
    else if (step === 2) setStep(3);
  };

  const goBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  // Render Helpers
  const renderStepTitle = () => {
    if (activeWorkoutExists) return "Entrenamiento Activo";
    switch (step) {
      case 1: return "Selecciona el día";
      case 2: return "Elige el modo";
      case 3: return "Resumen";
      default: return "";
    }
  };

  const renderStepDescription = () => {
    if (activeWorkoutExists) return "Ya tienes una sesión en curso";
    switch (step) {
      case 1: return "¿Qué día te toca hoy?";
      case 2: return "Personaliza tu seguimiento";
      case 3: return "Revisa los ejercicios antes de empezar";
      default: return "";
    }
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setLoading(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="default" variant="default" className="w-full">
          Comenzar rutina
        </Button>
      </DialogTrigger>

      {/* 
        Modified content container:
        - Fixed height to prevent layout shifts.
        - Scroll enabled only where needed.
      */}
      <DialogContent className="sm:max-w-md w-full max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">

        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-heading">
              {renderStepTitle()}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {renderStepDescription()}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-2">
          {checking ? (
            <div className="flex h-40 items-center justify-center">
              <Icons.spinner className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : activeWorkoutExists ? (
            <div className="w-full border rounded-lg p-4 flex flex-col bg-destructive/5 border-destructive/20">
              <span className="flex items-center gap-2 pb-1 text-destructive">
                <HugeiconsIcon icon={AlertCircleIcon} size={16} />
                <AlertTitle className="text-sm font-semibold">¡Atención!</AlertTitle>
              </span>
              <AlertDescription className="text-xs text-muted-foreground mb-4">
                Tienes un entrenamiento sin finalizar. Si inicias uno nuevo, el anterior se marcará como completado automáticamente.
              </AlertDescription>
              <div className="flex flex-col gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={continueActiveWorkout}
                  disabled={loading}
                >
                  Continuar el actual
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={finishAndStartNew}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={loading}
                >
                  {loading && <Icons.spinner className="h-3 w-3 animate-spin mr-2" />}
                  Finalizar e iniciar nuevo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">

              {/* STEP 1: SELECT DAY */}
              {step === 1 && (
                <div className="grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  {days.map((day: Day) => (
                    <div
                      key={day.day}
                      onClick={() => {
                        setSelectedDay(day.day);
                        // Auto advance on selection for smoother UX
                        setTimeout(() => setStep(2), 150);
                      }}
                      className={`
                        flex items-center justify-between px-4 py-3
                        rounded-lg border cursor-pointer
                        transition-all duration-200
                        ${selectedDay === day.day
                          ? "bg-primary/10 border-primary shadow-sm"
                          : "bg-card hover:bg-accent hover:border-accent-foreground/20"
                        }
                      `}
                    >
                      <span className="font-medium text-sm">{day.day}</span>
                      <Icons.chevronRight className={`h-4 w-4 text-muted-foreground ${selectedDay === day.day ? "text-primary" : ""}`} />
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 2: SELECT MODE */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowModeHelp(!showModeHelp)}
                      className="text-xs h-6 px-2 text-muted-foreground"
                    >
                      {showModeHelp ? "Ocultar ayuda" : "¿Qué significa cada modo?"}
                    </Button>
                  </div>

                  {showModeHelp && (
                    <div className="bg-muted/40 rounded-lg p-3 text-xs space-y-2 border border-border/50">
                      <p><span className="font-semibold text-primary">Principiante:</span> Solo registras Peso y Reps.</p>
                      <p><span className="font-semibold text-primary">Intermedio:</span> Añade RIR (Repeticiones en Reserva).</p>
                      <p><span className="font-semibold text-primary">Avanzado:</span> Control total con Tempo y RIR.</p>
                    </div>
                  )}

                  <div className="grid gap-3">
                    <button
                      onClick={() => setSelectedMode("simple")}
                      className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${selectedMode === "simple"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-accent/30"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">Principiante</span>
                        {selectedMode === "simple" && <Icons.check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">Monitorización básica</p>
                    </button>

                    <button
                      onClick={() => setSelectedMode("intermediate")}
                      className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${selectedMode === "intermediate"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-accent/30"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">Intermedio</span>
                        {selectedMode === "intermediate" && <Icons.check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">Añade esfuerzo percibido (RIR)</p>
                    </button>

                    <button
                      onClick={() => setSelectedMode("advanced")}
                      className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${selectedMode === "advanced"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-accent/30"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">Avanzado</span>
                        {selectedMode === "advanced" && <Icons.check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">Control total (Tempo + RIR)</p>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: EXERCISE LIST (SUMMARY) */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border">
                    <span>{selectedDay} • Modo {selectedMode === 'simple' ? 'Principiante' : selectedMode === 'intermediate' ? 'Intermedio' : 'Avanzado'}</span>
                    <Button variant="link" className="h-auto p-0 text-xs" onClick={() => setStep(1)}>Cambiar</Button>
                  </div>

                  <div className="space-y-2">
                    {exercises.map((exercise) => (
                      <div key={exercise.id} className="flex flex-col border p-3 rounded-lg bg-card/50">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-medium text-sm line-clamp-2">{exercise.name}</h4>
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full whitespace-nowrap text-secondary-foreground font-mono">
                            {exercise.sets} x {exercise.reps || "T"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icons.clock className="h-3 w-3" /> {exercise.restTime}s descanso
                          </span>
                        </div>
                        {exercise.notes && (
                          <p className="mt-2 text-xs text-muted-foreground italic border-t pt-2 w-full">
                            "{exercise.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        {!activeWorkoutExists && !checking && (
          <div className="p-4 border-t bg-muted/10 flex justify-between gap-3">
            {step > 1 ? (
              <Button variant="outline" onClick={goBack} disabled={loading} className="w-1/3">
                Atrás
              </Button>
            ) : (
              <div className="w-1/3"></div> // Spacer to keep layout
            )}

            {step < 3 ? (
              <Button
                onClick={goNext}
                className="w-2/3"
                disabled={step === 1 ? !selectedDay : false}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleStartWorkout}
                className="w-2/3"
                disabled={loading}
              >
                {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
