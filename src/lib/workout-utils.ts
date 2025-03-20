/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

// Get or create exercises in the database
export async function getOrCreateExercises() {
  // Check if exercises already exist
  const count = await prisma.exercise.count();

  if (count > 0) {
    // If they exist, return all exercises
    return prisma.exercise.findMany();
  }

  // If they don't exist, create basic exercises
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
      name: "Prensa de piernas",
      muscleGroup: "piernas",
      equipment: "máquina",
      description:
        "Ejercicio compuesto para piernas, enfocado en cuádriceps y glúteos",
    },
    {
      name: "Extensiones de cuádriceps",
      muscleGroup: "piernas",
      equipment: "máquina",
      description: "Ejercicio de aislamiento para cuádriceps",
    },
    {
      name: "Curl femoral",
      muscleGroup: "piernas",
      equipment: "máquina",
      description: "Ejercicio de aislamiento para isquiotibiales",
    },
    {
      name: "Elevaciones de pantorrilla",
      muscleGroup: "piernas",
      equipment: "máquina",
      description: "Ejercicio de aislamiento para pantorrillas",
    },
    {
      name: "Abductores",
      muscleGroup: "piernas",
      equipment: "máquina",
      description: "Ejercicio de aislamiento para abductores de cadera",
    },
    {
      name: "Aductores",
      muscleGroup: "piernas",
      equipment: "máquina",
      description: "Ejercicio de aislamiento para aductores de cadera",
    },
    {
      name: "Peso muerto",
      muscleGroup: "piernas",
      equipment: "peso libre",
      description:
        "Ejercicio compuesto para isquiotibiales, glúteos y espalda baja",
    },
    {
      name: "Zancadas",
      muscleGroup: "piernas",
      equipment: "peso libre",
      description:
        "Ejercicio compuesto para piernas, enfocado en cuádriceps, glúteos e isquiotibiales",
    },
    {
      name: "Hip Thrust",
      muscleGroup: "piernas",
      equipment: "peso libre",
      description: "Ejercicio compuesto para glúteos",
    },

    // Chest Exercises
    {
      name: "Press de banca",
      muscleGroup: "pecho",
      equipment: "peso libre",
      description: "Ejercicio compuesto para pecho, hombros y tríceps",
    },
    {
      name: "Press de banca inclinado",
      muscleGroup: "pecho",
      equipment: "peso libre",
      description: "Ejercicio compuesto para pecho superior, hombros y tríceps",
    },
    {
      name: "Press de banca declinado",
      muscleGroup: "pecho",
      equipment: "peso libre",
      description: "Ejercicio compuesto para pecho inferior, hombros y tríceps",
    },
    {
      name: "Aperturas con mancuernas",
      muscleGroup: "pecho",
      equipment: "peso libre",
      description: "Ejercicio de aislamiento para pecho",
    },
    {
      name: "Fondos en paralelas",
      muscleGroup: "pecho",
      equipment: "peso corporal",
      description: "Ejercicio compuesto para pecho inferior y tríceps",
    },
    {
      name: "Máquina de press",
      muscleGroup: "pecho",
      equipment: "máquina",
      description: "Ejercicio compuesto para pecho",
    },
    {
      name: "Contractor de pecho",
      muscleGroup: "pecho",
      equipment: "máquina",
      description: "Ejercicio de aislamiento para pecho",
    },
    {
      name: "Pullover",
      muscleGroup: "pecho",
      equipment: "peso libre",
      description: "Ejercicio para pecho y dorsal",
    },

    // Back Exercises
    {
      name: "Dominadas",
      muscleGroup: "espalda",
      equipment: "peso corporal",
      description: "Ejercicio compuesto para espalda y bíceps",
    },
    {
      name: "Remo con barra",
      muscleGroup: "espalda",
      equipment: "peso libre",
      description: "Ejercicio compuesto para espalda y bíceps",
    },
    {
      name: "Remo con mancuerna",
      muscleGroup: "espalda",
      equipment: "peso libre",
      description: "Ejercicio compuesto para espalda y bíceps",
    },
    {
      name: "Jalón al pecho",
      muscleGroup: "espalda",
      equipment: "máquina",
      description: "Ejercicio compuesto para espalda y bíceps",
    },
    {
      name: "Remo en máquina",
      muscleGroup: "espalda",
      equipment: "máquina",
      description: "Ejercicio compuesto para espalda y bíceps",
    },
    {
      name: "Pull-over",
      muscleGroup: "espalda",
      equipment: "peso libre",
      description: "Ejercicio para dorsal y pecho",
    },
    {
      name: "Hiperextensiones",
      muscleGroup: "espalda",
      equipment: "peso corporal",
      description: "Ejercicio para espalda baja",
    },
    {
      name: "Encogimientos de hombros",
      muscleGroup: "espalda",
      equipment: "peso libre",
      description: "Ejercicio de aislamiento para trapecios",
    },

    // Shoulder Exercises
    {
      name: "Press militar",
      muscleGroup: "hombros",
      equipment: "peso libre",
      description: "Ejercicio compuesto para hombros y tríceps",
    },
    {
      name: "Elevaciones laterales",
      muscleGroup: "hombros",
      equipment: "peso libre",
      description: "Ejercicio de aislamiento para deltoides lateral",
    },
    {
      name: "Elevaciones frontales",
      muscleGroup: "hombros",
      equipment: "peso libre",
      description: "Ejercicio de aislamiento para deltoides anterior",
    },
    {
      name: "Pájaro",
      muscleGroup: "hombros",
      equipment: "peso libre",
      description: "Ejercicio de aislamiento para deltoides posterior",
    },
    {
      name: "Press Arnold",
      muscleGroup: "hombros",
      equipment: "peso libre",
      description: "Ejercicio compuesto para hombros",
    },
    {
      name: "Remo al mentón",
      muscleGroup: "hombros",
      equipment: "peso libre",
      description: "Ejercicio compuesto para hombros y trapecios",
    },

    // Arm Exercises
    {
      name: "Curl de bíceps con barra",
      muscleGroup: "brazos",
      equipment: "peso libre",
      description: "Ejercicio de aislamiento para bíceps",
    },
    {
      name: "Curl de bíceps con mancuernas",
      muscleGroup: "brazos",
      equipment: "peso libre",
      description: "Ejercicio de aislamiento para bíceps",
    },
    {
      name: "Curl martillo",
      muscleGroup: "brazos",
      equipment: "peso libre",
      description: "Ejercicio de aislamiento para bíceps y braquial",
    },
    {
      name: "Curl concentrado",
      muscleGroup: "brazos",
      equipment: "peso libre",
      description: "Ejercicio de aislamiento para bíceps",
    },
    {
      name: "Extensiones de tríceps",
      muscleGroup: "brazos",
      equipment: "peso libre",
      description: "Ejercicio de aislamiento para tríceps",
    },
    {
      name: "Press francés",
      muscleGroup: "brazos",
      equipment: "peso libre",
      description: "Ejercicio de aislamiento para tríceps",
    },
    {
      name: "Fondos en banco",
      muscleGroup: "brazos",
      equipment: "peso corporal",
      description: "Ejercicio compuesto para tríceps",
    },
    {
      name: "Patada de tríceps",
      muscleGroup: "brazos",
      equipment: "peso libre",
      description: "Ejercicio de aislamiento para tríceps",
    },

    // Core Exercises
    {
      name: "Plancha",
      muscleGroup: "core",
      equipment: "peso corporal",
      description: "Ejercicio isométrico para core",
    },
    {
      name: "Crunch",
      muscleGroup: "core",
      equipment: "peso corporal",
      description: "Ejercicio para abdominales superiores",
    },
    {
      name: "Elevaciones de piernas",
      muscleGroup: "core",
      equipment: "peso corporal",
      description: "Ejercicio para abdominales inferiores",
    },
    {
      name: "Russian twist",
      muscleGroup: "core",
      equipment: "peso corporal",
      description: "Ejercicio para oblicuos",
    },
    {
      name: "Rueda abdominal",
      muscleGroup: "core",
      equipment: "accesorio",
      description: "Ejercicio compuesto para core",
    },
    {
      name: "Mountain climber",
      muscleGroup: "core",
      equipment: "peso corporal",
      description: "Ejercicio dinámico para core y cardio",
    },
  ];

  // Create all exercises in the database
  return prisma.$transaction(
    exercisesToCreate.map((exercise) =>
      prisma.exercise.create({ data: exercise })
    )
  );
}

