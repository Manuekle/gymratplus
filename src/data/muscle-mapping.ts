// Mapeo de músculos específicos a ejercicios
// Basado en la imagen de referencia y los ejercicios disponibles

export type MuscleName =
  // Cuello
  | "trapecio"
  | "esternocleidomastoideo"
  | "omohioideo"
  | "esternohioideo"
  // Hombros
  | "deltoides_anterior"
  | "deltoides_medio"
  | "deltoides_posterior"
  | "redondo_mayor"
  | "redondo_menor"
  | "infraespinoso"
  // Pecho
  | "pectoral_mayor"
  | "pectoral_menor"
  | "serrato_anterior"
  // Espalda
  | "dorsal_ancho"
  | "romboide_mayor"
  | "romboide_menor"
  | "erector_espinal"
  | "trapecio_superior"
  | "trapecio_medio"
  | "trapecio_inferior"
  // Brazos
  | "biceps_braquial"
  | "braquial"
  | "triceps_braquial"
  | "braquiorradial"
  | "flexores_antebrazo"
  | "extensores_antebrazo"
  // Abdomen
  | "recto_abdominal"
  | "oblicuo_externo"
  | "oblicuo_interno"
  | "transverso_abdominal"
  // Piernas - Cuádriceps
  | "recto_femoral"
  | "vasto_lateral"
  | "vasto_medial"
  | "vasto_intermedio"
  // Piernas - Isquiotibiales
  | "biceps_femoral"
  | "semitendinoso"
  | "semimembranoso"
  // Piernas - Glúteos
  | "gluteo_mayor"
  | "gluteo_medio"
  | "gluteo_menor"
  // Piernas - Aductores/Abductores
  | "aductores"
  | "abductores"
  | "pectineo"
  | "gracilis"
  | "adductor_magno"
  // Piernas - Pantorrillas
  | "gastrocnemio"
  | "soleo"
  | "tibial_anterior"
  | "peroneo_largo"
  | "peroneo_corto"
  | "extensor_dedos_largo"
  | "flexor_halux_largo";

// Mapeo de músculos a grupos musculares
export const muscleToGroup: Record<MuscleName, string> = {
  // Cuello
  trapecio: "espalda",
  esternocleidomastoideo: "hombros",
  omohioideo: "hombros",
  esternohioideo: "hombros",
  // Hombros
  deltoides_anterior: "hombros",
  deltoides_medio: "hombros",
  deltoides_posterior: "hombros",
  redondo_mayor: "espalda",
  redondo_menor: "hombros",
  infraespinoso: "hombros",
  // Pecho
  pectoral_mayor: "pecho",
  pectoral_menor: "pecho",
  serrato_anterior: "pecho",
  // Espalda
  dorsal_ancho: "espalda",
  romboide_mayor: "espalda",
  romboide_menor: "espalda",
  erector_espinal: "espalda",
  trapecio_superior: "espalda",
  trapecio_medio: "espalda",
  trapecio_inferior: "espalda",
  // Brazos
  biceps_braquial: "brazos",
  braquial: "brazos",
  triceps_braquial: "brazos",
  braquiorradial: "brazos",
  flexores_antebrazo: "brazos",
  extensores_antebrazo: "brazos",
  // Abdomen
  recto_abdominal: "core",
  oblicuo_externo: "core",
  oblicuo_interno: "core",
  transverso_abdominal: "core",
  // Piernas - Cuádriceps
  recto_femoral: "piernas",
  vasto_lateral: "piernas",
  vasto_medial: "piernas",
  vasto_intermedio: "piernas",
  // Piernas - Isquiotibiales
  biceps_femoral: "piernas",
  semitendinoso: "piernas",
  semimembranoso: "piernas",
  // Piernas - Glúteos
  gluteo_mayor: "piernas",
  gluteo_medio: "piernas",
  gluteo_menor: "piernas",
  // Piernas - Aductores/Abductores
  aductores: "piernas",
  abductores: "piernas",
  pectineo: "piernas",
  gracilis: "piernas",
  adductor_magno: "piernas",
  // Piernas - Pantorrillas
  gastrocnemio: "piernas",
  soleo: "piernas",
  tibial_anterior: "piernas",
  peroneo_largo: "piernas",
  peroneo_corto: "piernas",
  extensor_dedos_largo: "piernas",
  flexor_halux_largo: "piernas",
};

