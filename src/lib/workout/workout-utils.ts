import { prisma } from "@/lib/database/prisma";
import { exercises } from "@/data/exercises";

// ============================================================================
// TYPES
// ============================================================================

export type Exercise = {
  id: string;
  name: string;
  description?: string | null;
  muscleGroup: string;
  equipment?: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  difficulty?: string;
  createdById?: string | null;
};

export type WorkoutPlan = {
  id: string;
  name: string;
  description: string;
  days: WorkoutDay[];
};

type WorkoutDay = {
  day: string;
  exercises: WorkoutExercise[];
};

type WorkoutExercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number | null;
  notes: string | null;
  exerciseType?: "compound" | "isolation";
};

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type WorkoutGoal =
  | "gain-muscle"
  | "lose-weight"
  | "maintain"
  | "strength"
  | "endurance"
  | "mobility"
  | "fat-loss"
  | "hypertrophy";
export type WorkoutType =
  | "Full Body"
  | "Upper/Lower Split"
  | "Push/Pull/Legs"
  | "Weider";
export type Methodology =
  | "standard"
  | "circuit"
  | "hiit"
  | "drop-sets"
  | "pyramid"
  | "supersets";

type ExercisePlan = {
  exercise: Exercise | null;
  sets: number;
  reps: number;
  restTime: number;
  notes: string;
};

// ============================================================================
// EXERCISE MANAGEMENT
// ============================================================================