// Determine the best workout type based on user profile and history
export function getRecommendedWorkoutType(profile: {
  experienceLevel: string;
  goal: string | null;
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  bodyFatPercentage: string | null;
  gender: string | null;
  birthdate: Date | null;
  height: string | null;
  currentWeight: string | null;
  targetWeight: string | null;
  activityLevel: string | null;
  muscleMass: string | null;
  metabolicRate: number | null;
  dailyActivity: string | null;
  trainingFrequency: number | null;
  preferredWorkoutTime: string | null;
  dietaryPreference: string | null;
  dailyCalorieTarget: number | null;
  dailyProteinTarget: number | null;
  dailyCarbTarget: number | null;
  dailyFatTarget: number | null;
  waterIntake: number | null;
  notificationsActive: boolean;
}) {
  const trainingFrequency = profile?.trainingFrequency ?? 0;
  const goal = profile?.goal ?? "";
  const activityLevel = profile?.activityLevel ?? "";
  const experienceLevel = profile?.experienceLevel ?? "";

  if (!experienceLevel) {
    console.warn("experienceLevel no está definido en profile");
  }

  // Para principiantes o personas con tiempo limitado
  if (
    experienceLevel === "beginner" ||
    trainingFrequency <= 3 ||
    activityLevel === "sedentary" ||
    activityLevel === "light"
  ) {
    return "Full Body";
  }

  // Para usuarios intermedios con tiempo moderado
  if (experienceLevel === "intermediate" || trainingFrequency <= 4) {
    return "Upper/Lower Split";
  }

  // Para usuarios avanzados o con más tiempo
  if (experienceLevel === "advanced" || trainingFrequency >= 5) {
    if (goal === "gain-muscle") {
      return "Push/Pull/Legs";
    } else if (goal === "strength") {
      return "Upper/Lower Split";
    } else {
      return "Weider";
    }
  }

  // Default a full body como opción segura
  return "Full Body";
}

