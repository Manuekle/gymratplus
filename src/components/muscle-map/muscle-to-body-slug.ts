// Mapeo de nuestros músculos específicos a los slugs de @mjcdev/react-body-highlighter
import type { MuscleName } from "@/data/muscle-mapping";
import type { Slug } from "@mjcdev/react-body-highlighter";

export const muscleToBodySlug: Record<MuscleName, Slug> = {
  // Cuello
  trapecio: "trapezius",
  esternocleidomastoideo: "neck",
  omohioideo: "neck",
  esternohioideo: "neck",
  
  // Hombros
  deltoides_anterior: "deltoids",
  deltoides_medio: "deltoids",
  deltoides_posterior: "deltoids",
  redondo_mayor: "upper-back",
  redondo_menor: "upper-back",
  infraespinoso: "upper-back",
  
  // Pecho
  pectoral_mayor: "chest",
  pectoral_menor: "chest",
  serrato_anterior: "chest",
  
  // Espalda
  dorsal_ancho: "upper-back",
  romboide_mayor: "upper-back",
  romboide_menor: "upper-back",
  erector_espinal: "lower-back",
  trapecio_superior: "trapezius",
  trapecio_medio: "trapezius",
  trapecio_inferior: "trapezius",
  
  // Brazos
  biceps_braquial: "biceps",
  braquial: "biceps",
  triceps_braquial: "triceps",
  braquiorradial: "forearm",
  flexores_antebrazo: "forearm",
  extensores_antebrazo: "forearm",
  
  // Abdomen
  recto_abdominal: "abs",
  oblicuo_externo: "obliques",
  oblicuo_interno: "obliques",
  transverso_abdominal: "abs",
  
  // Piernas - Cuádriceps
  recto_femoral: "quadriceps",
  vasto_lateral: "quadriceps",
  vasto_medial: "quadriceps",
  vasto_intermedio: "quadriceps",
  
  // Piernas - Isquiotibiales
  biceps_femoral: "hamstring",
  semitendinoso: "hamstring",
  semimembranoso: "hamstring",
  
  // Piernas - Glúteos
  gluteo_mayor: "gluteal",
  gluteo_medio: "gluteal",
  gluteo_menor: "gluteal",
  
  // Piernas - Aductores/Abductores
  aductores: "adductors",
  abductores: "gluteal", // Los abductores están en los glúteos
  pectineo: "adductors",
  gracilis: "adductors",
  adductor_magno: "adductors",
  
  // Piernas - Pantorrillas
  gastrocnemio: "calves",
  soleo: "calves",
  tibial_anterior: "tibialis",
  peroneo_largo: "calves",
  peroneo_corto: "calves",
  extensor_dedos_largo: "tibialis",
  flexor_halux_largo: "tibialis",
};

// Función helper para obtener el slug del cuerpo a partir de un músculo
export function getBodySlugForMuscle(muscle: MuscleName): Slug {
  return muscleToBodySlug[muscle];
}

// Función helper para obtener todos los músculos que mapean a un slug específico
export function getMusclesForBodySlug(slug: Slug): MuscleName[] {
  return Object.entries(muscleToBodySlug)
    .filter(([_, bodySlug]) => bodySlug === slug)
    .map(([muscle]) => muscle as MuscleName);
}