// Mapeo de ejercicios a músculos que trabajan
// Basado en los ejercicios de exercises.ts
export const exerciseToMuscles: Record<string, MuscleName[]> = {
  // PIERNAS
  Sentadillas: [
    "recto_femoral",
    "vasto_lateral",
    "vasto_medial",
    "vasto_intermedio",
    "gluteo_mayor",
    "gastrocnemio",
    "soleo",
  ],
  "Prensa de piernas": [
    "recto_femoral",
    "vasto_lateral",
    "vasto_medial",
    "gluteo_mayor",
  ],
  "Extensiones de cuádriceps": [
    "recto_femoral",
    "vasto_lateral",
    "vasto_medial",
    "vasto_intermedio",
  ],
  "Curl femoral sentado": ["biceps_femoral", "semitendinoso", "semimembranoso"],
  "Curl femoral acostado": ["biceps_femoral", "semitendinoso", "semimembranoso"],
  "Elevaciones de pantorrilla": ["gastrocnemio", "soleo"],
  Abductores: ["abductores", "gluteo_medio"],
  Aductores: ["aductores", "pectineo", "gracilis", "adductor_magno"],
  "Peso muerto": [
    "biceps_femoral",
    "semitendinoso",
    "semimembranoso",
    "gluteo_mayor",
    "erector_espinal",
  ],
  Zancadas: [
    "recto_femoral",
    "vasto_lateral",
    "vasto_medial",
    "gluteo_mayor",
    "biceps_femoral",
  ],
  "Hip Thrust": ["gluteo_mayor", "gluteo_medio", "biceps_femoral"],
  "Sentadilla búlgara": [
    "recto_femoral",
    "vasto_lateral",
    "vasto_medial",
    "gluteo_mayor",
  ],
  "Step-ups con mancuernas": [
    "recto_femoral",
    "vasto_lateral",
    "gluteo_mayor",
  ],
  "Peso muerto rumano": [
    "biceps_femoral",
    "semitendinoso",
    "semimembranoso",
    "gluteo_mayor",
  ],
  "Pantorrillas en prensa": ["gastrocnemio", "soleo"],
  "Patada para glúteo en polea": ["gluteo_mayor", "gluteo_medio"],
  "Peso muerto con mancuernas": [
    "biceps_femoral",
    "gluteo_mayor",
    "erector_espinal",
  ],
  "Sentadilla Hack": ["recto_femoral", "vasto_lateral", "vasto_medial"],
  "Sentadilla en Smith": [
    "recto_femoral",
    "vasto_lateral",
    "vasto_medial",
    "gluteo_mayor",
  ],

  // PECHO
  "Press de banca": [
    "pectoral_mayor",
    "deltoides_anterior",
    "triceps_braquial",
  ],
  "Press de banca inclinado": [
    "pectoral_mayor",
    "deltoides_anterior",
    "triceps_braquial",
  ],
  "Press de banca declinado": [
    "pectoral_mayor",
    "deltoides_anterior",
    "triceps_braquial",
  ],
  "Aperturas con mancuernas": ["pectoral_mayor"],
  "Aperturas en polea": ["pectoral_mayor"],
  "Fondos en paralelas": ["pectoral_mayor", "triceps_braquial"],
  "Press de pecho en máquina": ["pectoral_mayor", "deltoides_anterior"],
  "Contractor de pecho": ["pectoral_mayor"],
  Pullover: ["pectoral_mayor", "dorsal_ancho"],
  "Press plano con mancuernas": [
    "pectoral_mayor",
    "deltoides_anterior",
    "triceps_braquial",
  ],
  "Flexiones de brazos": ["pectoral_mayor", "triceps_braquial"],
  "Flexiones diamante": ["pectoral_mayor", "triceps_braquial"],
  "Press inclinado con mancuernas": [
    "pectoral_mayor",
    "deltoides_anterior",
    "triceps_braquial",
  ],
  "Cruce de poleas alta": ["pectoral_mayor"],
  "Press declinado en máquina": ["pectoral_mayor", "deltoides_anterior"],
  "Flexiones con aplauso": ["pectoral_mayor", "triceps_braquial"],
  "Press de pecho en máquina Hammer": ["pectoral_mayor", "deltoides_anterior"],
  "Peck Deck": ["pectoral_mayor"],
  "Peck Fly": ["pectoral_mayor"],

  // ESPALDA
  "Peck Fly Invertido": ["deltoides_posterior", "romboide_mayor"],
  Dominadas: ["dorsal_ancho", "biceps_braquial", "trapecio"],
  "Remo con barra": ["dorsal_ancho", "romboide_mayor", "biceps_braquial"],
  "Remo con mancuerna": ["dorsal_ancho", "romboide_mayor", "biceps_braquial"],
  "Jalón al pecho": ["dorsal_ancho", "biceps_braquial"],
  "Jalón en polea unilateral": ["dorsal_ancho"],
  "Remo en máquina": ["dorsal_ancho", "romboide_mayor", "biceps_braquial"],
  "Pull-over": ["dorsal_ancho", "pectoral_mayor"],
  Hiperextensiones: ["erector_espinal"],
  "Encogimientos de hombros": ["trapecio"],
  "Dominadas con agarre supino": ["dorsal_ancho", "biceps_braquial"],
  "Pull-ups con agarre ancho": ["dorsal_ancho"],
  "Jalón tras nuca": ["dorsal_ancho"],
  "Remo con T-bar": ["dorsal_ancho", "trapecio"],
  "Remo con cable sentado": ["dorsal_ancho", "trapecio"],
  "Jalón al pecho con agarre neutro": ["dorsal_ancho", "biceps_braquial"],
  "Peso muerto con trampa": ["trapecio", "erector_espinal", "gluteo_mayor"],
  "Remo invertido en smith": ["dorsal_ancho", "romboide_mayor"],
  "Pull-over en polea": ["dorsal_ancho"],

  // HOMBROS
  "Press militar": ["deltoides_anterior", "deltoides_medio", "triceps_braquial"],
  "Remo al mentón": ["deltoides_medio", "trapecio"],
  "Elevaciones laterales en polea baja": ["deltoides_medio"],
  "Elevaciones laterales con mancuernas": ["deltoides_medio"],
  "Elevaciones frontales con mancuernas": ["deltoides_anterior"],
  "Elevaciones frontales en polea baja": ["deltoides_anterior"],
  "Pájaro en polea": ["deltoides_posterior"],
  "Face pull": ["deltoides_posterior", "infraespinoso"],
  "Press Arnold en polea": ["deltoides_anterior", "deltoides_medio"],
  "Rotación externa en polea": ["infraespinoso", "redondo_menor"],
  "Rotación interna en polea": ["redondo_mayor"],
  "Elevaciones laterales en polea alta": ["deltoides_medio"],
  "Press militar en polea": ["deltoides_anterior", "deltoides_medio"],

  // BRAZOS
  "Curl de bíceps con barra": ["biceps_braquial", "braquial"],
  "Curl de bíceps con mancuernas": ["biceps_braquial", "braquial"],
  "Curl martillo": ["biceps_braquial", "braquial", "braquiorradial"],
  "Curl concentrado": ["biceps_braquial"],
  "Extensiones de tríceps": ["triceps_braquial"],
  "Extensión de codo en polea": ["triceps_braquial"],
  "Extensión vertical con mancuerna": ["triceps_braquial"],
  "Press francés": ["triceps_braquial"],
  "Fondos en banco": ["triceps_braquial"],
  "Patada de tríceps": ["triceps_braquial"],
  "Curl spider": ["biceps_braquial"],
  "Curl Zottman": ["biceps_braquial", "flexores_antebrazo", "extensores_antebrazo"],
  "Extensión de tríceps en polea": ["triceps_braquial"],
  "Rompecráneos en banco inclinado": ["triceps_braquial"],
  "Press cerrado en smith": ["triceps_braquial"],
  "Extensión de tríceps en polea con soga": ["triceps_braquial"],
  "Curl inverso con barra": ["braquiorradial", "extensores_antebrazo"],
  "Curl de muñeca con barra": ["flexores_antebrazo"],
  "Curl de muñeca inverso": ["extensores_antebrazo"],
  "Caminata del Granjero": ["flexores_antebrazo"],
  "Curl de muñeca con mancuerna": ["flexores_antebrazo"],
  "Curl de muñeca inverso con mancuerna": ["extensores_antebrazo"],
  "Sujeción con agarre ancho": ["flexores_antebrazo"],
  "Curl de muñeca con disco": ["flexores_antebrazo"],
  "Curl de muñeca inverso con disco": ["extensores_antebrazo"],
  "Sujeción con toalla": ["flexores_antebrazo"],

  // CORE
  Plancha: ["recto_abdominal", "transverso_abdominal", "erector_espinal"],
  Crunch: ["recto_abdominal"],
  "Elevaciones de piernas": ["recto_abdominal"],
  "Russian twist": ["oblicuo_externo", "oblicuo_interno"],
  "Rueda abdominal": ["recto_abdominal", "transverso_abdominal"],
  "Mountain climber": ["recto_abdominal", "deltoides_anterior"],
};

// Función helper para obtener músculos trabajados por un ejercicio
export function getMusclesForExercise(exerciseName: string): MuscleName[] {
  return exerciseToMuscles[exerciseName] || [];
}

// Función helper para obtener ejercicios que trabajan un músculo específico
export function getExercisesForMuscle(muscle: MuscleName): string[] {
  return Object.entries(exerciseToMuscles)
    .filter(([_, muscles]) => muscles.includes(muscle))
    .map(([exercise]) => exercise);
}

// Exportar exerciseToMuscles para uso en componentes
export { exerciseToMuscles };