export async function getOrCreateExercises(): Promise<Exercise[]> {
  try {
    const existingExercises = await prisma.exercise.findMany();

    const existingNames = new Set(existingExercises.map((e) => e.name));
    const missingExercises = exercises.filter(
      (e) => !existingNames.has(e.name),
    );

    if (missingExercises.length > 0) {
      console.log(`Creating ${missingExercises.length} new exercises...`);
      await prisma.$transaction(
        missingExercises.map((exercise) =>
          prisma.exercise.create({ data: exercise }),
        ),
      );
      return await prisma.exercise.findMany();
    }

    return existingExercises;
  } catch (error) {
    console.error("Error in getOrCreateExercises:", error);
    throw new Error(
      `Failed to get or create exercises: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// ============================================================================
// WORKOUT PLANNING
// ============================================================================

export function getRecommendedWorkoutType(profile: {
  trainingFrequency?: number;
  goal?: WorkoutGoal;
  activityLevel?: string;
  experienceLevel?: ExperienceLevel;
}): WorkoutType {
  const {
    trainingFrequency = 0,
    goal = "",
    activityLevel = "",
    experienceLevel = "",
  } = profile;

  if (
    experienceLevel === "beginner" ||
    trainingFrequency <= 3 ||
    activityLevel === "sedentary" ||
    activityLevel === "light"
  ) {
    return "Full Body";
  }

  if (experienceLevel === "intermediate" || trainingFrequency <= 4) {
    return "Upper/Lower Split";
  }

  if (goal === "gain-muscle" || goal === "hypertrophy") {
    return "Push/Pull/Legs";
  } else if (goal === "strength") {
    return "Upper/Lower Split";
  }

  return "Full Body";
}

// Helper to filter exercises based on location
function filterExercisesByLocation(
  exercises: Exercise[],
  location: string,
): Exercise[] {
  if (location === "gym") return exercises;

  // For home, exclude machines
  return exercises.filter((ex) => {
    const equipment = ex.equipment?.toLowerCase() || "";
    // Exclude machines
    if (equipment === "máquina") return false;
    // Also exclude exercises that clearly require a machine in their name if equipment is generic
    if (ex.name.toLowerCase().includes("polea")) return false;
    if (ex.name.toLowerCase().includes("máquina")) return false;

    return true;
  });
}

export async function createWorkoutPlan(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  gender: string | null,
  trainingFrequency: number,
  workoutType: WorkoutType,
  location: string = "gym",
  methodology: Methodology = "standard",
) {
  if (!workoutId || !exercises?.length) {
    throw new Error("Invalid workout parameters: missing ID or exercises");
  }

  const workoutCreators = {
    "Full Body": createFullBodyWorkout,
    "Upper/Lower Split": createUpperLowerSplit,
    "Push/Pull/Legs": createPushPullLegsSplit,
    Weider: createWeiderSplit,
  };

  const createWorkout =
    workoutCreators[workoutType] ||
    (trainingFrequency <= 3
      ? createFullBodyWorkout
      : trainingFrequency <= 5
        ? createUpperLowerSplit
        : createPushPullLegsSplit);

  return createWorkout(
    workoutId,
    exercises,
    goal,
    gender,
    trainingFrequency,
    location,
    methodology,
  );
}

// ============================================================================
// WORKOUT CREATION HELPERS
// ============================================================================

// Reserved for future use
// function getRepsNumber(reps: string | number): number {
//   if (typeof reps === "number") return reps;
//   const match = String(reps).match(/(\d+)/);
//   return match ? parseInt(match[1], 10) : 10;
// }

function getSetsAndRepsForGoal(
  goal: WorkoutGoal,
  exerciseType: "compound" | "isolation" = "compound",
) {
  const settings = {
    compound: { sets: 3, reps: 8, restTime: 90 },
    isolation: { sets: 3, reps: 10, restTime: 60 },
  };

  const type = exerciseType === "compound" ? "compound" : "isolation";

  switch (goal) {
    case "strength":
      return {
        ...settings[type],
        reps: type === "compound" ? 5 : 8,
        sets: type === "compound" ? 5 : 4,
      };
    case "hypertrophy":
    case "gain-muscle":
      return {
        ...settings[type],
        reps: type === "compound" ? 8 : 12,
        sets: type === "compound" ? 4 : 3,
      };
    case "endurance":
      return {
        ...settings[type],
        reps: 15,
        sets: 3,
        restTime: 45,
      };
    default:
      return settings[type];
  }
}

function applyMethodology(
  exercises: ExercisePlan[],
  methodology: Methodology,
  // goal: WorkoutGoal, // Reserved for future use
): ExercisePlan[] {
  if (methodology === "standard") return exercises;

  return exercises.map((exercise) => {
    const base = { ...exercise };

    switch (methodology) {
      case "circuit":
        return { ...base, restTime: 30 };
      case "hiit":
        return { ...base, restTime: 15, reps: Math.floor(base.reps * 0.7) };
      case "drop-sets":
        return { ...base, sets: base.sets + 1, notes: "Include drop sets" };
      case "pyramid":
        return {
          ...base,
          notes: "Pyramid sets: increase weight, decrease reps",
        };
      case "supersets":
        return { ...base, notes: "Perform as superset" };
      default:
        return base;
    }
  });
}

/**
 * Select unique exercises avoiding repetition
 * @param exercises Available exercises
 * @param count Number of exercises to select
 * @param usedExercises Set of already used exercise IDs
 * @returns Selected unique exercises
 */
function selectUniqueExercises(
  exercises: Exercise[],
  count: number,
  usedExercises: Set<string> = new Set(),
): Exercise[] {
  if (!exercises || exercises.length === 0) {
    // console.warn("No exercises available for selection");
    return [];
  }

  // Filter out exercises that have already been used globally
  const availableExercises = exercises.filter(
    (ex) => !usedExercises.has(ex.id),
  );

  if (availableExercises.length === 0) {
    // Fallback: If all are used, log a warning and return from the original pool (allowing repetition)
    // console.warn("All exercises are already used, allowing repetition.");
    return exercises.slice(0, count);
  }

  const selectedExercises: Exercise[] = [];
  const pool = [...availableExercises]; // Copy to safely splice

  while (selectedExercises.length < count && pool.length > 0) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const exercise = pool.splice(randomIndex, 1)[0];
    if (exercise) {
      selectedExercises.push(exercise);
      // Only mark as used if it was drawn from the unique pool
      usedExercises.add(exercise.id);
    }
  }

  // If after drawing from unique pool we still need more, take from the full pool (repetition allowed)
  const remaining = count - selectedExercises.length;
  if (remaining > 0) {
    const fallbackExercises = exercises.filter(
      (ex) => !selectedExercises.map((s) => s.id).includes(ex.id),
    );
    for (let i = 0; i < remaining; i++) {
      const fallbackIndex = i % fallbackExercises.length; // Cycle through available fallbacks
      const fallbackExercise = fallbackExercises[fallbackIndex];
      if (fallbackExercise) {
        selectedExercises.push(fallbackExercise);
      }
    }
  }

  return selectedExercises;
}

/**
 * Safely get exercise from array with fallback
 * @param exercises Array of exercises
 * @param index Index to get
 * @param fallbackIndex Fallback index if primary fails
 * @returns Exercise or null
 */
function getSafeExercise(
  exercises: Exercise[],
  index: number,
  fallbackIndex: number = 0,
): Exercise | null {
  if (!exercises || exercises.length === 0) return null;
  // Use modulo to cycle if the index is out of bounds
  const safeIndex = index % exercises.length;
  return (
    exercises[safeIndex] ||
    exercises[fallbackIndex % exercises.length] ||
    exercises[0] ||
    null
  );
}

// ============================================================================
// WORKOUT CREATION FUNCTIONS
// ============================================================================

// Helper to organize exercise filtering and centralize the "muscleGroup" usage
function filterExercisesByMuscleGroup(
  exercises: Exercise[],
  muscleGroup: string,
): Exercise[] {
  return exercises.filter(
    (e) => e.muscleGroup?.toLowerCase() === muscleGroup.toLowerCase(),
  );
}

/**
 * Create a full body workout plan
 */
export async function createFullBodyWorkout(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  _gender: string | null,
  trainingFrequency: number,
  location: string,
  methodology: Methodology = "standard",
) {
  const workoutExercises: {
    workoutId: string;
    exerciseId: string;
    sets: number;
    reps: number;
    restTime: number | null;
    order: number;
    notes: string | null;
    weight: null;
  }[] = [];
  let order = 1;
  const usedExercises = new Set<string>();

  // Filter exercises by location first
  const locationExercises = filterExercisesByLocation(exercises, location);

  // Filter exercises by muscle group (assuming a Spanish muscleGroup property)
  const legExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "piernas",
  );
  const chestExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "pecho",
  );
  const backExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "espalda",
  );
  const shoulderExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "hombros",
  );
  const armExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "brazos",
  );
  const coreExercises = filterExercisesByMuscleGroup(locationExercises, "core");

  // Validate we have exercises
  const allExercises = [
    legExercises,
    chestExercises,
    backExercises,
    shoulderExercises,
    armExercises,
    coreExercises,
  ];
  if (allExercises.every((arr) => arr.length === 0)) {
    // If filtering by location removed everything (unlikely but possible), fallback to something
    console.warn(
      "No exercises available for full body workout after location filter",
    );
  }

  const workoutDays = Math.min(trainingFrequency, 3);
  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  for (let day = 1; day <= workoutDays; day++) {
    const muscleGroupName = "Full Body";

    const dayExercises: ExercisePlan[] = [
      {
        exercise:
          selectUniqueExercises(legExercises, 1, usedExercises)[0] || null,
        sets: compoundSettings.sets,
        reps: compoundSettings.reps,
        restTime: compoundSettings.restTime,
        notes: `${muscleGroupName} - Piernas`,
      },
      {
        exercise:
          selectUniqueExercises(chestExercises, 1, usedExercises)[0] || null,
        sets: compoundSettings.sets,
        reps: compoundSettings.reps,
        restTime: compoundSettings.restTime,
        notes: `${muscleGroupName} - Pecho`,
      },
      {
        exercise:
          selectUniqueExercises(backExercises, 1, usedExercises)[0] || null,
        sets: compoundSettings.sets,
        reps: compoundSettings.reps,
        restTime: compoundSettings.restTime,
        notes: `${muscleGroupName} - Espalda`,
      },
      {
        exercise:
          selectUniqueExercises(shoulderExercises, 1, usedExercises)[0] || null,
        sets: isolationSettings.sets,
        reps: isolationSettings.reps,
        restTime: isolationSettings.restTime,
        notes: `${muscleGroupName} - Hombros`,
      },
      {
        exercise:
          selectUniqueExercises(armExercises, 1, usedExercises)[0] || null,
        sets: isolationSettings.sets,
        reps: isolationSettings.reps,
        restTime: isolationSettings.restTime,
        notes: `${muscleGroupName} - Brazos`,
      },
      {
        exercise:
          selectUniqueExercises(coreExercises, 1, usedExercises)[0] || null,
        sets: isolationSettings.sets,
        // Set reps to 0 for plank on Day 1, use notes for time
        reps: day === 1 ? 0 : isolationSettings.reps,
        restTime: isolationSettings.restTime,
        notes:
          day === 1
            ? `${muscleGroupName} - Core (Plancha: 30-45 segundos)`
            : `${muscleGroupName} - Core`,
      },
    ].filter((ex) => ex.exercise !== null) as ExercisePlan[]; // Cast after filtering

    const finalExercises =
      methodology !== "standard"
        ? applyMethodology(dayExercises, methodology)
        : dayExercises;

    for (const ex of finalExercises) {
      if (ex.exercise) {
        workoutExercises.push({
          workoutId,
          exerciseId: ex.exercise.id.toString(),
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

  if (workoutExercises.length === 0 && exercises.length > 0) {
    // throw new Error("No valid exercises were added to the workout plan");
    console.warn("No exercises added, potentially due to strict filtering");
  }

  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex })),
  );
}

/**
 * Create an upper/lower split workout plan
 */
export async function createUpperLowerSplit(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  _gender: string | null,
  trainingFrequency: number,
  location: string,
  methodology: Methodology = "standard",
) {
  const workoutExercises: {
    workoutId: string;
    exerciseId: string;
    sets: number;
    reps: number;
    restTime: number | null;
    order: number;
    notes: string | null;
    weight: null;
  }[] = [];
  let order = 1;

  // Filter exercises by location first
  const locationExercises = filterExercisesByLocation(exercises, location);

  const legExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "piernas",
  );
  const chestExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "pecho",
  );
  const backExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "espalda",
  );
  const shoulderExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "hombros",
  );
  const armExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "brazos",
  );
  const coreExercises = filterExercisesByMuscleGroup(locationExercises, "core");

  const workoutDays = Math.min(trainingFrequency, 6);
  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  for (let day = 1; day <= workoutDays; day++) {
    const isUpperDay = day % 2 === 1;
    const muscleGroupName = isUpperDay ? "Tren Superior" : "Tren Inferior";
    // Cycle index resets every two days (Upper/Lower pair)
    const cycleIndex = Math.floor((day - 1) / 2);

    let dayExercises: ExercisePlan[] = [];

    if (isUpperDay) {
      dayExercises = [
        {
          exercise: getSafeExercise(chestExercises, cycleIndex),
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Pecho`,
        },
        {
          exercise: getSafeExercise(backExercises, cycleIndex),
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Espalda`,
        },
        {
          exercise: getSafeExercise(shoulderExercises, cycleIndex),
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Hombros`,
        },
        {
          exercise: getSafeExercise(armExercises, cycleIndex),
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Bíceps`,
        },
        {
          exercise: getSafeExercise(armExercises, cycleIndex + 2), // Use different arm exercise
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Tríceps`,
        },
      ];
    } else {
      dayExercises = [
        {
          exercise: getSafeExercise(legExercises, cycleIndex),
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Cuádriceps`,
        },
        {
          exercise: getSafeExercise(legExercises, cycleIndex + 3), // Use a different leg exercise
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Isquiotibiales`,
        },
        {
          exercise: getSafeExercise(legExercises, cycleIndex + 6), // Use another leg exercise
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Glúteos`,
        },
        {
          exercise: getSafeExercise(coreExercises, cycleIndex),
          sets: isolationSettings.sets,
          // Plank on the first lower body day (cycleIndex = 0)
          reps: cycleIndex === 0 ? 0 : isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes:
            cycleIndex === 0
              ? `${muscleGroupName} - Core (Plancha: 45 segundos)`
              : `${muscleGroupName} - Core`,
        },
        {
          exercise: getSafeExercise(coreExercises, cycleIndex + 2),
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Oblicuos`,
        },
      ];
    }

    const finalExercises =
      methodology !== "standard"
        ? applyMethodology(
          dayExercises.filter((ex) => ex.exercise !== null) as ExercisePlan[],
          methodology,
        )
        : (dayExercises.filter((ex) => ex.exercise !== null) as ExercisePlan[]);

    for (const ex of finalExercises) {
      if (ex.exercise) {
        workoutExercises.push({
          workoutId,
          exerciseId: ex.exercise.id.toString(),
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

  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex })),
  );
}

