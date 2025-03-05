import { prisma } from "@/lib/prisma";

// Función para obtener o crear ejercicios en la base de datos
export async function getOrCreateExercises() {
  // Verificar si ya existen ejercicios en la base de datos
  const count = await prisma.exercise.count();

  if (count > 0) {
    // Si ya existen, devolver todos los ejercicios
    return prisma.exercise.findMany();
  }

  // Si no existen, crear ejercicios básicos
  const exercisesToCreate = [
    // Leg Exercises
    {
      name: "Sentadillas",
      muscleGroup: "piernas",
      equipment: "peso libre",
      description:
        "Ejercicio compuesto para piernas, enfocado en cuádriceps, glúteos y pantorrillas",
    },
    {
      name: "Zancadas",
      muscleGroup: "piernas",
      equipment: "mancuernas",
      description:
        "Ejercicio unilateral para desarrollar equilibrio y fuerza en piernas",
    },
    {
      name: "Prensa de Piernas",
      muscleGroup: "piernas",
      equipment: "máquina",
      description:
        "Ejercicio de aislamiento para cuádriceps con menor estrés en la columna",
    },
    {
      name: "Peso Muerto",
      muscleGroup: "piernas",
      equipment: "barra",
      description:
        "Ejercicio compuesto para cadena posterior, glúteos y espalda baja",
    },
    {
      name: "Extensiones de Cuádriceps",
      muscleGroup: "piernas",
      equipment: "máquina",
      description: "Ejercicio de aislamiento para cuádriceps",
    },
    {
      name: "Curl de Femoral",
      muscleGroup: "piernas",
      equipment: "máquina",
      description: "Ejercicio de aislamiento para músculos isquiotibiales",
    },

    // Chest Exercises
    {
      name: "Press de Banca",
      muscleGroup: "pecho",
      equipment: "barra",
      description: "Ejercicio compuesto fundamental para desarrollo del pecho",
    },
    {
      name: "Press de Banca Inclinado",
      muscleGroup: "pecho",
      equipment: "mancuernas",
      description:
        "Variación del press que enfatiza la parte superior del pecho",
    },
    {
      name: "Aperturas con Mancuernas",
      muscleGroup: "pecho",
      equipment: "mancuernas",
      description:
        "Ejercicio de aislamiento para definición y estiramiento del pecho",
    },
    {
      name: "Fondos en Paralelas",
      muscleGroup: "pecho",
      equipment: "peso corporal",
      description: "Ejercicio compuesto para pecho y tríceps",
    },

    // Back Exercises
    {
      name: "Dominadas",
      muscleGroup: "espalda",
      equipment: "peso corporal",
      description: "Ejercicio compuesto para espalda alta y bíceps",
    },
    {
      name: "Remo con Barra",
      muscleGroup: "espalda",
      equipment: "barra",
      description: "Ejercicio compuesto para espalda media y trapecios",
    },
    {
      name: "Remo con Mancuerna Unilateral",
      muscleGroup: "espalda",
      equipment: "mancuerna",
      description:
        "Ejercicio de aislamiento para equilibrar fuerza entre lados",
    },
    {
      name: "Pull Ups",
      muscleGroup: "espalda",
      equipment: "barra",
      description: "Variación de dominadas para máximo desarrollo de espalda",
    },

    // Shoulder Exercises
    {
      name: "Press de Hombros",
      muscleGroup: "hombros",
      equipment: "mancuernas",
      description: "Ejercicio compuesto para desarrollo deltoides",
    },
    {
      name: "Elevaciones Laterales",
      muscleGroup: "hombros",
      equipment: "mancuernas",
      description: "Ejercicio de aislamiento para deltoides laterales",
    },
    {
      name: "Face Pulls",
      muscleGroup: "hombros",
      equipment: "polea",
      description: "Ejercicio para rotadores y deltoides posteriores",
    },
    {
      name: "Shrugs",
      muscleGroup: "hombros",
      equipment: "mancuernas",
      description: "Ejercicio para trapecios y parte superior de los hombros",
    },

    // Arm Exercises
    {
      name: "Curl de Bíceps con Barra",
      muscleGroup: "brazos",
      equipment: "barra",
      description: "Ejercicio clásico de aislamiento para bíceps",
    },
    {
      name: "Curl de Martillo",
      muscleGroup: "brazos",
      equipment: "mancuernas",
      description: "Variación de curl para desarrollo completo del bíceps",
    },
    {
      name: "Extensiones de Tríceps",
      muscleGroup: "brazos",
      equipment: "polea",
      description: "Ejercicio de aislamiento para tríceps",
    },
    {
      name: "Fondos de Tríceps",
      muscleGroup: "brazos",
      equipment: "banco",
      description: "Ejercicio de peso corporal para tríceps",
    },

    // Core Exercises
    {
      name: "Plancha",
      muscleGroup: "core",
      equipment: "peso corporal",
      description: "Ejercicio isométrico para fortalecimiento del core",
    },
    {
      name: "Crunch Abdominal",
      muscleGroup: "core",
      equipment: "peso corporal",
      description: "Ejercicio clásico para abdominales superiores",
    },
    {
      name: "Plancha Lateral",
      muscleGroup: "core",
      equipment: "peso corporal",
      description: "Ejercicio para oblicuos y estabilización lateral",
    },
    {
      name: "Russian Twists",
      muscleGroup: "core",
      equipment: "peso medicinal",
      description: "Ejercicio dinámico para oblicuos y rotación del core",
    },
  ];

  // Crear todos los ejercicios en la base de datos
  return prisma.$transaction(
    exercisesToCreate.map((exercise) =>
      prisma.exercise.create({ data: exercise })
    )
  );
}