// Main function to create a workout plan based on type
export async function createWorkoutPlan(
  workoutId: string,
  exercises: {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
    imageUrl: string | null;
    muscleGroup: string;
    equipment: string | null;
    videoUrl: string | null;
  }[],
  goal: string,
  gender: string | null,
  trainingFrequency: number,
  workoutType: string,
  _workoutHistory: {
    id: string;
    name: string;
    sets: number;
    reps: number;
    restTime?: number | null;
    notes?: string | null;
  }[],
  methodology = "standard" // Valor por defecto
) {
  // Primero determinamos el tipo de entrenamiento según la distribución corporal
  switch (workoutType) {
    case "Full Body":
      return createFullBodyWorkout(
        workoutId,
        exercises,
        goal,
        gender,
        trainingFrequency
        // methodology
      );
    case "Upper/Lower Split":
      return createUpperLowerSplit(
        workoutId,
        exercises,
        goal,
        gender,
        trainingFrequency,
        methodology
      );
    case "Push/Pull/Legs":
      return createPushPullLegsSplit(
        workoutId,
        exercises,
        goal,
        gender,
        trainingFrequency,
        methodology
      );
    case "Weider":
      return createWeiderSplit(
        workoutId,
        exercises,
        goal,
        gender,
        trainingFrequency,
        methodology
      );
    default:
      // Si no hay un tipo específico, crear un plan equilibrado basado en la frecuencia
      if (trainingFrequency <= 3) {
        return createFullBodyWorkout(
          workoutId,
          exercises,
          goal,
          gender,
          trainingFrequency
          // methodology
        );
      } else if (trainingFrequency <= 5) {
        return createUpperLowerSplit(
          workoutId,
          exercises,
          goal,
          gender,
          trainingFrequency,
          methodology
        );
      } else {
        return createPushPullLegsSplit(
          workoutId,
          exercises,
          goal,
          gender,
          trainingFrequency,
          methodology
        );
      }
  }
}

// Función para determinar sets y reps según el objetivo
function getSetsAndRepsForGoal(goal: any, exerciseType = "compound") {
  switch (goal) {
    case "strength":
      return {
        sets: exerciseType === "compound" ? 5 : 3,
        reps: exerciseType === "compound" ? 5 : 8,
        restTime: 180, // 3 minutos para recuperación completa
      };
    case "gain-muscle":
    case "hypertrophy":
      return {
        sets: exerciseType === "compound" ? 4 : 3,
        reps: exerciseType === "compound" ? 8 : 12,
        restTime: 90, // 90 segundos para balance entre recuperación y congestión
      };
    case "endurance":
      return {
        sets: 3,
        reps: 15,
        restTime: 45, // Descanso corto para mantener ritmo cardíaco elevado
      };
    case "lose-weight":
    case "fat-loss":
      return {
        sets: 3,
        reps: 12,
        restTime: 60, // Descanso moderado para mantener intensidad
      };
    case "mobility":
      return {
        sets: 2,
        reps: 12,
        restTime: 30, // Descanso corto para ejercicios de movilidad
      };
    default:
      return {
        sets: 3,
        reps: 10,
        restTime: 60,
      };
  }
}

