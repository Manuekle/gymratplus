import { prisma } from "@/lib/database/prisma";
import { exercises } from "@/data/exercises";

// ============================================================================
// TYPES
// ============================================================================

export type Exercise = {
  id: string;
  name: string;
  category: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  equipment?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string[];
  force?: string;
  mechanics?: string;
  muscleGroup?: string;
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
  exerciseType?: 'compound' | 'isolation';
};

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutGoal = 'gain-muscle' | 'lose-weight' | 'maintain' | 'strength' | 'endurance' | 'mobility' | 'fat-loss' | 'hypertrophy';
export type WorkoutType = 'Full Body' | 'Upper/Lower Split' | 'Push/Pull/Legs' | 'Weider';
export type Methodology = 'standard' | 'circuit' | 'hiit' | 'drop-sets' | 'pyramid' | 'supersets';

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
    const existingExercises = await prisma.exercise.findMany() as Exercise[];
    if (existingExercises.length > 0) {
      return existingExercises;
    }

    const createdExercises = await prisma.$transaction(
      exercises.map(exercise => 
        prisma.exercise.create({ data: exercise })
      )
    ) as Exercise[];

    console.log(`Created ${createdExercises.length} exercises`);
    return createdExercises;
  } catch (error) {
    console.error('Error in getOrCreateExercises:', error);
    throw new Error(`Failed to get or create exercises: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  const { trainingFrequency = 0, goal = '', activityLevel = '', experienceLevel = '' } = profile;

  if (experienceLevel === "beginner" || trainingFrequency <= 3 || 
      activityLevel === "sedentary" || activityLevel === "light") {
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

export async function createWorkoutPlan(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  gender: string | null,
  trainingFrequency: number,
  workoutType: WorkoutType,
  _workoutHistory: any[] = [],
  methodology: Methodology = "standard",
) {
  if (!workoutId || !exercises?.length) {
    throw new Error("Invalid workout parameters: missing ID or exercises");
  }

  const workoutCreators = {
    "Full Body": createFullBodyWorkout,
    "Upper/Lower Split": createUpperLowerSplit,
    "Push/Pull/Legs": createPushPullLegsSplit,
    "Weider": createWeiderSplit,
  };

  const createWorkout = workoutCreators[workoutType] || 
    (trainingFrequency <= 3 ? createFullBodyWorkout : 
     trainingFrequency <= 5 ? createUpperLowerSplit : createPushPullLegsSplit);

  return createWorkout(workoutId, exercises, goal, gender, trainingFrequency, methodology);
}

// ============================================================================
// WORKOUT CREATION HELPERS
// ============================================================================

function getRepsNumber(reps: string | number): number {
  if (typeof reps === 'number') return reps;
  const match = String(reps).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 10;
}

function getSetsAndRepsForGoal(
  goal: WorkoutGoal, 
  exerciseType: 'compound' | 'isolation' = "compound"
) {
  const settings = {
    compound: { sets: 3, reps: 8, restTime: 90 },
    isolation: { sets: 3, reps: 10, restTime: 60 }
  };

  const type = exerciseType === 'compound' ? 'compound' : 'isolation';
  
  switch (goal) {
    case 'strength':
      return { 
        ...settings[type], 
        reps: type === 'compound' ? 5 : 8,
        sets: type === 'compound' ? 5 : 4 
      };
    case 'hypertrophy':
    case 'gain-muscle':
      return { 
        ...settings[type], 
        reps: type === 'compound' ? 8 : 12,
        sets: type === 'compound' ? 4 : 3 
      };
    case 'endurance':
      return { 
        ...settings[type], 
        reps: 15,
        sets: 3,
        restTime: 45 
      };
    default:
      return settings[type];
  }
}

function applyMethodology(
  exercises: ExercisePlan[], 
  methodology: Methodology, 
  goal: WorkoutGoal
): ExercisePlan[] {
  if (methodology === 'standard') return exercises;

  return exercises.map(exercise => {
    const base = { ...exercise };
    
    switch (methodology) {
      case 'circuit':
        return { ...base, restTime: 30 };
      case 'hiit':
        return { ...base, restTime: 15, reps: Math.floor(base.reps * 0.7) };
      case 'drop-sets':
        return { ...base, sets: base.sets + 1, notes: 'Include drop sets' };
      case 'pyramid':
        return { ...base, notes: 'Pyramid sets: increase weight, decrease reps' };
      case 'supersets':
        return { ...base, notes: 'Perform as superset' };
      default:
        return base;
    }
  });
}

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
    console.warn("No exercises available for selection");
    return [];
  }

  // Filter out exercises that have already been used globally
  const availableExercises = exercises.filter((ex) => !usedExercises.has(ex.id));
  
  if (availableExercises.length === 0) {
    // Fallback: If all are used, log a warning and return from the original pool (allowing repetition)
    console.warn("All exercises are already used, allowing repetition.");
    return exercises.slice(0, count);
  }

  const selectedExercises: Exercise[] = [];
  const pool = [...availableExercises]; // Copy to safely splice

  while (selectedExercises.length < count && pool.length > 0) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const exercise = pool.splice(randomIndex, 1)[0];
    selectedExercises.push(exercise);
    // Only mark as used if it was drawn from the unique pool
    usedExercises.add(exercise.id);
  }

  // If after drawing from unique pool we still need more, take from the full pool (repetition allowed)
  let remaining = count - selectedExercises.length;
  if (remaining > 0) {
      const fallbackExercises = exercises.filter(ex => !selectedExercises.map(s => s.id).includes(ex.id));
      for(let i = 0; i < remaining; i++) {
          const fallbackIndex = i % fallbackExercises.length; // Cycle through available fallbacks
          selectedExercises.push(fallbackExercises[fallbackIndex]);
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
function getSafeExercise(exercises: Exercise[], index: number, fallbackIndex: number = 0): Exercise | null {
  if (!exercises || exercises.length === 0) return null;
  // Use modulo to cycle if the index is out of bounds
  const safeIndex = index % exercises.length; 
  return exercises[safeIndex] || exercises[fallbackIndex % exercises.length] || exercises[0] || null;
}

// ============================================================================
// WORKOUT CREATION FUNCTIONS
// ============================================================================

// Helper to organize exercise filtering and centralize the "muscleGroup" usage
function filterExercisesByMuscleGroup(exercises: Exercise[], muscleGroup: string): Exercise[] {
  return exercises.filter((e) => e.muscleGroup?.toLowerCase() === muscleGroup.toLowerCase());
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

  // Filter exercises by muscle group (assuming a Spanish muscleGroup property)
  const legExercises = filterExercisesByMuscleGroup(exercises, "piernas");
  const chestExercises = filterExercisesByMuscleGroup(exercises, "pecho");
  const backExercises = filterExercisesByMuscleGroup(exercises, "espalda");
  const shoulderExercises = filterExercisesByMuscleGroup(exercises, "hombros");
  const armExercises = filterExercisesByMuscleGroup(exercises, "brazos");
  const coreExercises = filterExercisesByMuscleGroup(exercises, "core");

  // Validate we have exercises
  const allExercises = [legExercises, chestExercises, backExercises, shoulderExercises, armExercises, coreExercises];
  if (allExercises.every(arr => arr.length === 0)) {
    throw new Error("No exercises available for full body workout");
  }

  const workoutDays = Math.min(trainingFrequency, 3);
  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  for (let day = 1; day <= workoutDays; day++) {
    const muscleGroupName = "Full Body";

    const dayExercises: ExercisePlan[] = [
      {
        exercise: selectUniqueExercises(legExercises, 1, usedExercises)[0] || null,
        sets: compoundSettings.sets,
        reps: compoundSettings.reps,
        restTime: compoundSettings.restTime,
        notes: `${muscleGroupName} - Piernas`,
      },
      {
        exercise: selectUniqueExercises(chestExercises, 1, usedExercises)[0] || null,
        sets: compoundSettings.sets,
        reps: compoundSettings.reps,
        restTime: compoundSettings.restTime,
        notes: `${muscleGroupName} - Pecho`,
      },
      {
        exercise: selectUniqueExercises(backExercises, 1, usedExercises)[0] || null,
        sets: compoundSettings.sets,
        reps: compoundSettings.reps,
        restTime: compoundSettings.restTime,
        notes: `${muscleGroupName} - Espalda`,
      },
      {
        exercise: selectUniqueExercises(shoulderExercises, 1, usedExercises)[0] || null,
        sets: isolationSettings.sets,
        reps: isolationSettings.reps,
        restTime: isolationSettings.restTime,
        notes: `${muscleGroupName} - Hombros`,
      },
      {
        exercise: selectUniqueExercises(armExercises, 1, usedExercises)[0] || null,
        sets: isolationSettings.sets,
        reps: isolationSettings.reps,
        restTime: isolationSettings.restTime,
        notes: `${muscleGroupName} - Brazos`,
      },
      {
        exercise: selectUniqueExercises(coreExercises, 1, usedExercises)[0] || null,
        sets: isolationSettings.sets,
        // Set reps to 0 for plank on Day 1, use notes for time
        reps: day === 1 ? 0 : isolationSettings.reps, 
        restTime: isolationSettings.restTime,
        notes: day === 1 ? `${muscleGroupName} - Core (Plancha: 30-45 segundos)` : `${muscleGroupName} - Core`,
      },
    ].filter(ex => ex.exercise !== null) as ExercisePlan[]; // Cast after filtering

    const finalExercises = methodology !== "standard" 
      ? applyMethodology(dayExercises, goal, methodology) 
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

  if (workoutExercises.length === 0) {
    throw new Error("No valid exercises were added to the workout plan");
  }

  return prisma.$transaction(
    workoutExercises.map((ex) =>
      prisma.workoutExercise.create({ data: ex }),
    ),
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
  methodology: Methodology = "standard",
) {
  const workoutExercises: any[] = [];
  let order = 1;

  const legExercises = filterExercisesByMuscleGroup(exercises, "piernas");
  const chestExercises = filterExercisesByMuscleGroup(exercises, "pecho");
  const backExercises = filterExercisesByMuscleGroup(exercises, "espalda");
  const shoulderExercises = filterExercisesByMuscleGroup(exercises, "hombros");
  const armExercises = filterExercisesByMuscleGroup(exercises, "brazos");
  const coreExercises = filterExercisesByMuscleGroup(exercises, "core");

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
          notes: cycleIndex === 0 ? `${muscleGroupName} - Core (Plancha: 45 segundos)` : `${muscleGroupName} - Core`,
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

    const finalExercises = methodology !== "standard" 
      ? applyMethodology(dayExercises.filter(ex => ex.exercise !== null) as ExercisePlan[], goal, methodology) 
      : dayExercises.filter(ex => ex.exercise !== null) as ExercisePlan[];

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
  methodology: Methodology = "standard",
) {
  const workoutExercises: any[] = [];
  let order = 1;
  const usedExercises = new Set<string>();

  const legExercises = filterExercisesByMuscleGroup(exercises, "piernas");
  const chestExercises = filterExercisesByMuscleGroup(exercises, "pecho");
  const backExercises = filterExercisesByMuscleGroup(exercises, "espalda");
  const shoulderExercises = filterExercisesByMuscleGroup(exercises, "hombros");
  // Filter for specific triceps/biceps exercises, falling back to general arm if empty
  const tricepsExercises = filterExercisesByMuscleGroup(exercises, "brazos").filter((e) => e.name.toLowerCase().includes("tríceps"));
  const bicepsExercises = filterExercisesByMuscleGroup(exercises, "brazos").filter((e) => e.name.toLowerCase().includes("bíceps"));
  const armExercisesFallback = filterExercisesByMuscleGroup(exercises, "brazos");
  const coreExercises = filterExercisesByMuscleGroup(exercises, "core");

  const workoutDays = Math.min(trainingFrequency, 6);
  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  for (let day = 1; day <= workoutDays; day++) {
    const dayType = day % 3; // 1 = Push, 2 = Pull, 0/3 = Legs
    let dayExercises: ExercisePlan[] = [];

    // Prioritize specific muscle group filters, fallback to general arm exercises
    const finalTricepsPool = tricepsExercises.length > 0 ? tricepsExercises : armExercisesFallback;
    const finalBicepsPool = bicepsExercises.length > 0 ? bicepsExercises : armExercisesFallback;


    if (dayType === 1) { // Push day
      const selectedChestExercises = selectUniqueExercises(chestExercises, 2, usedExercises);
      const selectedShoulderExercises = selectUniqueExercises(shoulderExercises, 1, usedExercises);
      const selectedTricepsExercises = selectUniqueExercises(finalTricepsPool, 2, usedExercises);

      dayExercises = [
        {
          exercise: selectedChestExercises[0] || null,
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: "Empuje - Pecho principal",
        },
        {
          exercise: selectedChestExercises[1] || selectedChestExercises[0] || null,
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
          exercise: selectedTricepsExercises[1] || selectedTricepsExercises[0] || null,
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: "Empuje - Tríceps secundario",
        },
      ];
    } else if (dayType === 2) { // Pull day
      const selectedBackExercises = selectUniqueExercises(backExercises, 3, usedExercises);
      const selectedBicepsExercises = selectUniqueExercises(finalBicepsPool, 2, usedExercises);

      dayExercises = [
        {
          exercise: selectedBackExercises[0] || null,
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: "Tirón - Espalda principal",
        },
        {
          exercise: selectedBackExercises[1] || selectedBackExercises[0] || null,
          sets: compoundSettings.sets - 1,
          reps: compoundSettings.reps + 2,
          restTime: compoundSettings.restTime - 30,
          notes: "Tirón - Espalda secundaria",
        },
        {
          exercise: selectedBackExercises[2] || selectedBackExercises[0] || null,
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
          exercise: selectedBicepsExercises[1] || selectedBicepsExercises[0] || null,
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: "Tirón - Bíceps secundario",
        },
      ];
    } else { // Legs day (dayType = 0 or 3)
      const selectedLegExercises = selectUniqueExercises(legExercises, 4, usedExercises);
      const selectedCoreExercises = selectUniqueExercises(coreExercises, 1, usedExercises);

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
          notes: day <= 3 ? "Piernas - Core (Plancha: 45-60 segundos)" : "Piernas - Core",
        },
      ];
    }

    const finalExercises = methodology !== "standard" 
      ? applyMethodology(dayExercises.filter(ex => ex.exercise !== null) as ExercisePlan[], goal, methodology) 
      : dayExercises.filter(ex => ex.exercise !== null) as ExercisePlan[];

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
  methodology: Methodology = "standard",
) {
  const workoutExercises: any[] = [];
  let order = 1;

  // Filter exercises by muscle group
  const legExercises = filterExercisesByMuscleGroup(exercises, "piernas");
  const chestExercises = filterExercisesByMuscleGroup(exercises, "pecho");
  const backExercises = filterExercisesByMuscleGroup(exercises, "espalda");
  const shoulderExercises = filterExercisesByMuscleGroup(exercises, "hombros");
  const armExercises = filterExercisesByMuscleGroup(exercises, "brazos");
  const coreExercises = filterExercisesByMuscleGroup(exercises, "core");

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

    const { name: muscleGroupName, exercises: muscleGroupExercises } = muscleGroup;
    // Cycle index: which set of exercises to use if more than 6 training days (though capped at 6)
    const cycleIndex = Math.floor((day - 1) / muscleGroups.length); 

    const targetExercises = muscleGroupName === "Core" ? 4 : 5;
    const numExercises = Math.min(muscleGroupExercises.length, targetExercises);

    const dayExercises: ExercisePlan[] = [];

    for (let i = 0; i < numExercises; i++) {
      // Logic to cycle through all exercises for the muscle group across multiple weeks/cycles
      const exerciseIndex = (i + cycleIndex * targetExercises) % muscleGroupExercises.length;
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
            : `${muscleGroupName} - ${
                i === 0 ? "Principal" : i === 1 ? "Secundario" : `Aislamiento ${i - 1}`
              }`,
      });
    }

    if (dayExercises.length === 0) continue;

    const finalExercises = methodology !== "standard" 
      ? applyMethodology(dayExercises, goal, methodology) 
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
  const workoutExercises: any[] = [];
  let order = 1;

  const chestExercises = filterExercisesByMuscleGroup(exercises, "pecho");
  const tricepsExercises = filterExercisesByMuscleGroup(exercises, "brazos").filter((e) => e.name.toLowerCase().includes("tríceps"));
  const armExercisesFallback = filterExercisesByMuscleGroup(exercises, "brazos");
  const finalTricepsPool = tricepsExercises.length > 0 ? tricepsExercises : armExercisesFallback;


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
  ].filter(ex => ex.exercise !== null) as ExercisePlan[];

  const finalExercises = methodology !== "standard" 
    ? applyMethodology(dayExercises, goal, methodology) 
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
  const workoutExercises: any[] = [];
  let order = 1;

  const backExercises = filterExercisesByMuscleGroup(exercises, "espalda");
  const bicepsExercises = filterExercisesByMuscleGroup(exercises, "brazos").filter((e) => e.name.toLowerCase().includes("bíceps"));
  const armExercisesFallback = filterExercisesByMuscleGroup(exercises, "brazos");
  const finalBicepsPool = bicepsExercises.length > 0 ? bicepsExercises : armExercisesFallback;


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
  ].filter(ex => ex.exercise !== null) as ExercisePlan[];

  const finalExercises = methodology !== "standard" 
    ? applyMethodology(dayExercises, goal, methodology) 
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
  const workoutExercises: any[] = [];
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
  ].filter(ex => ex.exercise !== null) as ExercisePlan[];

  const finalExercises = methodology !== "standard" 
    ? applyMethodology(dayExercises, goal, methodology) 
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
  const workoutExercises: any[] = [];
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
  ].filter(ex => ex.exercise !== null) as ExercisePlan[];

  const finalExercises = methodology !== "standard" 
    ? applyMethodology(dayExercises, goal, methodology) 
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
  const workoutExercises: any[] = [];
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
  ].filter(ex => ex.exercise !== null) as ExercisePlan[];

  const finalExercises = methodology !== "standard" 
    ? applyMethodology(dayExercises, goal, methodology) 
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
}es[0] || null,
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
          reps: day <= 3 ? 0 : isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: day <= 3 ? "Piernas - Core (Plancha: 45-60 segundos)" : "Piernas - Core",
        },
      ];
    }

    const finalExercises = methodology !== "standard" 
      ? applyMethodology(dayExercises.filter(ex => ex.exercise !== null), methodology, goal) 
      : dayExercises.filter(ex => ex.exercise !== null);

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
  methodology: Methodology = "standard",
) {
  const workoutExercises = [];
  let order = 1;

  const legExercises = exercises.filter((e) => e.muscleGroup === "piernas");
  const chestExercises = exercises.filter((e) => e.muscleGroup === "pecho");
  const backExercises = exercises.filter((e) => e.muscleGroup === "espalda");
  const shoulderExercises = exercises.filter((e) => e.muscleGroup === "hombros");
  const armExercises = exercises.filter((e) => e.muscleGroup === "brazos");
  const coreExercises = exercises.filter((e) => e.muscleGroup === "core");

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

    const { name: muscleGroupName, exercises: muscleGroupExercises } = muscleGroup;
    const cycleIndex = Math.floor((day - 1) / muscleGroups.length);

    const targetExercises = muscleGroupName === "Core" ? 4 : 5;
    const numExercises = Math.min(muscleGroupExercises.length, targetExercises);

    const dayExercises: Array<{
      exercise: Exercise | null;
      sets: number;
      reps: number;
      restTime: number;
      notes: string;
    }> = [];

    for (let i = 0; i < numExercises; i++) {
      const exerciseIndex = (i + cycleIndex * targetExercises) % muscleGroupExercises.length;
      const exercise = muscleGroupExercises[exerciseIndex];

      if (!exercise) continue;

      const isCompound = i < 2;
      const settings = isCompound ? compoundSettings : isolationSettings;

      dayExercises.push({
        exercise,
        sets: settings.sets || 3,
        reps: settings.reps || (isCompound ? 8 : 12),
        restTime: settings.restTime || (isCompound ? 90 : 60),
        notes: `${muscleGroupName} - ${
          i === 0 ? "Principal" : i === 1 ? "Secundario" : `Aislamiento ${i - 1}`
        }`,
      });
    }

    if (dayExercises.length === 0) continue;

    const finalExercises = methodology !== "standard" 
      ? applyMethodology(dayExercises, methodology, goal) 
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
// SPECIALIZED WORKOUT FUNCTIONS
// ============================================================================

/**
 * Create a chest and triceps workout
 */
export async function createChestTricepsWorkout(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  methodology: Methodology = "standard",
) {
  const workoutExercises = [];
  let order = 1;

  const chestExercises = exercises.filter((e) => e.muscleGroup === "pecho");
  const tricepsExercises = exercises.filter(
    (e) => e.muscleGroup === "brazos" && e.name.toLowerCase().includes("tríceps")
  );

  if (chestExercises.length === 0) {
    throw new Error("No chest exercises available");
  }

  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const dayExercises = [
    {
      exercise: getSafeExercise(chestExercises, 0),
      sets: compoundSettings.sets,
      reps: compoundSettings.reps,
      restTime: compoundSettings.restTime,
      notes: "Pecho y Tríceps - Pecho principal",
    },
    {
      exercise: getSafeExercise(chestExercises, 1, 0),
      sets: compoundSettings.sets - 1,
      reps: compoundSettings.reps + 2,
      restTime: compoundSettings.restTime - 30,
      notes: "Pecho y Tríceps - Pecho inclinado",
    },
    {
      exercise: getSafeExercise(chestExercises, 2, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Pecho y Tríceps - Pecho aislamiento",
    },
    {
      exercise: getSafeExercise(tricepsExercises, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Pecho y Tríceps - Tríceps principal",
    },
    {
      exercise: getSafeExercise(tricepsExercises, 1, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Pecho y Tríceps - Tríceps aislamiento",
    },
  ].filter(ex => ex.exercise !== null);

  const finalExercises = methodology !== "standard" 
    ? applyMethodology(dayExercises, methodology, goal) 
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

/**
 * Create a back and biceps workout
 */
export async function createBackBicepsWorkout(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  methodology: Methodology = "standard",
) {
  const workoutExercises = [];
  let order = 1;

  const backExercises = exercises.filter((e) => e.muscleGroup === "espalda");
  const bicepsExercises = exercises.filter(
    (e) => e.muscleGroup === "brazos" && e.name.toLowerCase().includes("bíceps")
  );

  if (backExercises.length === 0) {
    throw new Error("No back exercises available");
  }

  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const dayExercises = [
    {
      exercise: getSafeExercise(backExercises, 0),
      sets: compoundSettings.sets,
      reps: compoundSettings.reps,
      restTime: compoundSettings.restTime,
      notes: "Espalda y Bíceps - Espalda principal",
    },
    {
      exercise: getSafeExercise(backExercises, 1, 0),
      sets: compoundSettings.sets - 1,
      reps: compoundSettings.reps + 2,
      restTime: compoundSettings.restTime - 30,
      notes: "Espalda y Bíceps - Espalda horizontal",
    },
    {
      exercise: getSafeExercise(backExercises, 2, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Espalda y Bíceps - Espalda aislamiento",
    },
    {
      exercise: getSafeExercise(bicepsExercises, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Espalda y Bíceps - Bíceps principal",
    },
    {
      exercise: getSafeExercise(bicepsExercises, 1, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Espalda y Bíceps - Bíceps aislamiento",
    },
  ].filter(ex => ex.exercise !== null);

  const finalExercises = methodology !== "standard" 
    ? applyMethodology(dayExercises, methodology, goal) 
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

/**
 * Create a leg workout
 */
export async function createLegWorkout(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  methodology: Methodology = "standard",
) {
  const workoutExercises = [];
  let order = 1;

  const legExercises = exercises.filter((e) => e.muscleGroup === "piernas");

  if (legExercises.length === 0) {
    throw new Error("No leg exercises available");
  }

  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const dayExercises = [
    {
      exercise: getSafeExercise(legExercises, 0),
      sets: compoundSettings.sets,
      reps: compoundSettings.reps,
      restTime: compoundSettings.restTime,
      notes: "Piernas - Cuádriceps principal",
    },
    {
      exercise: getSafeExercise(legExercises, 1, 0),
      sets: compoundSettings.sets - 1,
      reps: compoundSettings.reps + 2,
      restTime: compoundSettings.restTime - 30,
      notes: "Piernas - Isquiotibiales",
    },
    {
      exercise: getSafeExercise(legExercises, 2, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Piernas - Glúteos",
    },
    {
      exercise: getSafeExercise(legExercises, 3, 1),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Piernas - Aislamiento cuádriceps",
    },
    {
      exercise: getSafeExercise(legExercises, 4, 2),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Piernas - Pantorrillas",
    },
  ].filter(ex => ex.exercise !== null);

  const finalExercises = methodology !== "standard" 
    ? applyMethodology(dayExercises, methodology, goal) 
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

/**
 * Create a shoulder workout
 */
export async function createShoulderWorkout(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  methodology: Methodology = "standard",
) {
  const workoutExercises = [];
  let order = 1;

  const shoulderExercises = exercises.filter((e) => e.muscleGroup === "hombros");

  if (shoulderExercises.length === 0) {
    throw new Error("No shoulder exercises available");
  }

  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const dayExercises = [
    {
      exercise: getSafeExercise(shoulderExercises, 0),
      sets: compoundSettings.sets,
      reps: compoundSettings.reps,
      restTime: compoundSettings.restTime,
      notes: "Hombros - Press principal",
    },
    {
      exercise: getSafeExercise(shoulderExercises, 1, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Hombros - Elevaciones laterales",
    },
    {
      exercise: getSafeExercise(shoulderExercises, 2, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Hombros - Elevaciones frontales",
    },
    {
      exercise: getSafeExercise(shoulderExercises, 3, 1),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Hombros - Deltoides posterior",
    },
  ].filter(ex => ex.exercise !== null);

  const finalExercises = methodology !== "standard" 
    ? applyMethodology(dayExercises, methodology, goal) 
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

/**
 * Create a core workout
 */
export async function createCoreWorkout(
  workoutId: string,
  exercises: Exercise[],
  goal: WorkoutGoal,
  methodology: Methodology = "standard",
) {
  const workoutExercises = [];
  let order = 1;

  const coreExercises = exercises.filter((e) => e.muscleGroup === "core");

  if (coreExercises.length === 0) {
    throw new Error("No core exercises available");
  }

  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const dayExercises = [
    {
      exercise: getSafeExercise(coreExercises, 0),
      sets: isolationSettings.sets,
      reps: 0,
      restTime: isolationSettings.restTime,
      notes: "Core - Plancha 30-60 segundos",
    },
    {
      exercise: getSafeExercise(coreExercises, 1, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Core - Abdominales",
    },
    {
      exercise: getSafeExercise(coreExercises, 2, 0),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Core - Oblicuos",
    },
    {
      exercise: getSafeExercise(coreExercises, 3, 1),
      sets: isolationSettings.sets,
      reps: isolationSettings.reps,
      restTime: isolationSettings.restTime,
      notes: "Core - Estabilidad",
    },
  ].filter(ex => ex.exercise !== null);

  const finalExercises = methodology !== "standard" 
    ? applyMethodology(dayExercises, methodology, goal) 
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
}s: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Bíceps`,
        },
        {
          exercise: armExercises[(cycleIndex + 2) % armExercises.length], // Use a different arm exercise
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
          exercise: legExercises[cycleIndex % legExercises.length],
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Cuádriceps`,
        },
        {
          exercise: legExercises[(cycleIndex + 3) % legExercises.length], // Use a different leg exercise
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Isquiotibiales`,
        },
        {
          exercise: legExercises[(cycleIndex + 6) % legExercises.length], // Use a different leg exercise
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Glúteos`,
        },
        {
          exercise: coreExercises[cycleIndex % coreExercises.length],
          sets: isolationSettings.sets,
          reps: cycleIndex === 0 ? 0 : isolationSettings.reps, // Plank on first lower day
          restTime: isolationSettings.restTime,
          notes:
            cycleIndex === 0
              ? `${muscleGroupName} - Core (Plancha: 45 segundos)`
              : `${muscleGroupName} - Core`,
        },
        {
          exercise: coreExercises[(cycleIndex + 2) % coreExercises.length], // Use a different core exercise
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Oblicuos`,
        },
      ];
    }

    // Apply methodology if specified
    const finalExercises =
      methodology !== "standard"
        ? applyMethodology(dayExercises, methodology, goal)
        : dayExercises;

    // Add exercises for this day to the workout
    for (const ex of finalExercises) {
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
    workoutExercises.map((ex) =>
      prisma.workoutExercise.create({
        data: {
          ...ex,
          exerciseId: ex.exerciseId.toString(), // Convert to string
        },
      }),
    ),
  );
}