/**
 * Create a push/pull/legs split workout plan
 */
export async function createPushPullLegsSplit(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  _gender: string | null,
  trainingFrequency: number,
  location: string,
  methodology: Methodology = "standard",
) {
  const workoutExercises: {
    workoutId: string;
    exerciseId: string;
    sets: number;
    reps: number;
    restTime: number | null;
    order: number;
    notes: string | null;
    weight: null;
  }[] = [];
  let order = 1;
  const usedExercises = new Set<string>();

  // Filter exercises by location first
  const locationExercises = filterExercisesByLocation(exercises, location);

  const legExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "piernas",
  );
  const chestExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "pecho",
  );
  const backExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "espalda",
  );
  const shoulderExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "hombros",
  );
  // Filter for specific triceps/biceps exercises, falling back to general arm if empty
  const tricepsExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "brazos",
  ).filter((e) => e.name.toLowerCase().includes("tríceps"));
  const bicepsExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "brazos",
  ).filter((e) => e.name.toLowerCase().includes("bíceps"));
  const armExercisesFallback = filterExercisesByMuscleGroup(
    locationExercises,
    "brazos",
  );
  const coreExercises = filterExercisesByMuscleGroup(locationExercises, "core");

  const workoutDays = Math.min(trainingFrequency, 6);
  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  for (let day = 1; day <= workoutDays; day++) {
    const dayType = day % 3; // 1 = Push, 2 = Pull, 0/3 = Legs
    let dayExercises: ExercisePlan[] = [];

    // Prioritize specific muscle group filters, fallback to general arm exercises
    const finalTricepsPool =
      tricepsExercises.length > 0 ? tricepsExercises : armExercisesFallback;
    const finalBicepsPool =
      bicepsExercises.length > 0 ? bicepsExercises : armExercisesFallback;

    if (dayType === 1) {
      // Push day
      const selectedChestExercises = selectUniqueExercises(
        chestExercises,
        2,
        usedExercises,
      );
      const selectedShoulderExercises = selectUniqueExercises(
        shoulderExercises,
        1,
        usedExercises,
      );
      const selectedTricepsExercises = selectUniqueExercises(
        finalTricepsPool,
        2,
        usedExercises,
      );

      dayExercises = [
        {
          exercise: selectedChestExercises[0] || null,
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: "Empuje - Pecho principal",
        },
        {
          exercise:
            selectedChestExercises[1] || selectedChestExercises[0] || null,
          sets: compoundSettings.sets - 1,
          reps: compoundSettings.reps + 2,
          restTime: compoundSettings.restTime - 30,
          notes: "Empuje - Pecho secundario",
        },
        {
          exercise: selectedShoulderExercises[0] || null,
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: "Empuje - Hombros",
        },
        {
          exercise: selectedTricepsExercises[0] || null,
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: "Empuje - Tríceps principal",
        },
        {
          exercise:
            selectedTricepsExercises[1] || selectedTricepsExercises[0] || null,
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: "Empuje - Tríceps secundario",
        },
      ];
    } else if (dayType === 2) {
      // Pull day
      const selectedBackExercises = selectUniqueExercises(
        backExercises,
        3,
        usedExercises,
      );
      const selectedBicepsExercises = selectUniqueExercises(
        finalBicepsPool,
        2,
        usedExercises,
      );

      dayExercises = [
        {
          exercise: selectedBackExercises[0] || null,
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: "Tirón - Espalda principal",
        },
        {
          exercise:
            selectedBackExercises[1] || selectedBackExercises[0] || null,
          sets: compoundSettings.sets - 1,
          reps: compoundSettings.reps + 2,
          restTime: compoundSettings.restTime - 30,
          notes: "Tirón - Espalda secundaria",
        },
        {
          exercise:
            selectedBackExercises[2] || selectedBackExercises[0] || null,
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: "Tirón - Espalda aislamiento",
        },
        {
          exercise: selectedBicepsExercises[0] || null,
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: "Tirón - Bíceps principal",
        },
        {
          exercise:
            selectedBicepsExercises[1] || selectedBicepsExercises[0] || null,
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: "Tirón - Bíceps secundario",
        },
      ];
    } else {
      // Legs day (dayType = 0 or 3)
      const selectedLegExercises = selectUniqueExercises(
        legExercises,
        4,
        usedExercises,
      );
      const selectedCoreExercises = selectUniqueExercises(
        coreExercises,
        1,
        usedExercises,
      );

      dayExercises = [
        {
          exercise: selectedLegExercises[0] || null,
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: "Piernas - Cuádriceps principal",
        },
        {
          exercise: selectedLegExercises[1] || selectedLegExercises[0] || null,
          sets: compoundSettings.sets - 1,
          reps: compoundSettings.reps + 2,
          restTime: compoundSettings.restTime - 30,
          notes: "Piernas - Isquiotibiales",
        },
        {
          exercise: selectedLegExercises[2] || selectedLegExercises[0] || null,
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: "Piernas - Glúteos",
        },
        {
          exercise: selectedLegExercises[3] || selectedLegExercises[1] || null,
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: "Piernas - Pantorrillas",
        },
        {
          exercise: selectedCoreExercises[0] || null,
          sets: isolationSettings.sets,
          // Only add a plank if it's the first rotation of PPL (day <= 3)
          reps: day <= 3 ? 0 : isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes:
            day <= 3
              ? "Piernas - Core (Plancha: 45-60 segundos)"
              : "Piernas - Core",
        },
      ];
    }

    const finalExercises =
      methodology !== "standard"
        ? applyMethodology(
          dayExercises.filter((ex) => ex.exercise !== null) as ExercisePlan[],
          methodology,
        )
        : (dayExercises.filter((ex) => ex.exercise !== null) as ExercisePlan[]);

    for (const ex of finalExercises) {
      if (ex.exercise) {
        workoutExercises.push({
          workoutId,
          exerciseId: ex.exercise.id.toString(),
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

  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex })),
  );
}