// Función para aplicar metodología al entrenamiento
function applyMethodology(exercises: any[], methodology: string, goal: string) {
  // Clonar los ejercicios para no modificar el original
  const modifiedExercises = [...exercises];

  switch (methodology) {
    case "circuit":
      // En circuito, reducimos el descanso y añadimos indicación en las notas
      return modifiedExercises.map((ex) => ({
        ...ex,
        restTime: 30, // Descanso mínimo entre ejercicios
        notes: ex.notes + " (Circuito: mínimo descanso entre ejercicios)",
      }));

    case "hiit":
      // Para HIIT, ajustamos a intervalos de alta intensidad
      return modifiedExercises.map((ex) => ({
        ...ex,
        reps: Math.max(8, ex.reps - 2), // Menos reps pero más intensas
        restTime: 20, // Descanso muy corto
        notes: ex.notes + " (HIIT: 20s trabajo, 10s descanso)",
      }));

    case "drop-sets":
      // Para drop sets, mantenemos las series pero indicamos la técnica
      if (goal === "gain-muscle" || goal === "hypertrophy") {
        return modifiedExercises.map((ex) => ({
          ...ex,
          sets: Math.max(2, ex.sets - 1), // Reducimos series porque son más intensas
          notes: ex.notes + " (Drop set: reduce peso 20% al fallar y continúa)",
        }));
      }
      return modifiedExercises;

    case "pyramid":
      // Para pirámide, ajustamos las series y reps
      return modifiedExercises.map((ex) => ({
        ...ex,
        notes:
          ex.notes + " (Pirámide: aumenta peso y reduce reps en cada serie)",
      }));

    case "supersets":
      // Para superseries, emparejamos ejercicios y reducimos descanso
      if (modifiedExercises.length >= 2) {
        for (let i = 0; i < modifiedExercises.length - 1; i += 2) {
          modifiedExercises[i].notes += ` (Superset con ${
            modifiedExercises[i + 1].name
          })`;
          modifiedExercises[
            i + 1
          ].notes += ` (Superset con ${modifiedExercises[i].name})`;
          modifiedExercises[i].restTime = 0; // No descanso entre ejercicios de la superserie
        }
      }
      return modifiedExercises;

    default:
      return modifiedExercises;
  }
}

// Create a full body workout plan
export async function createFullBodyWorkout(
  workoutId: any,
  exercises: any[],
  goal: any,
  _gender: any,
  trainingFrequency: number
) {
  const workoutExercises = [];
  let order = 1;

  // Get sets and reps based on goal
  // const compoundSettings = getSetsAndRepsForGoal(goal, "compound");

  // Filter exercises by muscle group
  const legExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "piernas"
  );
  const chestExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "pecho"
  );
  const backExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "espalda"
  );
  const shoulderExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "hombros"
  );
  const armExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "brazos"
  );
  const coreExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "core"
  );

  // Determine workout structure based on training frequency
  const workoutDays = Math.min(trainingFrequency, 3); // Cap at 3 days for full body

  // Create workout days
  for (let day = 1; day <= workoutDays; day++) {
    // Define muscle group name for this day
    const muscleGroupName = "Full Body";

    // Get sets and reps based on goal
    const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
    const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

    // Adjust exercise selection for variety across days
    interface Exercise {
      id: number;
      name: string;
      muscleGroup: string;
      equipment: string;
      description: string;
    }

    interface DayExercise {
      exercise: Exercise;
      sets: number;
      reps: number;
      restTime: number;
      notes: string;
    }

    const dayExercises: DayExercise[] = [
      {
        exercise: legExercises[day % legExercises.length],
        sets: compoundSettings.sets,
        reps: compoundSettings.reps,
        restTime: compoundSettings.restTime,
        notes: `${muscleGroupName} - Piernas`,
      },
      {
        exercise: chestExercises[day % chestExercises.length],
        sets: compoundSettings.sets,
        reps: compoundSettings.reps,
        restTime: compoundSettings.restTime,
        notes: `${muscleGroupName} - Pecho`,
      },
      {
        exercise: backExercises[day % backExercises.length],
        sets: compoundSettings.sets,
        reps: compoundSettings.reps,
        restTime: compoundSettings.restTime,
        notes: `${muscleGroupName} - Espalda`,
      },
      {
        exercise: shoulderExercises[day % shoulderExercises.length],
        sets: isolationSettings.sets,
        reps: isolationSettings.reps,
        restTime: isolationSettings.restTime,
        notes: `${muscleGroupName} - Hombros`,
      },
      {
        exercise: armExercises[day % armExercises.length],
        sets: isolationSettings.sets,
        reps: isolationSettings.reps,
        restTime: isolationSettings.restTime,
        notes: `${muscleGroupName} - Brazos`,
      },
      {
        exercise: coreExercises[day % coreExercises.length],
        sets: isolationSettings.sets,
        reps: day === 1 ? 0 : isolationSettings.reps, // Plank on day 1, reps on other days
        restTime: isolationSettings.restTime,
        notes:
          day === 1
            ? `${muscleGroupName} - Core (Plancha: 30-45 segundos)`
            : `${muscleGroupName} - Core`,
      },
    ];

    // Apply methodology if specified
    // if (methodology !== "standard") {
    //   const dayExerc = applyMethodology(dayExercises, methodology, goal);
    // }

    // Add exercises for this day to the workout
    for (const ex of dayExercises) {
      if (ex.exercise) {
        // Make sure the exercise exists
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
    }
  }

  // Save all exercises to the database
  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex }))
  );
}

