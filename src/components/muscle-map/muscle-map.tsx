"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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


// No necesitamos estas listas ya que la librería maneja automáticamente qué músculos mostrar en cada vista

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

  // Convertir músculos trabajados a slugs de la librería con intensidad
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

    // Convertir a array de ExtendedBodyPart
    const bodyParts: ExtendedBodyPart[] = [];
    slugCounts.forEach((count, slug) => {
      // Intensidad: 1 = bajo, 2 = medio/alto (más músculos trabajados = mayor intensidad)
      const intensity = count >= 3 ? 2 : count >= 1 ? 1 : 1;
      bodyParts.push({
        slug: slug as Slug,
        intensity,
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
    <div className="w-full space-y-4">
      {/* Header mejorado */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div>
          <h3 className="text-xs font-semibold">Mapa Muscular</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Músculos trabajados en este día
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "front" ? "default" : "outline"}
            size="sm"
            className="h-8 px-4 text-xs font-medium"
            onClick={() => setView("front")}
          >
            Frontal
          </Button>
          <Button
            variant={view === "back" ? "default" : "outline"}
            size="sm"
            className="h-8 px-4 text-xs font-medium"
            onClick={() => setView("back")}
          >
            Trasera
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Componente Body de la librería con mejor diseño */}
        <div className="flex-1 flex justify-center items-center bg-gradient-to-br from-muted/30 to-background rounded-lg p-6 border border-border shadow-sm">
          <div className="w-full max-w-md">
            <Body
              data={bodyPartsData}
              side={view}
              gender="male"
              scale={1.6}
              border="#d1d5db"
              colors={["#10b981", "#059669"]} // Verde para músculos trabajados
              onBodyPartClick={handleBodyPartClick}
            />
          </div>
        </div>

        {/* Panel de información - Solo en modo select */}
        {mode === "select" && selectedMuscle && (
          <div className="lg:w-64 space-y-2">
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
          </div>
        )}

        {/* Vista de músculos trabajados - Solo en modo view */}
        {mode === "view" && workedMuscles.size > 0 && (
          <div className="lg:w-72 space-y-2">
            <div className="border rounded-lg p-4 bg-card shadow-sm">
              <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                Músculos Trabajados
              </h4>
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-2">
                  {Array.from(workedMuscles).map((muscle) => (
                    <div
                      key={muscle}
                      className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <span className="text-xs font-medium">{muscleNames[muscle]}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getExercisesForMuscle(muscle).length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