// Función para crear un plan de cuerpo completo
export async function createFullBodyWorkout(
  workoutId,
  exercises,
  goal,
  gender
) {
  const workoutExercises = [];
  let order = 1;

  // Filtrar ejercicios por grupo muscular
  const legExercises = exercises.filter((e) => e.muscleGroup === "piernas");
  const chestExercises = exercises.filter((e) => e.muscleGroup === "pecho");
  const backExercises = exercises.filter((e) => e.muscleGroup === "espalda");
  const shoulderExercises = exercises.filter(
    (e) => e.muscleGroup === "hombros"
  );
  const armExercises = exercises.filter((e) => e.muscleGroup === "brazos");
  const coreExercises = exercises.filter((e) => e.muscleGroup === "core");

  // Día 1: Cuerpo Completo
  const day1Exercises = [
    {
      exercise: legExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 1",
    },
    {
      exercise: chestExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 1",
    },
    {
      exercise: backExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 1",
    },
    {
      exercise: shoulderExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 10 : 15,
      restTime: 60,
      notes: "Día 1",
    },
    {
      exercise: armExercises[0],
      sets: 3,
      reps: 12,
      restTime: 60,
      notes: "Día 1",
    },
    {
      exercise: coreExercises[0],
      sets: 3,
      reps: 0,
      restTime: 60,
      notes: "Plancha: 30-45 segundos",
    },
  ];

  // Día 3: Cuerpo Completo (variación)
  const day3Exercises = [
    {
      exercise: legExercises[1] || legExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 3",
    },
    {
      exercise: chestExercises[1] || chestExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 3",
    },
    {
      exercise: backExercises[1] || backExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 3",
    },
    {
      exercise: shoulderExercises[1] || shoulderExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 10 : 15,
      restTime: 60,
      notes: "Día 3",
    },
    {
      exercise: armExercises[1] || armExercises[0],
      sets: 3,
      reps: 12,
      restTime: 60,
      notes: "Día 3",
    },
    {
      exercise: coreExercises[1] || coreExercises[0],
      sets: 3,
      reps: 15,
      restTime: 60,
      notes: "Día 3",
    },
  ];

  // Crear WorkoutExercises para el Día 1
  for (const ex of day1Exercises) {
    workoutExercises.push({
      workoutId,
      exerciseId: ex.exercise.id,
      sets: ex.sets,
      reps: ex.reps,
      restTime: ex.restTime,
      order: order++,
      notes: ex.notes,
      weight: null,
    });
  }

  // Crear WorkoutExercises para el Día 3
  for (const ex of day3Exercises) {
    workoutExercises.push({
      workoutId,
      exerciseId: ex.exercise.id,
      sets: ex.sets,
      reps: ex.reps,
      restTime: ex.restTime,
      order: order++,
      notes: ex.notes,
      weight: null,
    });
  }

  // Guardar todos los ejercicios en la base de datos
  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex }))
  );
}