// Create an upper/lower split workout plan
export async function createUpperLowerSplit(
  workoutId: any,
  exercises: any[],
  goal: any,
  _gender: any,
  trainingFrequency: number,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const legExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "piernas"
  );
  const chestExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "pecho"
  );
  const backExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "espalda"
  );
  const shoulderExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "hombros"
  );
  const armExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "brazos"
  );
  const coreExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "core"
  );

  // Determine workout structure based on training frequencya
  const workoutDays = Math.min(trainingFrequency, 4); // Cap at 4 days for upper/lower

  // Create workout days
  for (let day = 1; day <= workoutDays; day++) {
    const isUpperDay = day % 2 === 1; // Odd days are upper body, even days are lower body
    const muscleGroupName = isUpperDay ? "Tren Superior" : "Tren Inferior";

    // Get sets and reps based on goal
    const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

    let dayExercises = [];

    if (isUpperDay) {
      // Upper body day
      dayExercises = [
        {
          exercise: chestExercises[Math.floor(day / 2) % chestExercises.length],
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Pecho`,
        },
        {
          exercise: backExercises[Math.floor(day / 2) % backExercises.length],
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Espalda`,
        },
        {
          exercise:
            shoulderExercises[Math.floor(day / 2) % shoulderExercises.length],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Hombros`,
        },
        {
          exercise: armExercises[Math.floor(day / 2) % armExercises.length],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Bíceps`,
        },
        {
          exercise:
            armExercises[(Math.floor(day / 2) + 1) % armExercises.length],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Tríceps`,
        },
      ];
    } else {
      // Lower body day
      dayExercises = [
        {
          exercise: legExercises[Math.floor(day / 2) % legExercises.length],
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Cuádriceps`,
        },
        {
          exercise:
            legExercises[(Math.floor(day / 2) + 1) % legExercises.length],
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Isquiotibiales`,
        },
        {
          exercise:
            legExercises[(Math.floor(day / 2) + 2) % legExercises.length],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Glúteos`,
        },
        {
          exercise: coreExercises[Math.floor(day / 2) % coreExercises.length],
          sets: isolationSettings.sets,
          reps: Math.floor(day / 2) === 0 ? 0 : isolationSettings.reps, // Plank on first lower day
          restTime: isolationSettings.restTime,
          notes:
            Math.floor(day / 2) === 0
              ? `${muscleGroupName} - Core (Plancha: 45 segundos)`
              : `${muscleGroupName} - Core`,
        },
        {
          exercise:
            coreExercises[(Math.floor(day / 2) + 1) % coreExercises.length],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Oblicuos`,
        },
      ];
    }

    // Apply methodology if specified
    if (methodology !== "standard") {
      dayExercises = applyMethodology(dayExercises, methodology, goal);
    }

    // Add exercises for this day to the workout
    for (const ex of dayExercises) {
      if (ex.exercise) {
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
    }
  }

  // Save all exercises to the database
  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex }))
  );
}

// Create a push/pull/legs split workout plan
export async function createPushPullLegsSplit(
  workoutId: any,
  exercises: any[],
  goal: any,
  _gender: any,
  trainingFrequency: number,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const legExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "piernas"
  );
  const chestExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "pecho"
  );
  const backExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "espalda"
  );
  const shoulderExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "hombros"
  );
  const armExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "brazos"
  );
  const coreExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "core"
  );

  // Filter triceps and biceps exercises
  const tricepsExercises = armExercises.filter((e: { name: string }) =>
    e.name.toLowerCase().includes("tríceps")
  );
  const bicepsExercises = armExercises.filter((e: { name: string }) =>
    e.name.toLowerCase().includes("bíceps")
  );

  // Determine workout structure based on training frequency
  const workoutDays = Math.min(trainingFrequency, 6); // Cap at 6 days for PPL

  // Create workout days
  for (let day = 1; day <= workoutDays; day++) {
    const dayType = day % 3; // 1 = Push, 2 = Pull, 0 = Legs

    // Get sets and reps based on goal
    const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
    const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

    let dayExercises = [];

    if (dayType === 1) {
      // Push day (Chest, Shoulders, Triceps)
      const muscleGroupName = "Pecho y Tríceps";
      dayExercises = [
        {
          exercise: chestExercises[Math.floor(day / 3) % chestExercises.length],
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Pecho principal`,
        },
        {
          exercise:
            chestExercises[(Math.floor(day / 3) + 1) % chestExercises.length],
          sets: compoundSettings.sets - 1,
          reps: compoundSettings.reps + 2,
          restTime: compoundSettings.restTime - 30,
          notes: `${muscleGroupName} - Pecho secundario`,
        },
        {
          exercise:
            shoulderExercises[Math.floor(day / 3) % shoulderExercises.length],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Hombros`,
        },
        {
          exercise:
            shoulderExercises[
              (Math.floor(day / 3) + 1) % shoulderExercises.length
            ],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Hombros secundario`,
        },
        {
          exercise:
            tricepsExercises[Math.floor(day / 3) % tricepsExercises.length] ||
            armExercises[0],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Tríceps principal`,
        },
        {
          exercise:
            tricepsExercises[
              (Math.floor(day / 3) + 1) % tricepsExercises.length
            ] ||
            armExercises[1] ||
            armExercises[0],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Tríceps secundario`,
        },
      ];
    } else if (dayType === 2) {
      // Pull day (Back, Biceps)
      const muscleGroupName = "Espalda y Bíceps";
      dayExercises = [
        {
          exercise: backExercises[Math.floor(day / 3) % backExercises.length],
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Espalda principal`,
        },
        {
          exercise:
            backExercises[(Math.floor(day / 3) + 1) % backExercises.length],
          sets: compoundSettings.sets - 1,
          reps: compoundSettings.reps + 2,
          restTime: compoundSettings.restTime - 30,
          notes: `${muscleGroupName} - Espalda secundaria`,
        },
        {
          exercise:
            backExercises[(Math.floor(day / 3) + 2) % backExercises.length],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Espalda aislamiento`,
        },
        {
          exercise:
            shoulderExercises[
              (Math.floor(day / 3) + 2) % shoulderExercises.length
            ],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Trapecios`,
        },
        {
          exercise:
            bicepsExercises[Math.floor(day / 3) % bicepsExercises.length] ||
            armExercises[0],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Bíceps principal`,
        },
        {
          exercise:
            bicepsExercises[
              (Math.floor(day / 3) + 1) % bicepsExercises.length
            ] ||
            armExercises[1] ||
            armExercises[0],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Bíceps secundario`,
        },
      ];
    } else {
      // Legs day
      const muscleGroupName = "Piernas";
      dayExercises = [
        {
          exercise: legExercises[Math.floor(day / 3) % legExercises.length],
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Cuádriceps principal`,
        },
        {
          exercise:
            legExercises[(Math.floor(day / 3) + 1) % legExercises.length],
          sets: compoundSettings.sets - 1,
          reps: compoundSettings.reps + 2,
          restTime: compoundSettings.restTime - 30,
          notes: `${muscleGroupName} - Isquiotibiales`,
        },
        {
          exercise:
            legExercises[(Math.floor(day / 3) + 2) % legExercises.length],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Glúteos`,
        },
        {
          exercise:
            legExercises[(Math.floor(day / 3) + 3) % legExercises.length],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Pantorrillas`,
        },
        {
          exercise: coreExercises[Math.floor(day / 3) % coreExercises.length],
          sets: isolationSettings.sets,
          reps: Math.floor(day / 3) === 0 ? 0 : isolationSettings.reps, // Plank on first legs day
          restTime: isolationSettings.restTime,
          notes:
            Math.floor(day / 3) === 0
              ? `${muscleGroupName} - Core (Plancha: 45-60 segundos)`
              : `${muscleGroupName} - Core`,
        },
        {
          exercise:
            coreExercises[(Math.floor(day / 3) + 1) % coreExercises.length],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Oblicuos`,
        },
      ];
    }

    // Apply methodology if specified
    if (methodology !== "standard") {
      dayExercises = applyMethodology(dayExercises, methodology, goal);
    }

    // Add exercises for this day to the workout
    for (const ex of dayExercises) {
      if (ex.exercise) {
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
    }
  }

  // Save all exercises to the database
  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex }))
  );
}

// Create a Weider split workout plan (one muscle group per day)
export async function createWeiderSplit(
  workoutId: any,
  exercises: any[],
  goal: any,
  _gender: any,
  trainingFrequency: number,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const legExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "piernas"
  );
  const chestExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "pecho"
  );
  const backExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "espalda"
  );
  const shoulderExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "hombros"
  );
  const armExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "brazos"
  );
  const coreExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "core"
  );

  // Determine workout structure based on training frequency
  const workoutDays = Math.min(trainingFrequency, 6); // Cap at 6 days for Weider

  // Define muscle groups for each day
  const muscleGroups = [
    { name: "Pecho", exercises: chestExercises },
    { name: "Espalda", exercises: backExercises },
    { name: "Piernas", exercises: legExercises },
    { name: "Hombros", exercises: shoulderExercises },
    { name: "Brazos", exercises: armExercises },
    { name: "Core", exercises: coreExercises },
  ];

  // Create workout days
  for (let day = 1; day <= workoutDays; day++) {
    const muscleGroupIndex = (day - 1) % muscleGroups.length;
    const { name: muscleGroupName, exercises: muscleGroupExercises } =
      muscleGroups[muscleGroupIndex];

    // Get sets and reps based on goal
    const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
    const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

    // Select exercises for this muscle group (4-6 exercises per muscle group)
    const numExercises = Math.min(
      muscleGroupExercises.length,
      muscleGroupName === "Core" ? 4 : 5
    );
    let dayExercises = [];

    for (let i = 0; i < numExercises; i++) {
      const exercise = muscleGroupExercises[i % muscleGroupExercises.length];
      const isCompound = i < 2; // First 2 exercises are compound

      dayExercises.push({
        exercise,
        sets: isCompound ? compoundSettings.sets : isolationSettings.sets,
        reps: isCompound ? compoundSettings.reps : isolationSettings.reps,
        restTime: isCompound
          ? compoundSettings.restTime
          : isolationSettings.restTime,
        notes: `${muscleGroupName} - ${
          i === 0
            ? "Principal"
            : i === 1
            ? "Secundario"
            : "Aislamiento " + (i - 1)
        }`,
      });
    }

    // Apply methodology if specified
    if (methodology !== "standard") {
      dayExercises = applyMethodology(dayExercises, methodology, goal);
    }

    // Add exercises for this day to the workout
    for (const ex of dayExercises) {
      if (ex.exercise) {
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
    }
  }

  // Save all exercises to the database
  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex }))
  );
}

// Mantener las funciones existentes para tipos específicos de entrenamiento
export async function createChestTricepsWorkout(
  workoutId: string,
  exercises: any[],
  goal: any,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;

  const chestExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "pecho"
  );
  const tricepsExercises =
    exercises.filter(
      (e: { muscleGroup: string; name: string }) =>
        e.muscleGroup === "brazos" && e.name.toLowerCase().includes("tríceps")
    ) ||
    exercises
      .filter((e: { muscleGroup: string }) => e.muscleGroup === "brazos")
      .slice(0, 2);

  // Get sets and reps based on goal
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const muscleGroupName = "Pecho y Tríceps";
  let dayExercises = [
    // Chest Exercises - Compound movements first
    {
      exercise: chestExercises[0] || null,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Pecho principal`,
    },
    {
      exercise: chestExercises[1] || chestExercises[0] || null,
      sets: isolationSettings.sets - 1,
      reps: isolationSettings.reps + 2,
      restTime: isolationSettings.restTime - 30,
      notes: `${muscleGroupName} - Pecho inclinado`,
    },
    {
      exercise: chestExercises[2] || chestExercises[0] || null,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Pecho aislamiento`,
    },
    // Triceps Exercises
    {
      exercise: tricepsExercises[0] || null,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Tríceps principal`,
    },
    {
      exercise: tricepsExercises[1] || tricepsExercises[0] || null,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Tríceps aislamiento`,
    },
  ];

  // Apply methodology if specified
  if (methodology !== "standard") {
    dayExercises = applyMethodology(dayExercises, methodology, goal);
  }

  for (const ex of dayExercises) {
    if (ex.exercise) {
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
  }

  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex }))
  );
}

// Mantener las demás funciones específicas (createBackBicepsWorkout, createLegWorkout, etc.)
// con la misma estructura que createChestTricepsWorkout, añadiendo el parámetro methodology
// y aplicando la metodología cuando sea necesario

export async function createBackBicepsWorkout(
  workoutId: string,
  exercises: any[],
  goal: any,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;

  const backExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "espalda"
  );
  const bicepsExercises =
    exercises.filter(
      (e: { muscleGroup: string; name: string }) =>
        e.muscleGroup === "brazos" && e.name.toLowerCase().includes("bíceps")
    ) ||
    exercises
      .filter((e: { muscleGroup: string }) => e.muscleGroup === "brazos")
      .slice(0, 2);

  // Get sets and reps based on goal
  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const muscleGroupName = "Espalda y Bíceps";
  let dayExercises = [
    // Back Exercises - Compound movements first
    {
      exercise: backExercises[0] || null,
      sets: compoundSettings.sets,
      reps: compoundSettings.reps,
      restTime: compoundSettings.restTime,
      notes: `${muscleGroupName} - Espalda principal`,
    },
    {
      exercise: backExercises[1] || backExercises[0] || null,
      sets: compoundSettings.sets - 1,
      reps: compoundSettings.reps + 2,
      restTime: compoundSettings.restTime - 30,
      notes: `${muscleGroupName} - Espalda horizontal`,
    },
    {
      exercise: backExercises[2] || backExercises[0] || null,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Espalda aislamiento`,
    },
    // Biceps Exercises
    {
      exercise: bicepsExercises[0] || null,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Bíceps principal`,
    },
    {
      exercise: bicepsExercises[1] || bicepsExercises[0] || null,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Bíceps aislamiento`,
    },
  ];

  // Apply methodology if specified
  if (methodology !== "standard") {
    dayExercises = applyMethodology(dayExercises, methodology, goal);
  }

  for (const ex of dayExercises) {
    if (ex.exercise) {
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
  }

  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex }))
  );
}