/**
 * Create a Weider split workout plan (one muscle group per day)
 */
export async function createWeiderSplit(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  _gender: string | null,
  trainingFrequency: number,
  location: string,
  methodology: Methodology = "standard",
) {
  const workoutExercises: {
    workoutId: string;
    exerciseId: string;
    sets: number;
    reps: number;
    restTime: number | null;
    order: number;
    notes: string | null;
    weight: null;
  }[] = [];
  let order = 1;

  // Filter exercises by location
  const locationExercises = filterExercisesByLocation(exercises, location);

  // Filter exercises by muscle group
  const legExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "piernas",
  );
  const chestExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "pecho",
  );
  const backExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "espalda",
  );
  const shoulderExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "hombros",
  );
  const armExercises = filterExercisesByMuscleGroup(
    locationExercises,
    "brazos",
  );
  const coreExercises = filterExercisesByMuscleGroup(locationExercises, "core");

  const muscleGroups = [
    { name: "Pecho", exercises: chestExercises },
    { name: "Espalda", exercises: backExercises },
    { name: "Piernas", exercises: legExercises },
    { name: "Hombros", exercises: shoulderExercises },
    { name: "Brazos", exercises: armExercises },
    { name: "Core", exercises: coreExercises },
  ];

  const workoutDays = Math.min(trainingFrequency, 6);
  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  for (let day = 1; day <= workoutDays; day++) {
    const muscleGroupIndex = (day - 1) % muscleGroups.length;
    const muscleGroup = muscleGroups[muscleGroupIndex];

    if (!muscleGroup || !muscleGroup.exercises.length) {
      console.warn(`No exercises found for day ${day}`);
      continue;
    }

    const { name: muscleGroupName, exercises: muscleGroupExercises } =
      muscleGroup;
    // Cycle index: which set of exercises to use if more than 6 training days (though capped at 6)
    const cycleIndex = Math.floor((day - 1) / muscleGroups.length);

    const targetExercises = muscleGroupName === "Core" ? 4 : 5;
    const numExercises = Math.min(muscleGroupExercises.length, targetExercises);

    const dayExercises: ExercisePlan[] = [];

    for (let i = 0; i < numExercises; i++) {
      // Logic to cycle through all exercises for the muscle group across multiple weeks/cycles
      const exerciseIndex =
        (i + cycleIndex * targetExercises) % muscleGroupExercises.length;
      const exercise = muscleGroupExercises[exerciseIndex];

      if (!exercise) continue;

      const isCompound = i < 2 && muscleGroupName !== "Core"; // Core exercises are mostly isolation/plank
      const settings = isCompound ? compoundSettings : isolationSettings;

      // Special handling for the first core exercise (often a plank/hold)
      const isPlank = muscleGroupName === "Core" && i === 0;

      dayExercises.push({
        exercise,
        sets: settings.sets,
        reps: isPlank ? 0 : settings.reps, // Reps = 0 for plank
        restTime: settings.restTime,
        notes: isPlank
          ? `${muscleGroupName} - Plancha 30-60 segundos`
          : `${muscleGroupName} - ${i === 0
            ? "Principal"
            : i === 1
              ? "Secundario"
              : `Aislamiento ${i - 1}`
          }`,
      });
    }

    if (dayExercises.length === 0) continue;

    const finalExercises =
      methodology !== "standard"
        ? applyMethodology(dayExercises, methodology)
        : dayExercises;

    for (const ex of finalExercises) {
      if (ex.exercise) {
        workoutExercises.push({
          workoutId,
          exerciseId: ex.exercise.id.toString(),
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

  return prisma.$transaction(
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex })),
  );
}

// ============================================================================
// SPECIALIZED WORKOUT FUNCTIONS (Improved)
// ============================================================================

// The specialized functions (Chest/Triceps, Back/Biceps, Leg, Shoulder, Core)
// follow a very similar, predictable structure to the Weider split days but without the daily cycling.
// They are cleaned up for better type safety and robust exercise selection.

export async function createChestTricepsWorkout(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  methodology: Methodology = "standard",
) {
  const workoutExercises: {
    workoutId: string;
    exerciseId: string;
    sets: number;
    reps: number;
    restTime: number | null;
    order: number;
    notes: string | null;
    weight: null;
  }[] = [];
  let order = 1;

  const chestExercises = filterExercisesByMuscleGroup(exercises, "pecho");
  const tricepsExercises = filterExercisesByMuscleGroup(
    exercises,
    "brazos",
  ).filter((e) => e.name.toLowerCase().includes("tríceps"));
  const armExercisesFallback = filterExercisesByMuscleGroup(
    exercises,
    "brazos",
  );
  const finalTricepsPool =
    tricepsExercises.length > 0 ? tricepsExercises : armExercisesFallback;

  if (chestExercises.length === 0) {
    throw new Error("No chest exercises available");
  }

  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const muscleGroupName = "Pecho y Tríceps";
  const dayExercises: ExercisePlan[] = [
    {
      exercise: getSafeExercise(chestExercises, 0),
      sets: compoundSettings.sets,
      reps: compoundSettings.reps,
      restTime: compoundSettings.restTime,
      notes: `${muscleGroupName} - Pecho principal`,
    },
    {
      exercise: getSafeExercise(chestExercises, 1, 0),
      sets: compoundSettings.sets - 1,
      reps: compoundSettings.reps + 2,
      restTime: compoundSettings.restTime - 30,
      notes: `${muscleGroupName} - Pecho inclinado`,
    },
    {
      exercise: getSafeExercise(chestExercises, 2, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Pecho aislamiento`,
    },
    {
      exercise: getSafeExercise(finalTricepsPool, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Tríceps principal`,
    },
    {
      exercise: getSafeExercise(finalTricepsPool, 1, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Tríceps aislamiento`,
    },
  ].filter((ex) => ex.exercise !== null) as ExercisePlan[];

  const finalExercises =
    methodology !== "standard"
      ? applyMethodology(dayExercises, methodology)
      : dayExercises;

  for (const ex of finalExercises) {
    if (ex.exercise) {
      workoutExercises.push({
        workoutId,
        exerciseId: ex.exercise.id.toString(),
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
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex })),
  );
}

export async function createBackBicepsWorkout(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  methodology: Methodology = "standard",
) {
  const workoutExercises: {
    workoutId: string;
    exerciseId: string;
    sets: number;
    reps: number;
    restTime: number | null;
    order: number;
    notes: string | null;
    weight: null;
  }[] = [];
  let order = 1;

  const backExercises = filterExercisesByMuscleGroup(exercises, "espalda");
  const bicepsExercises = filterExercisesByMuscleGroup(
    exercises,
    "brazos",
  ).filter((e) => e.name.toLowerCase().includes("bíceps"));
  const armExercisesFallback = filterExercisesByMuscleGroup(
    exercises,
    "brazos",
  );
  const finalBicepsPool =
    bicepsExercises.length > 0 ? bicepsExercises : armExercisesFallback;

  if (backExercises.length === 0) {
    throw new Error("No back exercises available");
  }

  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const muscleGroupName = "Espalda y Bíceps";
  const dayExercises: ExercisePlan[] = [
    {
      exercise: getSafeExercise(backExercises, 0),
      sets: compoundSettings.sets,
      reps: compoundSettings.reps,
      restTime: compoundSettings.restTime,
      notes: `${muscleGroupName} - Espalda principal`,
    },
    {
      exercise: getSafeExercise(backExercises, 1, 0),
      sets: compoundSettings.sets - 1,
      reps: compoundSettings.reps + 2,
      restTime: compoundSettings.restTime - 30,
      notes: `${muscleGroupName} - Espalda horizontal`,
    },
    {
      exercise: getSafeExercise(backExercises, 2, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Espalda aislamiento`,
    },
    {
      exercise: getSafeExercise(finalBicepsPool, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Bíceps principal`,
    },
    {
      exercise: getSafeExercise(finalBicepsPool, 1, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Bíceps aislamiento`,
    },
  ].filter((ex) => ex.exercise !== null) as ExercisePlan[];

  const finalExercises =
    methodology !== "standard"
      ? applyMethodology(dayExercises, methodology)
      : dayExercises;

  for (const ex of finalExercises) {
    if (ex.exercise) {
      workoutExercises.push({
        workoutId,
        exerciseId: ex.exercise.id.toString(),
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
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex })),
  );
}

export async function createLegWorkout(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  methodology: Methodology = "standard",
) {
  const workoutExercises: {
    workoutId: string;
    exerciseId: string;
    sets: number;
    reps: number;
    restTime: number | null;
    order: number;
    notes: string | null;
    weight: null;
  }[] = [];
  let order = 1;

  const legExercises = filterExercisesByMuscleGroup(exercises, "piernas");

  if (legExercises.length === 0) {
    throw new Error("No leg exercises available");
  }

  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const muscleGroupName = "Piernas";
  const dayExercises: ExercisePlan[] = [
    {
      exercise: getSafeExercise(legExercises, 0),
      sets: compoundSettings.sets,
      reps: compoundSettings.reps,
      restTime: compoundSettings.restTime,
      notes: `${muscleGroupName} - Cuádriceps principal`,
    },
    {
      exercise: getSafeExercise(legExercises, 1, 0),
      sets: compoundSettings.sets - 1,
      reps: compoundSettings.reps + 2,
      restTime: compoundSettings.restTime - 30,
      notes: `${muscleGroupName} - Isquiotibiales`,
    },
    {
      exercise: getSafeExercise(legExercises, 2, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Glúteos`,
    },
    {
      exercise: getSafeExercise(legExercises, 3, 1),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Aislamiento cuádriceps`,
    },
    {
      exercise: getSafeExercise(legExercises, 4, 2),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Pantorrillas`,
    },
  ].filter((ex) => ex.exercise !== null) as ExercisePlan[];

  const finalExercises =
    methodology !== "standard"
      ? applyMethodology(dayExercises, methodology)
      : dayExercises;

  for (const ex of finalExercises) {
    if (ex.exercise) {
      workoutExercises.push({
        workoutId,
        exerciseId: ex.exercise.id.toString(),
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
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex })),
  );
}

export async function createShoulderWorkout(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  methodology: Methodology = "standard",
) {
  const workoutExercises: {
    workoutId: string;
    exerciseId: string;
    sets: number;
    reps: number;
    restTime: number | null;
    order: number;
    notes: string | null;
    weight: null;
  }[] = [];
  let order = 1;

  const shoulderExercises = filterExercisesByMuscleGroup(exercises, "hombros");

  if (shoulderExercises.length === 0) {
    throw new Error("No shoulder exercises available");
  }

  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const muscleGroupName = "Hombros";
  const dayExercises: ExercisePlan[] = [
    {
      exercise: getSafeExercise(shoulderExercises, 0),
      sets: compoundSettings.sets,
      reps: compoundSettings.reps,
      restTime: compoundSettings.restTime,
      notes: `${muscleGroupName} - Press principal`,
    },
    {
      exercise: getSafeExercise(shoulderExercises, 1, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Elevaciones laterales`,
    },
    {
      exercise: getSafeExercise(shoulderExercises, 2, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Elevaciones frontales`,
    },
    {
      exercise: getSafeExercise(shoulderExercises, 3, 1),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Deltoides posterior`,
    },
  ].filter((ex) => ex.exercise !== null) as ExercisePlan[];

  const finalExercises =
    methodology !== "standard"
      ? applyMethodology(dayExercises, methodology)
      : dayExercises;

  for (const ex of finalExercises) {
    if (ex.exercise) {
      workoutExercises.push({
        workoutId,
        exerciseId: ex.exercise.id.toString(),
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
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex })),
  );
}

export async function createCoreWorkout(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  methodology: Methodology = "standard",
) {
  const workoutExercises: {
    workoutId: string;
    exerciseId: string;
    sets: number;
    reps: number;
    restTime: number | null;
    order: number;
    notes: string | null;
    weight: null;
  }[] = [];
  let order = 1;

  const coreExercises = filterExercisesByMuscleGroup(exercises, "core");

  if (coreExercises.length === 0) {
    throw new Error("No core exercises available");
  }

  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const muscleGroupName = "Core";
  const dayExercises: ExercisePlan[] = [
    {
      exercise: getSafeExercise(coreExercises, 0),
      sets: isolationSettings.sets,
      reps: 0, // Reps = 0 for plank/holds
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Plancha 30-60 segundos`,
    },
    {
      exercise: getSafeExercise(coreExercises, 1, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Abdominales`,
    },
    {
      exercise: getSafeExercise(coreExercises, 2, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Oblicuos`,
    },
    {
      exercise: getSafeExercise(coreExercises, 3, 1),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: `${muscleGroupName} - Estabilidad`,
    },
  ].filter((ex) => ex.exercise !== null) as ExercisePlan[];

  const finalExercises =
    methodology !== "standard"
      ? applyMethodology(dayExercises, methodology)
      : dayExercises;

  for (const ex of finalExercises) {
    if (ex.exercise) {
      workoutExercises.push({
        workoutId,
        exerciseId: ex.exercise.id.toString(),
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
    workoutExercises.map((ex) => prisma.workoutExercise.create({ data: ex })),
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculates the user's experience level based on their training history
 * @param profile User profile containing training information
 * @returns Experience level (beginner, intermediate, or advanced)
 */
export function calculateExperienceLevel(profile: {
  trainingFrequency?: number | null;
  monthsTraining?: number | null;
}): ExperienceLevel {
  const frequency = profile.trainingFrequency ?? 0;
  const months = profile.monthsTraining ?? 0;

  if (frequency <= 2 || months < 6) return "beginner";
  if (frequency <= 4 || months < 18) return "intermediate";
  return "advanced";
}