// Función para crear un plan de división superior/inferior
export async function createUpperLowerSplit(
  workoutId,
  exercises,
  goal,
  gender
) {
  const workoutExercises = [];
  let order = 1;

  // Filtrar ejercicios por grupo muscular
  const legExercises = exercises.filter((e) => e.muscleGroup === "piernas");
  const chestExercises = exercises.filter((e) => e.muscleGroup === "pecho");
  const backExercises = exercises.filter((e) => e.muscleGroup === "espalda");
  const shoulderExercises = exercises.filter(
    (e) => e.muscleGroup === "hombros"
  );
  const armExercises = exercises.filter((e) => e.muscleGroup === "brazos");
  const coreExercises = exercises.filter((e) => e.muscleGroup === "core");

  // Día 1: Tren Superior
  const day1Exercises = [
    {
      exercise: chestExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 1: Tren Superior",
    },
    {
      exercise: backExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 1: Tren Superior",
    },
    {
      exercise: shoulderExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 1: Tren Superior",
    },
    {
      exercise: armExercises[0],
      sets: 3,
      reps: 12,
      restTime: 60,
      notes: "Día 1: Tren Superior",
    },
    {
      exercise: armExercises[1] || armExercises[0],
      sets: 3,
      reps: 12,
      restTime: 60,
      notes: "Día 1: Tren Superior",
    },
  ];

  // Día 2: Tren Inferior
  const day2Exercises = [
    {
      exercise: legExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 15,
      restTime: 90,
      notes: "Día 2: Tren Inferior",
    },
    {
      exercise: legExercises[1] || legExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 2: Tren Inferior",
    },
    {
      exercise: legExercises[2] || legExercises[0],
      sets: 3,
      reps: 12,
      restTime: 60,
      notes: "Día 2: Tren Inferior",
    },
    {
      exercise: coreExercises[0],
      sets: 3,
      reps: 0,
      restTime: 60,
      notes: "Plancha: 45 segundos",
    },
    {
      exercise: coreExercises[1] || coreExercises[0],
      sets: 3,
      reps: 15,
      restTime: 60,
      notes: "Día 2: Tren Inferior",
    },
  ];

  // Día 4: Tren Superior (variación)
  const day4Exercises = [
    {
      exercise: chestExercises[1] || chestExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 4: Tren Superior",
    },
    {
      exercise: backExercises[1] || backExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 4: Tren Superior",
    },
    {
      exercise: shoulderExercises[1] || shoulderExercises[0],
      sets: 3,
      reps: 15,
      restTime: 60,
      notes: "Día 4: Tren Superior",
    },
    {
      exercise: backExercises[2] || backExercises[0],
      sets: 3,
      reps: 12,
      restTime: 60,
      notes: "Día 4: Tren Superior",
    },
    {
      exercise: armExercises[2] || armExercises[0],
      sets: 3,
      reps: 12,
      restTime: 60,
      notes: "Día 4: Tren Superior",
    },
  ];

  // Día 5: Tren Inferior (variación)
  const day5Exercises = [
    {
      exercise: legExercises[3] || legExercises[0],
      sets: 3,
      reps: 15,
      restTime: 60,
      notes: "Día 5: Tren Inferior",
    },
    {
      exercise: legExercises[4] || legExercises[1] || legExercises[0],
      sets: 3,
      reps: 12,
      restTime: 60,
      notes: "Día 5: Tren Inferior",
    },
    {
      exercise: legExercises[5] || legExercises[2] || legExercises[0],
      sets: 3,
      reps: 15,
      restTime: 60,
      notes: "Día 5: Tren Inferior",
    },
    {
      exercise: coreExercises[2] || coreExercises[0],
      sets: 3,
      reps: 20,
      restTime: 45,
      notes: "Día 5: Tren Inferior",
    },
    {
      exercise: coreExercises[3] || coreExercises[1] || coreExercises[0],
      sets: 3,
      reps: 15,
      restTime: 45,
      notes: "Día 5: Tren Inferior",
    },
  ];

  // Crear WorkoutExercises para todos los días
  const allDaysExercises = [
    ...day1Exercises,
    ...day2Exercises,
    ...day4Exercises,
    ...day5Exercises,
  ];

  for (const ex of allDaysExercises) {
    workoutExercises.push({
      workoutId,
      exerciseId: ex.exercise.id,
      sets: ex.sets,
      reps: ex.reps,
      restTime: ex.restTime,
      order: order++,
      notes: ex.notes,
      weight: null,
    });
  }

  // Guardar todos los ejercicios en la base de datos
  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex }))
  );
}