export async function createLegWorkout(
  workoutId: string,
  exercises: any[],
  goal: any,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;

  const legExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "piernas"
  );

  // Get sets and reps based on goal
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  // Asegurarse de que hay al menos un ejercicio
  if (legExercises.length === 0) {
    return [];
  }

  // Obtener ejercicios únicos o usar los disponibles como respaldo
  const exercise1 = legExercises[0];
  const exercise2 = legExercises[1] || exercise1;
  const exercise3 = legExercises[2] || exercise1;
  const exercise4 = legExercises[3] || exercise2;
  const exercise5 = legExercises[4] || exercise3;

  const muscleGroupName = "Piernas";
  let dayExercises = [
    // Movimientos compuestos primero
    {
      exercise: exercise1,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Cuádriceps principal`,
    },
    {
      exercise: exercise2,
      sets: isolationSettings.sets - 1,
      reps: isolationSettings.reps + 2,
      restTime: isolationSettings.restTime - 30,
      notes: `${muscleGroupName} - Isquiotibiales`,
    },
    {
      exercise: exercise3,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Glúteos`,
    },
    {
      exercise: exercise4,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Aislamiento cuádriceps`,
    },
    {
      exercise: exercise5,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Pantorrillas`,
    },
  ];

  // Apply methodology if specified
  if (methodology !== "standard") {
    dayExercises = applyMethodology(dayExercises, methodology, goal);
  }

  for (const ex of dayExercises) {
    if (ex.exercise) {
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
  }

  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex }))
  );
}

