/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { exercises } from "@/data/exercises";
// Get or create exercises in the database

export async function getOrCreateExercises() {
  // First, check if any exercises exist
  const existingExercisesCount = await prisma.exercise.count();

  if (existingExercisesCount > 0) {
    // If exercises exist, return all existing exercises
    return prisma.exercise.findMany();
  }

  // If no exercises exist, prepare to create them
  const exercisesToCreate = exercises;

  // Upsert exercises (create or update)
  const createdExercises = await prisma.$transaction(async (tx) => {
    const exerciseResults = [];

    for (const exercise of exercisesToCreate) {
      // Try to find an existing exercise
      console.log("nuevos");
      const existingExercise = await tx.exercise.findFirst({
        where: {
          name: exercise.name,
        },
        select: { id: true },
      });

      let upsertedExercise;
      if (existingExercise) {
        // If exercise exists, update it
        upsertedExercise = await tx.exercise.update({
          where: {
            id: existingExercise.id,
          },
          data: exercise,
        });
      } else {
        // If exercise doesn't exist, create it
        upsertedExercise = await tx.exercise.create({
          data: exercise,
        });
      }
      console.log(upsertedExercise);
      exerciseResults.push(upsertedExercise);
    }

    return exerciseResults;
  });

  return createdExercises;
}

// Determine the best workout type based on user profile
export function getRecommendedWorkoutType(profile: any) {
  const trainingFrequency = profile?.trainingFrequency ?? 0;
  const goal = profile?.goal ?? "";
  const activityLevel = profile?.activityLevel ?? "";
  const experienceLevel = profile?.experienceLevel ?? "";

  // For beginners or people with limited time
  if (
    experienceLevel === "beginner" ||
    trainingFrequency <= 3 ||
    activityLevel === "sedentary" ||
    activityLevel === "light"
  ) {
    return "Full Body";
  }

  // For intermediate users with moderate time
  if (experienceLevel === "intermediate" || trainingFrequency <= 4) {
    return "Upper/Lower Split";
  }

  // For advanced users or those with more time
  if (experienceLevel === "advanced" || trainingFrequency >= 5) {
    if (goal === "gain-muscle") {
      return "Push/Pull/Legs";
    } else if (goal === "strength") {
      return "Upper/Lower Split";
    } else {
      return "Weider";
    }
  }

  // Default to full body as a safe option
  return "Full Body";
}

