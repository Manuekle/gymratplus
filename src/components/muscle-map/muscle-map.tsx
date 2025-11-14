"use client";

import { useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Body from "@mjcdev/react-body-highlighter";
import type { ExtendedBodyPart, Slug } from "@mjcdev/react-body-highlighter";
import {
  getExercisesForMuscle,
  exerciseToMuscles,
  type MuscleName,
} from "@/data/muscle-mapping";
import {
  getBodySlugForMuscle,
  getMusclesForBodySlug,
} from "./muscle-to-body-slug";

interface MuscleMapProps {
  // Ejercicios seleccionados para resaltar músculos trabajados
  selectedExercises?: string[];
  // Callback cuando se selecciona un músculo
  onMuscleSelect?: (muscle: MuscleName, exercises: string[]) => void;
  // Modo: 'select' permite seleccionar músculos, 'view' solo visualización
  mode?: "select" | "view";
  // Músculos a resaltar (para modo view)
  highlightedMuscles?: MuscleName[];
}

// Paleta de colores por grupo muscular
const muscleGroupColors: Record<Slug, string> = {
  chest: "#ef4444", // Rojo para pecho
  biceps: "#3b82f6", // Azul para bíceps
  triceps: "#8b5cf6", // Púrpura para tríceps
  deltoids: "#f59e0b", // Naranja para hombros
  "upper-back": "#10b981", // Verde para espalda superior
  "lower-back": "#059669", // Verde oscuro para espalda inferior
  trapezius: "#06b6d4", // Cian para trapecio
  abs: "#ec4899", // Rosa para abdominales
  obliques: "#f97316", // Naranja oscuro para oblicuos
  quadriceps: "#6366f1", // Índigo para cuádriceps
  hamstring: "#14b8a6", // Turquesa para isquiotibiales
  gluteal: "#a855f7", // Púrpura para glúteos
  calves: "#22c55e", // Verde claro para pantorrillas
  adductors: "#eab308", // Amarillo para aductores
  forearm: "#64748b", // Gris azulado para antebrazo
  tibialis: "#84cc16", // Verde lima para tibial
  neck: "#f43f5e", // Rosa para cuello
  // Partes no usadas pero requeridas por el tipo
  ankles: "#94a3b8",
  feet: "#94a3b8",
  hands: "#94a3b8",
  hair: "#94a3b8",
  head: "#94a3b8",
  knees: "#94a3b8",
};

// Nombres en español para los músculos
const muscleNames: Record<MuscleName, string> = {
  trapecio: "Trapecio",
  esternocleidomastoideo: "Esternocleidomastoideo",
  omohioideo: "Omohioideo",
  esternohioideo: "Esternohioideo",
  deltoides_anterior: "Deltoides Anterior",
  deltoides_medio: "Deltoides Medio",
  deltoides_posterior: "Deltoides Posterior",
  redondo_mayor: "Redondo Mayor",
  redondo_menor: "Redondo Menor",
  infraespinoso: "Infraespinoso",
  pectoral_mayor: "Pectoral Mayor",
  pectoral_menor: "Pectoral Menor",
  serrato_anterior: "Serrato Anterior",
  dorsal_ancho: "Dorsal Ancho",
  romboide_mayor: "Romboide Mayor",
  romboide_menor: "Romboide Menor",
  erector_espinal: "Erector Espinal",
  trapecio_superior: "Trapecio Superior",
  trapecio_medio: "Trapecio Medio",
  trapecio_inferior: "Trapecio Inferior",
  biceps_braquial: "Bíceps Braquial",
  braquial: "Braquial",
  triceps_braquial: "Tríceps Braquial",
  braquiorradial: "Braquiorradial",
  flexores_antebrazo: "Flexores del Antebrazo",
  extensores_antebrazo: "Extensores del Antebrazo",
  recto_abdominal: "Recto Abdominal",
  oblicuo_externo: "Oblicuo Externo",
  oblicuo_interno: "Oblicuo Interno",
  transverso_abdominal: "Transverso Abdominal",
  recto_femoral: "Recto Femoral",
  vasto_lateral: "Vasto Lateral",
  vasto_medial: "Vasto Medial",
  vasto_intermedio: "Vasto Intermedio",
  biceps_femoral: "Bíceps Femoral",
  semitendinoso: "Semitendinoso",
  semimembranoso: "Semimembranoso",
  gluteo_mayor: "Glúteo Mayor",
  gluteo_medio: "Glúteo Medio",
  gluteo_menor: "Glúteo Menor",
  aductores: "Aductores",
  abductores: "Abductores",
  pectineo: "Pectíneo",
  gracilis: "Gracilis",
  adductor_magno: "Aductor Mayor",
  gastrocnemio: "Gastrocnemio",
  soleo: "Sóleo",
  tibial_anterior: "Tibial Anterior",
  peroneo_largo: "Peroneo Largo",
  peroneo_corto: "Peroneo Corto",
  extensor_dedos_largo: "Extensor de Dedos Largo",
  flexor_halux_largo: "Flexor del Hallux Largo",
};

export function MuscleMap({
  selectedExercises = [],
  onMuscleSelect,
  mode = "select",
  highlightedMuscles = [],
}: MuscleMapProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleName | null>(null);
  const { theme, systemTheme } = useTheme();
  const isDark =
    theme === "dark" || (theme === "system" && systemTheme === "dark");

  // Calcular músculos trabajados por los ejercicios seleccionados
  const workedMuscles = useMemo(() => {
    if (selectedExercises.length === 0) return new Set<MuscleName>();

    const muscles = new Set<MuscleName>();
    selectedExercises.forEach((exerciseName) => {
      const exerciseMuscles = exerciseToMuscles[exerciseName];
      if (exerciseMuscles) {
        exerciseMuscles.forEach((m) => muscles.add(m));
      }
    });
    return muscles;
  }, [selectedExercises]);

  // Convertir músculos trabajados a slugs de la librería con colores personalizados
  const bodyPartsData = useMemo(() => {
    // Agrupar músculos por slug y calcular intensidad basada en cantidad de músculos trabajados
    const slugCounts = new Map<string, number>();

    workedMuscles.forEach((muscle) => {
      const slug = getBodySlugForMuscle(muscle);
      slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
    });

    // También incluir músculos destacados
    highlightedMuscles.forEach((muscle) => {
      const slug = getBodySlugForMuscle(muscle);
      slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
    });

    // Convertir a array de ExtendedBodyPart con colores personalizados
    const bodyParts: ExtendedBodyPart[] = [];
    slugCounts.forEach((count, slug) => {
      const slugTyped = slug as Slug;
      // Obtener color específico para este grupo muscular
      const groupColor = muscleGroupColors[slugTyped] || "#10b981";

      // Calcular opacidad basada en cantidad (más músculos = más intenso)
      const opacity = Math.min(0.4 + count * 0.15, 0.85);

      // Convertir color hex a rgba para aplicar opacidad
      // La opacidad se ajusta según la cantidad de músculos trabajados
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      bodyParts.push({
        slug: slugTyped,
        color: hexToRgba(groupColor, opacity), // Color personalizado por grupo muscular
        intensity: count >= 3 ? 2 : 1,
      });
    });

    return bodyParts;
  }, [workedMuscles, highlightedMuscles]);

  // Manejar click en parte del cuerpo
  const handleBodyPartClick = (bodyPart: ExtendedBodyPart) => {
    if (mode === "view") return;

    if (!bodyPart.slug) return;

    // Obtener todos los músculos que mapean a este slug
    const muscles = getMusclesForBodySlug(bodyPart.slug);

    if (muscles.length > 0) {
      // Usar el primer músculo como representante (o podríamos mostrar todos)
      const representativeMuscle = muscles[0];
      if (representativeMuscle) {
        setSelectedMuscle(representativeMuscle);

        // Obtener ejercicios para todos los músculos de este grupo
        const allExercises = new Set<string>();
        muscles.forEach((muscle) => {
          getExercisesForMuscle(muscle).forEach((ex) => allExercises.add(ex));
        });

        onMuscleSelect?.(representativeMuscle, Array.from(allExercises));
      }
    }
  };

  const selectedMuscleExercises = selectedMuscle
    ? getExercisesForMuscle(selectedMuscle)
    : [];

  return (
    <div className="w-full space-y-3">
      {/* Header compacto */}
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="text-xs font-medium">Mapa Muscular</h3>
        <div className="flex gap-1.5">
          <Button
            variant={view === "front" ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setView("front")}
          >
            Frontal
          </Button>
          <Button
            variant={view === "back" ? "default" : "outline"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setView("back")}
          >
            Trasera
          </Button>
        </div>
      </div>

      {/* Componente Body de la librería */}
      <div className="flex justify-center items-center bg-gradient-to-br from-muted/20 via-background to-muted/10 dark:from-muted/10 dark:via-background dark:to-muted/5 rounded-lg p-4 sm:p-6 border border-border/50 shadow-sm">
        <div className="w-full max-w-md mx-auto flex justify-center items-center">
          <div className="w-full flex justify-center items-center [&>svg]:mx-auto [&>svg]:block">
            <Body
              data={bodyPartsData}
              side={view}
              gender="male"
              scale={1.6}
              border={isDark ? "#64748b" : "#cbd5e1"}
              colors={Object.values(muscleGroupColors)}
              onBodyPartClick={handleBodyPartClick}
            />
          </div>
        </div>
      </div>

      {/* Panel de información - Solo en modo select */}
      {mode === "select" && selectedMuscle && (
        <div className="border rounded-md p-3 bg-muted/30">
          <h4 className="text-xs font-medium mb-2">
            {muscleNames[selectedMuscle]}
          </h4>
          {selectedMuscleExercises.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedMuscleExercises.map((exerciseName) => (
                <Badge
                  key={exerciseName}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  {exerciseName}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Sin ejercicios registrados
            </p>
          )}
        </div>
      )}
    </div>
  );
}