export async function createShoulderWorkout(
  workoutId: string,
  exercises: any[],
  goal: any,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;

  const shoulderExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "hombros"
  );

  // Get sets and reps based on goal
  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  // Asegurarse de que hay al menos un ejercicio
  if (shoulderExercises.length === 0) {
    return [];
  }

  // Obtener ejercicios únicos o usar los disponibles como respaldo
  const exercise1 = shoulderExercises[0];
  const exercise2 = shoulderExercises[1] || exercise1;
  const exercise3 = shoulderExercises[2] || exercise1;
  const exercise4 = shoulderExercises[3] || exercise2;

  const muscleGroupName = "Hombros";
  let dayExercises = [
    // Movimientos compuestos primero
    {
      exercise: exercise1,
      sets: compoundSettings.sets,
      reps: compoundSettings.reps,
      restTime: compoundSettings.restTime,
      notes: `${muscleGroupName} - Press principal`,
    },
    {
      exercise: exercise2,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Elevaciones laterales`,
    },
    {
      exercise: exercise3,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Elevaciones frontales`,
    },
    {
      exercise: exercise4,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Deltoides posterior`,
    },
  ];

  // Apply methodology if specified
  if (methodology !== "standard") {
    dayExercises = applyMethodology(dayExercises, methodology, goal);
  }

  for (const ex of dayExercises) {
    if (ex.exercise) {
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
  }

  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex }))
  );
}

export async function createCoreWorkout(
  workoutId: string,
  exercises: any[],
  goal: any,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;

  const coreExercises = exercises.filter(
    (e: { muscleGroup: string }) => e.muscleGroup === "core"
  );

  // Get sets and reps based on goal
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  // Asegurarse de que hay al menos un ejercicio
  if (coreExercises.length === 0) {
    return [];
  }

  // Obtener ejercicios únicos o usar los disponibles como respaldo
  const exercise1 = coreExercises[0];
  const exercise2 = coreExercises[1] || exercise1;
  const exercise3 = coreExercises[2] || exercise1;
  const exercise4 = coreExercises[3] || exercise2;

  const muscleGroupName = "Core";
  let dayExercises = [
    {
      exercise: exercise1,
      sets: isolationSettings.sets,
      reps: 0, // Para planchas, el tiempo en segundos estará en las notas
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Plancha 30-60 segundos`,
    },
    {
      exercise: exercise2,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Abdominales`,
    },
    {
      exercise: exercise3,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Oblicuos`,
    },
    {
      exercise: exercise4,
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Estabilidad`,
    },
  ];

  // Apply methodology if specified
  if (methodology !== "standard") {
    dayExercises = applyMethodology(dayExercises, methodology, goal);
  }

  for (const ex of dayExercises) {
    if (ex.exercise) {
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
  }

  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex }))
  );
}