// Función para crear un plan de push/pull/legs
export async function createPushPullLegsSplit(
  workoutId,
  exercises,
  goal,
  gender
) {
  const workoutExercises = [];
  let order = 1;

  // Filtrar ejercicios por grupo muscular
  const legExercises = exercises.filter((e) => e.muscleGroup === "piernas");
  const chestExercises = exercises.filter((e) => e.muscleGroup === "pecho");
  const backExercises = exercises.filter((e) => e.muscleGroup === "espalda");
  const shoulderExercises = exercises.filter(
    (e) => e.muscleGroup === "hombros"
  );
  const armExercises = exercises.filter((e) => e.muscleGroup === "brazos");
  const coreExercises = exercises.filter((e) => e.muscleGroup === "core");

  // Filtrar ejercicios de tríceps y bíceps
  const tricepsExercises = armExercises.filter((e) =>
    e.name.toLowerCase().includes("tríceps")
  );
  const bicepsExercises = armExercises.filter((e) =>
    e.name.toLowerCase().includes("bíceps")
  );

  // Día 1: Push (Pecho, Hombros, Tríceps)
  const day1Exercises = [
    {
      exercise: chestExercises[0],
      sets: 4,
      reps: goal === "gain-muscle" ? 6 : 10,
      restTime: 90,
      notes: "Día 1: Push",
    },
    {
      exercise: chestExercises[1] || chestExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 1: Push",
    },
    {
      exercise: shoulderExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 1: Push",
    },
    {
      exercise: shoulderExercises[1] || shoulderExercises[0],
      sets: 3,
      reps: 12,
      restTime: 60,
      notes: "Día 1: Push",
    },
    {
      exercise: tricepsExercises[0] || armExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 10 : 12,
      restTime: 60,
      notes: "Día 1: Push",
    },
    {
      exercise: tricepsExercises[1] || tricepsExercises[0] || armExercises[0],
      sets: 3,
      reps: 12,
      restTime: 60,
      notes: "Día 1: Push",
    },
  ];

  // Día 2: Pull (Espalda, Bíceps)
  const day2Exercises = [
    {
      exercise: backExercises[0],
      sets: 4,
      reps: goal === "gain-muscle" ? 6 : 10,
      restTime: 90,
      notes: "Día 2: Pull",
    },
    {
      exercise: backExercises[1] || backExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 2: Pull",
    },
    {
      exercise: backExercises[2] || backExercises[0],
      sets: 3,
      reps: 12,
      restTime: 60,
      notes: "Día 2: Pull",
    },
    {
      exercise: shoulderExercises[2] || shoulderExercises[0],
      sets: 3,
      reps: 15,
      restTime: 60,
      notes: "Día 2: Pull",
    },
    {
      exercise: bicepsExercises[0] || armExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 10 : 12,
      restTime: 60,
      notes: "Día 2: Pull",
    },
    {
      exercise: bicepsExercises[1] || bicepsExercises[0] || armExercises[0],
      sets: 3,
      reps: 12,
      restTime: 60,
      notes: "Día 2: Pull",
    },
  ];

  // Día 3: Legs
  const day3Exercises = [
    {
      exercise: legExercises[0],
      sets: 4,
      reps: goal === "gain-muscle" ? 6 : 12,
      restTime: 120,
      notes: "Día 3: Legs",
    },
    {
      exercise: legExercises[1] || legExercises[0],
      sets: 3,
      reps: 12,
      restTime: 90,
      notes: "Día 3: Legs",
    },
    {
      exercise: legExercises[2] || legExercises[0],
      sets: 3,
      reps: goal === "gain-muscle" ? 8 : 12,
      restTime: 90,
      notes: "Día 3: Legs",
    },
    {
      exercise: legExercises[3] || legExercises[0],
      sets: 3,
      reps: 15,
      restTime: 60,
      notes: "Día 3: Legs",
    },
    {
      exercise: legExercises[4] || legExercises[1] || legExercises[0],
      sets: 3,
      reps: 15,
      restTime: 60,
      notes: "Día 3: Legs",
    },
    {
      exercise: coreExercises[0],
      sets: 3,
      reps: 0,
      restTime: 60,
      notes: "Plancha: 45-60 segundos",
    },
  ];

  // Crear WorkoutExercises para todos los días
  const allDaysExercises = [
    ...day1Exercises,
    ...day2Exercises,
    ...day3Exercises,
  ];

  for (const ex of allDaysExercises) {
    workoutExercises.push({
      workoutId,
      exerciseId: ex.exercise.id,
      sets: ex.sets,
      reps: ex.reps,
      restTime: ex.restTime,
      order: order++,
      notes: ex.notes,
      weight: null,
    });
  }

  // Guardar todos los ejercicios en la base de datos
  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex }))
  );
}