// Main function to create a workout plan based on type
export async function createWorkoutPlan(
  workoutId: string,
  exercises: any[],
  goal: string,
  gender: string | null,
  trainingFrequency: number,
  workoutType: string,
  _workoutHistory: any[],
  methodology = "standard"
) {
  // Determine the workout type based on body distribution
  switch (workoutType) {
    case "Full Body":
      return createFullBodyWorkout(
        workoutId,
        exercises,
        goal,
        gender,
        trainingFrequency,
        methodology
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
      // If no specific type, create a balanced plan based on frequency
      if (trainingFrequency <= 3) {
        return createFullBodyWorkout(
          workoutId,
          exercises,
          goal,
          gender,
          trainingFrequency,
          methodology
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

// Function to determine sets and reps based on goal
function getSetsAndRepsForGoal(goal: string, exerciseType = "compound") {
  switch (goal) {
    case "strength":
      return {
        sets: exerciseType === "compound" ? 5 : 3,
        reps: exerciseType === "compound" ? 5 : 8,
        restTime: 180, // 3 minutes for full recovery
      };
    case "gain-muscle":
    case "hypertrophy":
      return {
        sets: exerciseType === "compound" ? 4 : 3,
        reps: exerciseType === "compound" ? 8 : 12,
        restTime: 90, // 90 seconds for balance between recovery and congestion
      };
    case "endurance":
      return {
        sets: 3,
        reps: 15,
        restTime: 45, // Short rest to maintain elevated heart rate
      };
    case "lose-weight":
    case "fat-loss":
      return {
        sets: 3,
        reps: 12,
        restTime: 60, // Moderate rest to maintain intensity
      };
    case "mobility":
      return {
        sets: 2,
        reps: 12,
        restTime: 30, // Short rest for mobility exercises
      };
    default:
      return {
        sets: 3,
        reps: 10,
        restTime: 60,
      };
  }
}

// Function to apply methodology to the workout
function applyMethodology(exercises: any[], methodology: string, goal: string) {
  // Clone exercises to avoid modifying the original
  const modifiedExercises = [...exercises];

  switch (methodology) {
    case "circuit":
      // In circuit, reduce rest and add indication in notes
      return modifiedExercises.map((ex) => ({
        ...ex,
        restTime: 30, // Minimum rest between exercises
        notes: ex.notes + " (Circuito: mínimo descanso entre ejercicios)",
      }));

    case "hiit":
      // For HIIT, adjust to high intensity intervals
      return modifiedExercises.map((ex) => ({
        ...ex,
        reps: Math.max(8, ex.reps - 2), // Fewer reps but more intense
        restTime: 20, // Very short rest
        notes: ex.notes + " (HIIT: 20s trabajo, 10s descanso)",
      }));

    case "drop-sets":
      // For drop sets, maintain series but indicate the technique
      if (goal === "gain-muscle" || goal === "hypertrophy") {
        return modifiedExercises.map((ex) => ({
          ...ex,
          sets: Math.max(2, ex.sets - 1), // Reduce sets because they are more intense
          notes: ex.notes + " (Drop set: reduce peso 20% al fallar y continúa)",
        }));
      }
      return modifiedExercises;

    case "pyramid":
      // For pyramid, adjust series and reps
      return modifiedExercises.map((ex) => ({
        ...ex,
        notes:
          ex.notes + " (Pirámide: aumenta peso y reduce reps en cada serie)",
      }));

    case "supersets":
      // For supersets, pair exercises and reduce rest
      if (modifiedExercises.length >= 2) {
        for (let i = 0; i < modifiedExercises.length - 1; i += 2) {
          modifiedExercises[i].notes += ` (Superset con ${
            modifiedExercises[i + 1].name || "siguiente ejercicio"
          })`;
          modifiedExercises[i + 1].notes += ` (Superset con ${
            modifiedExercises[i].name || "ejercicio anterior"
          })`;
          modifiedExercises[i].restTime = 0; // No rest between exercises in the superset
        }
      }
      return modifiedExercises;

    default:
      return modifiedExercises;
  }
}

// Función de utilidad para seleccionar ejercicios únicos
function selectUniqueExercises(
  exercises: any[],
  count: number,
  usedExercises: Set<string> = new Set()
): any[] {
  const availableExercises = exercises.filter(
    (ex) => !usedExercises.has(ex.id)
  );
  const selectedExercises: any[] = [];

  // Si no hay suficientes ejercicios disponibles, reutilizar algunos
  if (availableExercises.length < count) {
    return exercises.slice(0, count);
  }

  // Seleccionar ejercicios únicos aleatoriamente
  while (selectedExercises.length < count && availableExercises.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableExercises.length);
    const exercise = availableExercises.splice(randomIndex, 1)[0];
    selectedExercises.push(exercise);
    usedExercises.add(exercise.id);
  }

  return selectedExercises;
}

// Create a full body workout plan
export async function createFullBodyWorkout(
  workoutId: string,
  exercises: any[],
  goal: string,
  _gender: string | null,
  trainingFrequency: number,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;
  const usedExercises = new Set<string>();

  // Filter exercises by muscle group
  const legExercises = exercises.filter((e) => e.muscleGroup === "piernas");
  const chestExercises = exercises.filter((e) => e.muscleGroup === "pecho");
  const backExercises = exercises.filter((e) => e.muscleGroup === "espalda");
  const shoulderExercises = exercises.filter(
    (e) => e.muscleGroup === "hombros"
  );
  const armExercises = exercises.filter((e) => e.muscleGroup === "brazos");
  const coreExercises = exercises.filter((e) => e.muscleGroup === "core");

  // Determine workout structure based on training frequency
  const workoutDays = Math.min(trainingFrequency, 3);

  // Create workout days
  for (let day = 1; day <= workoutDays; day++) {
    const muscleGroupName = "Full Body";
    const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
    const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

    // Seleccionar ejercicios únicos para cada día
    const selectedLegExercises = selectUniqueExercises(
      legExercises,
      1,
      usedExercises
    );
    const selectedChestExercises = selectUniqueExercises(
      chestExercises,
      1,
      usedExercises
    );
    const selectedBackExercises = selectUniqueExercises(
      backExercises,
      1,
      usedExercises
    );
    const selectedShoulderExercises = selectUniqueExercises(
      shoulderExercises,
      1,
      usedExercises
    );
    const selectedArmExercises = selectUniqueExercises(
      armExercises,
      1,
      usedExercises
    );
    const selectedCoreExercises = selectUniqueExercises(
      coreExercises,
      1,
      usedExercises
    );

    const dayExercises = [
      {
        exercise: selectedLegExercises[0],
        sets: compoundSettings.sets,
        reps: compoundSettings.reps,
        restTime: compoundSettings.restTime,
        notes: `${muscleGroupName} - Piernas`,
      },
      {
        exercise: selectedChestExercises[0],
        sets: compoundSettings.sets,
        reps: compoundSettings.reps,
        restTime: compoundSettings.restTime,
        notes: `${muscleGroupName} - Pecho`,
      },
      {
        exercise: selectedBackExercises[0],
        sets: compoundSettings.sets,
        reps: compoundSettings.reps,
        restTime: compoundSettings.restTime,
        notes: `${muscleGroupName} - Espalda`,
      },
      {
        exercise: selectedShoulderExercises[0],
        sets: isolationSettings.sets,
        reps: isolationSettings.reps,
        restTime: isolationSettings.restTime,
        notes: `${muscleGroupName} - Hombros`,
      },
      {
        exercise: selectedArmExercises[0],
        sets: isolationSettings.sets,
        reps: isolationSettings.reps,
        restTime: isolationSettings.restTime,
        notes: `${muscleGroupName} - Brazos`,
      },
      {
        exercise: selectedCoreExercises[0],
        sets: isolationSettings.sets,
        reps: day === 1 ? 0 : isolationSettings.reps,
        restTime: isolationSettings.restTime,
        notes:
          day === 1
            ? `${muscleGroupName} - Core (Plancha: 30-45 segundos)`
            : `${muscleGroupName} - Core`,
      },
    ];

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
      })
    )
  );
}

// Create an upper/lower split workout plan
export async function createUpperLowerSplit(
  workoutId: string,
  exercises: any[],
  goal: string,
  _gender: string | null,
  trainingFrequency: number,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const legExercises = exercises.filter((e) => e.muscleGroup === "piernas");
  const chestExercises = exercises.filter((e) => e.muscleGroup === "pecho");
  const backExercises = exercises.filter((e) => e.muscleGroup === "espalda");
  const shoulderExercises = exercises.filter(
    (e) => e.muscleGroup === "hombros"
  );
  const armExercises = exercises.filter((e) => e.muscleGroup === "brazos");
  const coreExercises = exercises.filter((e) => e.muscleGroup === "core");

  // Determine workout structure based on training frequency
  const workoutDays = Math.min(trainingFrequency, 6); // Allow up to 6 days for upper/lower

  // Create workout days
  for (let day = 1; day <= workoutDays; day++) {
    const isUpperDay = day % 2 === 1; // Odd days are upper body, even days are lower body
    const muscleGroupName = isUpperDay ? "Tren Superior" : "Tren Inferior";
    const cycleIndex = Math.floor((day - 1) / 2); // 0, 0, 1, 1, 2, 2, ...

    // Get sets and reps based on goal
    const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
    const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

    let dayExercises = [];

    if (isUpperDay) {
      // Upper body day
      dayExercises = [
        {
          exercise: chestExercises[cycleIndex % chestExercises.length],
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Pecho`,
        },
        {
          exercise: backExercises[cycleIndex % backExercises.length],
          sets: compoundSettings.sets,
          reps: compoundSettings.reps,
          restTime: compoundSettings.restTime,
          notes: `${muscleGroupName} - Espalda`,
        },
        {
          exercise: shoulderExercises[cycleIndex % shoulderExercises.length],
          sets: isolationSettings.sets,
          reps: isolationSettings.reps,
          restTime: isolationSettings.restTime,
          notes: `${muscleGroupName} - Hombros`,
        },
        {
          exercise: armExercises[cycleIndex % armExercises.length],
          sets: isolationSettings.sets,
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
      })
    )
  );
}

// Create a push/pull/legs split workout plan
export async function createPushPullLegsSplit(
  workoutId: string,
  exercises: any[],
  goal: string,
  _gender: string | null,
  trainingFrequency: number,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;
  const usedExercises = new Set<string>();

  // Filter exercises by muscle group
  const legExercises = exercises.filter((e) => e.muscleGroup === "piernas");
  const chestExercises = exercises.filter((e) => e.muscleGroup === "pecho");
  const backExercises = exercises.filter((e) => e.muscleGroup === "espalda");
  const shoulderExercises = exercises.filter(
    (e) => e.muscleGroup === "hombros"
  );
  const tricepsExercises = exercises.filter(
    (e) =>
      e.muscleGroup === "brazos" && e.name.toLowerCase().includes("tríceps")
  );
  const bicepsExercises = exercises.filter(
    (e) => e.muscleGroup === "brazos" && e.name.toLowerCase().includes("bíceps")
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
        usedExercises
      );
      const selectedShoulderExercises = selectUniqueExercises(
        shoulderExercises,
        2,
        usedExercises
      );
      const selectedTricepsExercises = selectUniqueExercises(
        tricepsExercises.length > 0
          ? tricepsExercises
          : exercises.filter((e) => e.muscleGroup === "brazos"),
        2,
        usedExercises
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
        usedExercises
      );
      const selectedBicepsExercises = selectUniqueExercises(
        bicepsExercises.length > 0
          ? bicepsExercises
          : exercises.filter((e) => e.muscleGroup === "brazos"),
        2,
        usedExercises
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
        usedExercises
      );
      const selectedCoreExercises = selectUniqueExercises(
        coreExercises,
        2,
        usedExercises
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
      })
    )
  );
}

// Create a Weider split workout plan (one muscle group per day)
export async function createWeiderSplit(
  workoutId: string,
  exercises: any[],
  goal: string,
  _gender: string | null,
  trainingFrequency: number,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const legExercises = exercises.filter((e) => e.muscleGroup === "piernas");
  const chestExercises = exercises.filter((e) => e.muscleGroup === "pecho");
  const backExercises = exercises.filter((e) => e.muscleGroup === "espalda");
  const shoulderExercises = exercises.filter(
    (e) => e.muscleGroup === "hombros"
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
    const { name: muscleGroupName, exercises: muscleGroupExercises } =
      muscleGroups[muscleGroupIndex];

    const cycleIndex = Math.floor((day - 1) / muscleGroups.length);

    // Get sets and reps based on goal
    const compoundSettings = getSetsAndRepsForGoal(goal, "compound");
    const isolationSettings = getSetsAndRepsForGoal(goal, "isolation");

    // Select exercises for this muscle group (4-6 exercises per muscle group)
    const numExercises = Math.min(
      muscleGroupExercises.length,
      muscleGroupName === "Core" ? 4 : 5
    );

    const dayExercises = [];

    // Use different exercises for each cycle to avoid repetition
    for (let i = 0; i < numExercises; i++) {
      const exerciseIndex = (i + cycleIndex) % muscleGroupExercises.length;
      const exercise = muscleGroupExercises[exerciseIndex];
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
      })
    )
  );
}

// Add these specialized workout creation functions at the end of the file

// Create a chest and triceps workout
export async function createChestTricepsWorkout(
  workoutId: string,
  exercises: any[],
  goal: string,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const chestExercises = exercises.filter((e) => e.muscleGroup === "pecho");
  const tricepsExercises =
    exercises.filter(
      (e) =>
        e.muscleGroup === "brazos" && e.name.toLowerCase().includes("tríceps")
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
      })
    )
  );
}

// Create a back and biceps workout
export async function createBackBicepsWorkout(
  workoutId: string,
  exercises: any[],
  goal: string,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const backExercises = exercises.filter((e) => e.muscleGroup === "espalda");
  const bicepsExercises =
    exercises.filter(
      (e) =>
        e.muscleGroup === "brazos" && e.name.toLowerCase().includes("bíceps")
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
      })
    )
  );
}

// Create a leg workout
export async function createLegWorkout(
  workoutId: string,
  exercises: any[],
  goal: string,
  methodology = "standard"
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
      })
    )
  );
}

// Create a shoulder workout
export async function createShoulderWorkout(
  workoutId: string,
  exercises: any[],
  goal: string,
  methodology = "standard"
) {
  const workoutExercises = [];
  let order = 1;

  // Filter exercises by muscle group
  const shoulderExercises = exercises.filter(
    (e) => e.muscleGroup === "hombros"
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
      })
    )
  );
}

// Create a core workout
export async function createCoreWorkout(
  workoutId: string,
  exercises: any[],
  goal: string,
  methodology = "standard"
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
      })
    )
  );
}