// Create a push/pull/legs split workout plan
export async function createPushPullLegsSplit(
  workoutId: string,
  exercises: any[],
  goal: string,
  _gender: string | null,
  trainingFrequency: number,
  methodology = "standard",
) {
  const workoutExercises = [];
  let order = 1;
  const usedExercises = new Set<string>();

  // Filter exercises by muscle group
  const legExercises = exercises.filter((e) => e.muscleGroup === "piernas");
  const chestExercises = exercises.filter((e) => e.muscleGroup === "pecho");
  const backExercises = exercises.filter((e) => e.muscleGroup === "espalda");
  const shoulderExercises = exercises.filter(
    (e) => e.muscleGroup === "hombros",
  );
  const tricepsExercises = exercises.filter(
    (e) =>
      e.muscleGroup === "brazos" && e.name.toLowerCase().includes("tríceps"),
  );
  const bicepsExercises = exercises.filter(
    (e) =>
      e.muscleGroup === "brazos" && e.name.toLowerCase().includes("bíceps"),
  );
  const coreExercises = exercises.filter((e) => e.muscleGroup === "core");

  // Determine workout structure based on training frequency
  const workoutDays = Math.min(trainingFrequency, 6);

  // Create workout days
  for (let day = 1; day <= workoutDays; day++) {
    const dayType = day % 3; // 1 = Push, 2 = Pull, 0 = Legs
    const cycleIndex = Math.floor((day - 1) / 3);

    const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
    const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

    let dayExercises = [];

    if (dayType === 1) {
      // Push day
      const muscleGroupName = "Pecho y Tríceps";
      const selectedChestExercises = selectUniqueExercises(
        chestExercises,
        3,
        usedExercises,
      );
      const selectedShoulderExercises = selectUniqueExercises(
        shoulderExercises,
        2,
        usedExercises,
      );
      const selectedTricepsExercises = selectUniqueExercises(
        tricepsExercises.length > 0
          ? tricepsExercises
          : exercises.filter((e) => e.muscleGroup === "brazos"),
        2,
        usedExercises,
      );

      dayExercises = [
        {
          exercise: selectedChestExercises[0],
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Pecho principal`,
        },
        {
          exercise: selectedChestExercises[1],
          sets: compoundSettings.sets - 1,
          reps: compoundSettings.reps + 2,
          restTime: compoundSettings.restTime - 30,
          notes: `${muscleGroupName} - Pecho secundario`,
        },
        {
          exercise: selectedShoulderExercises[0],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Hombros`,
        },
        {
          exercise: selectedTricepsExercises[0],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Tríceps principal`,
        },
        {
          exercise: selectedTricepsExercises[1],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Tríceps secundario`,
        },
      ];
    } else if (dayType === 2) {
      // Pull day
      const muscleGroupName = "Espalda y Bíceps";
      const selectedBackExercises = selectUniqueExercises(
        backExercises,
        3,
        usedExercises,
      );
      const selectedBicepsExercises = selectUniqueExercises(
        bicepsExercises.length > 0
          ? bicepsExercises
          : exercises.filter((e) => e.muscleGroup === "brazos"),
        2,
        usedExercises,
      );

      dayExercises = [
        {
          exercise: selectedBackExercises[0],
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Espalda principal`,
        },
        {
          exercise: selectedBackExercises[1],
          sets: compoundSettings.sets - 1,
          reps: compoundSettings.reps + 2,
          restTime: compoundSettings.restTime - 30,
          notes: `${muscleGroupName} - Espalda secundaria`,
        },
        {
          exercise: selectedBackExercises[2],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Espalda aislamiento`,
        },
        {
          exercise: selectedBicepsExercises[0],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Bíceps principal`,
        },
        {
          exercise: selectedBicepsExercises[1],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Bíceps secundario`,
        },
      ];
    } else {
      // Legs day
      const muscleGroupName = "Piernas";
      const selectedLegExercises = selectUniqueExercises(
        legExercises,
        4,
        usedExercises,
      );
      const selectedCoreExercises = selectUniqueExercises(
        coreExercises,
        2,
        usedExercises,
      );

      dayExercises = [
        {
          exercise: selectedLegExercises[0],
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Cuádriceps principal`,
        },
        {
          exercise: selectedLegExercises[1],
          sets: compoundSettings.sets - 1,
          reps: compoundSettings.reps + 2,
          restTime: compoundSettings.restTime - 30,
          notes: `${muscleGroupName} - Isquiotibiales`,
        },
        {
          exercise: selectedLegExercises[2],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Glúteos`,
        },
        {
          exercise: selectedLegExercises[3],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Pantorrillas`,
        },
        {
          exercise: selectedCoreExercises[0],
          sets: isolationSettings.sets,
          reps: cycleIndex === 0 ? 0 : isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes:
            cycleIndex === 0
              ? `${muscleGroupName} - Core (Plancha: 45-60 segundos)`
              : `${muscleGroupName} - Core`,
        },
      ];
    }

    // Apply methodology if specified
    const finalExercises =
      methodology !== "standard"
        ? applyMethodology(dayExercises, methodology, goal)
        : dayExercises;

    // Add exercises for this day to the workout
    for (const ex of finalExercises) {
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
    workoutExercises.map((ex) =>
      prisma.workoutExercise.create({
        data: {
          ...ex,
          exerciseId: ex.exerciseId.toString(),
        },
      }),
    ),
  );
}

// Create a Weider split workout plan (one muscle group per day)
export async function createWeiderSplit(
  workoutId: string,
  exercises: any[],
  goal: string,
  _gender: string | null,
  trainingFrequency: number,
  methodology = "standard",
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const legExercises = exercises.filter((e) => e.muscleGroup === "piernas");
  const chestExercises = exercises.filter((e) => e.muscleGroup === "pecho");
  const backExercises = exercises.filter((e) => e.muscleGroup === "espalda");
  const shoulderExercises = exercises.filter(
    (e) => e.muscleGroup === "hombros",
  );
  const armExercises = exercises.filter((e) => e.muscleGroup === "brazos");
  const coreExercises = exercises.filter((e) => e.muscleGroup === "core");

  // Define muscle groups for each day
  const muscleGroups = [
    { name: "Pecho", exercises: chestExercises },
    { name: "Espalda", exercises: backExercises },
    { name: "Piernas", exercises: legExercises },
    { name: "Hombros", exercises: shoulderExercises },
    { name: "Brazos", exercises: armExercises },
    { name: "Core", exercises: coreExercises },
  ];

  // Determine workout structure based on training frequency
  const workoutDays = Math.min(trainingFrequency, 6); // Cap at 6 days for Weider

  // Create workout days
  for (let day = 1; day <= workoutDays; day++) {
    const muscleGroupIndex = (day - 1) % muscleGroups.length;
    const muscleGroup = muscleGroups[muscleGroupIndex];

    // Ensure muscle group exists before destructuring
    if (!muscleGroup) {
      console.warn(
        `No se encontró el grupo muscular en el índice ${muscleGroupIndex}`,
      );
      continue;
    }

    const { name: muscleGroupName, exercises: muscleGroupExercises } =
      muscleGroup;

    // Ensure we have exercises to work with
    if (!muscleGroupExercises.length) {
      console.warn(`No exercises found for muscle group: ${muscleGroupName}`);
      continue;
    }

    const cycleIndex = Math.max(0, Math.floor((day - 1) / muscleGroups.length));

    // Get sets and reps based on goal with fallbacks
    // Convert string reps to number by taking the first number in the range
    const parseReps = (reps: string | number): number => {
      if (typeof reps === "number") return reps;
      const match = String(reps).match(/\d+/);
      return match ? parseInt(match[0], 10) : 8; // Default to 8 if parsing fails
    };

    const defaultCompound = { sets: 3, reps: "8-12", restTime: 90 };
    const defaultIsolation = { sets: 3, reps: "10-15", restTime: 60 };

    const compoundSettings =
      getSetsAndRepsForGoal(goal, "compound") || defaultCompound;
    const isolationSettings =
      getSetsAndRepsForGoal(goal, "isolation") || defaultIsolation;

    // Select exercises for this muscle group (4-6 exercises per muscle group)
    const targetExercises = muscleGroupName === "Core" ? 4 : 5;
    const numExercises = Math.min(muscleGroupExercises.length, targetExercises);

    const dayExercises: Array<{
      exercise: any;
      sets: number;
      reps: number; // Changed from string to number to match Prisma schema
      restTime: number;
      notes: string;
    }> = [];

    // Use different exercises for each cycle to avoid repetition
    for (let i = 0; i < numExercises; i++) {
      const exerciseIndex = (i + cycleIndex) % muscleGroupExercises.length;
      const exercise = muscleGroupExercises[exerciseIndex];

      // Skip if exercise is undefined
      if (!exercise) {
        console.warn(
          `Undefined exercise at index ${exerciseIndex} for ${muscleGroupName}`,
        );
        continue;
      }

      const isCompound = i < 2; // First 2 exercises are compound
      const settings = isCompound ? compoundSettings : isolationSettings;

      dayExercises.push({
        exercise,
        sets: settings.sets || 3,
        reps: parseReps(settings.reps || (isCompound ? "8-12" : "10-15")),
        restTime: settings.restTime || (isCompound ? 90 : 60),
        notes: `${muscleGroupName} - ${
          i === 0
            ? "Principal"
            : i === 1
              ? "Secundario"
              : `Aislamiento ${i - 1}`
        }`,
      });
    }

    // Skip if no valid exercises were added
    if (dayExercises.length === 0) {
      console.warn(`No valid exercises for ${muscleGroupName} on day ${day}`);
      continue;
    }

    // Apply methodology if specified
    let finalExercises = dayExercises;
    if (methodology && methodology !== "standard") {
      try {
        const result = applyMethodology(dayExercises, methodology, goal);
        if (Array.isArray(result)) {
          finalExercises = result;
        } else {
          console.warn(
            "applyMethodology did not return an array, using default exercises",
          );
        }
      } catch (error) {
        console.error("Error applying methodology:", error);
      }
    }

    // Add exercises for this day to the workout
    for (const ex of finalExercises) {
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
    workoutExercises.map((ex) =>
      prisma.workoutExercise.create({
        data: {
          ...ex,
          exerciseId: ex.exerciseId.toString(), // Convert to string
        },
      }),
    ),
  );
}

// Add these specialized workout creation functions at the end of the file

// Create a chest and triceps workout
export async function createChestTricepsWorkout(
  workoutId: string,
  exercises: any[],
  goal: string,
  methodology = "standard",
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const chestExercises = exercises.filter((e) => e.muscleGroup === "pecho");
  const tricepsExercises =
    exercises.filter(
      (e) =>
        e.muscleGroup === "brazos" && e.name.toLowerCase().includes("tríceps"),
    ) || exercises.filter((e) => e.muscleGroup === "brazos").slice(0, 2);

  // Get sets and reps based on goal
  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const muscleGroupName = "Pecho y Tríceps";
  const dayExercises = [
    // Chest Exercises - Compound movements first
    {
      exercise: chestExercises[0] || null,
      sets: compoundSettings.sets,
      reps: compoundSettings.reps,
      restTime: compoundSettings.restTime,
      notes: `${muscleGroupName} - Pecho principal`,
    },
    {
      exercise: chestExercises[1] || chestExercises[0] || null,
      sets: compoundSettings.sets - 1,
      reps: compoundSettings.reps + 2,
      restTime: compoundSettings.restTime - 30,
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
  const finalExercises =
    methodology !== "standard"
      ? applyMethodology(dayExercises, methodology, goal)
      : dayExercises;

  // Add exercises to the workout
  for (const ex of finalExercises) {
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

  // Save all exercises to the database
  return prisma.$transaction(
    workoutExercises.map((ex) =>
      prisma.workoutExercise.create({
        data: {
          ...ex,
          exerciseId: ex.exerciseId.toString(), // Convert to string
        },
      }),
    ),
  );
}

// Create a back and biceps workout
export async function createBackBicepsWorkout(
  workoutId: string,
  exercises: any[],
  goal: string,
  methodology = "standard",
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const backExercises = exercises.filter((e) => e.muscleGroup === "espalda");
  const bicepsExercises =
    exercises.filter(
      (e) =>
        e.muscleGroup === "brazos" && e.name.toLowerCase().includes("bíceps"),
    ) || exercises.filter((e) => e.muscleGroup === "brazos").slice(0, 2);

  // Get sets and reps based on goal
  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  const muscleGroupName = "Espalda y Bíceps";
  const dayExercises = [
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
  const finalExercises =
    methodology !== "standard"
      ? applyMethodology(dayExercises, methodology, goal)
      : dayExercises;

  // Add exercises to the workout
  for (const ex of finalExercises) {
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

  // Save all exercises to the database
  return prisma.$transaction(
    workoutExercises.map((ex) =>
      prisma.workoutExercise.create({
        data: {
          ...ex,
          exerciseId: ex.exerciseId.toString(), // Convert to string
        },
      }),
    ),
  );
}

// Create a leg workout
export async function createLegWorkout(
  workoutId: string,
  exercises: any[],
  goal: string,
  methodology = "standard",
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const legExercises = exercises.filter((e) => e.muscleGroup === "piernas");

  // Get sets and reps based on goal
  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  // Make sure there's at least one exercise
  if (legExercises.length === 0) {
    return [];
  }

  // Get unique exercises or use available ones as fallback
  const exercise1 = legExercises[0];
  const exercise2 = legExercises[1] || exercise1;
  const exercise3 = legExercises[2] || exercise1;
  const exercise4 = legExercises[3] || exercise2;
  const exercise5 = legExercises[4] || exercise3;

  const muscleGroupName = "Piernas";
  const dayExercises = [
    // Compound movements first
    {
      exercise: exercise1,
      sets: compoundSettings.sets,
      reps: compoundSettings.reps,
      restTime: compoundSettings.restTime,
      notes: `${muscleGroupName} - Cuádriceps principal`,
    },
    {
      exercise: exercise2,
      sets: compoundSettings.sets - 1,
      reps: compoundSettings.reps + 2,
      restTime: compoundSettings.restTime - 30,
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
  const finalExercises =
    methodology !== "standard"
      ? applyMethodology(dayExercises, methodology, goal)
      : dayExercises;

  // Add exercises to the workout
  for (const ex of finalExercises) {
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

  // Save all exercises to the database
  return prisma.$transaction(
    workoutExercises.map((ex) =>
      prisma.workoutExercise.create({
        data: {
          ...ex,
          exerciseId: ex.exerciseId.toString(), // Convert to string
        },
      }),
    ),
  );
}

// Create a shoulder workout
export async function createShoulderWorkout(
  workoutId: string,
  exercises: any[],
  goal: string,
  methodology = "standard",
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const shoulderExercises = exercises.filter(
    (e) => e.muscleGroup === "hombros",
  );

  // Get sets and reps based on goal
  const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  // Make sure there's at least one exercise
  if (shoulderExercises.length === 0) {
    return [];
  }

  // Get unique exercises or use available ones as fallback
  const exercise1 = shoulderExercises[0];
  const exercise2 = shoulderExercises[1] || exercise1;
  const exercise3 = shoulderExercises[2] || exercise1;
  const exercise4 = shoulderExercises[3] || exercise2;

  const muscleGroupName = "Hombros";
  const dayExercises = [
    // Compound movements first
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
  const finalExercises =
    methodology !== "standard"
      ? applyMethodology(dayExercises, methodology, goal)
      : dayExercises;

  // Add exercises to the workout
  for (const ex of finalExercises) {
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

  // Save all exercises to the database
  return prisma.$transaction(
    workoutExercises.map((ex) =>
      prisma.workoutExercise.create({
        data: {
          ...ex,
          exerciseId: ex.exerciseId.toString(), // Convert to string
        },
      }),
    ),
  );
}

// Create a core workout
export async function createCoreWorkout(
  workoutId: string,
  exercises: any[],
  goal: string,
  methodology = "standard",
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const coreExercises = exercises.filter((e) => e.muscleGroup === "core");

  // Get sets and reps based on goal
  const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

  // Make sure there's at least one exercise
  if (coreExercises.length === 0) {
    return [];
  }

  // Get unique exercises or use available ones as fallback
  const exercise1 = coreExercises[0];
  const exercise2 = coreExercises[1] || exercise1;
  const exercise3 = coreExercises[2] || exercise1;
  const exercise4 = coreExercises[3] || exercise2;

  const muscleGroupName = "Core";
  const dayExercises = [
    {
      exercise: exercise1,
      sets: isolationSettings.sets,
      reps: 0, // For planks, time in seconds will be in notes
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
  const finalExercises =
    methodology !== "standard"
      ? applyMethodology(dayExercises, methodology, goal)
      : dayExercises;

  // Add exercises to the workout
  for (const ex of finalExercises) {
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

  // Save all exercises to the database
  return prisma.$transaction(
    workoutExercises.map((ex) =>
      prisma.workoutExercise.create({
        data: {
          ...ex,
          exerciseId: ex.exerciseId.toString(), // Convert to string
        },
      }),
    ),
  );
}

/**
 * Calculates the user's experience level based on their training history
 * @param profile User profile containing training information
 * @returns Experience level (beginner, intermediate, or advanced)
 */
export function calculateExperienceLevel(profile: {
  trainingFrequency?: number | null;
  monthsTraining?: number | null;
}): "beginner" | "intermediate" | "advanced" {
  if (!profile.trainingFrequency || !profile.monthsTraining) return "beginner";
  if (profile.trainingFrequency <= 2 || profile.monthsTraining < 6)
    return "beginner";
  if (profile.trainingFrequency <= 4 || profile.monthsTraining < 18)
    return "intermediate";
  return "advanced";
}
