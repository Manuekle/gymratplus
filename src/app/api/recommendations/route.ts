import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getOrCreateExercises,
  createFullBodyWorkout,
  createUpperLowerSplit,
  createPushPullLegsSplit,
} from "@/lib/workout-utils";
import { getOrCreateFoods } from "@/lib/nutrition-utils";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    // Función para formatear plan de entrenamiento
    function formatWorkoutPlan(workoutExercises) {
      // Agrupar ejercicios por día
      const exercisesByDay = workoutExercises.reduce((acc, ex) => {
        const day = ex.notes.split(":")[0].trim();
        if (!acc[day]) acc[day] = [];
        acc[day].push(ex);
        return acc;
      }, {});

      // Formatear cada día
      return Object.entries(exercisesByDay).map(([day, exercises]) => {
        return {
          day,
          exercises: exercises.map((ex) => ({
            id: ex.id,
            name: ex.name || "Ejercicio",
            sets: ex.sets,
            reps: ex.reps,
            restTime: ex.restTime,
            notes: ex.notes.split(":").slice(1).join(":").trim(),
          })),
        };
      });
    }

    // Buscar el perfil del usuario en la base de datos
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Buscar planes existentes con estructura detallada
    const existingWorkout = await prisma.workout.findFirst({
      where: { userId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    const existingMealLogs = await prisma.mealLog.findMany({
      where: { userId },
      include: {
        entries: {
          include: {
            food: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    // Si ya existen, formatear según la estructura requerida
    if (existingWorkout && existingMealLogs.length > 0) {
      // Formatear plan de entrenamiento
      const workoutPlan = {
        id: existingWorkout.id,
        name: existingWorkout.name,
        description: existingWorkout.description,
        days: formatWorkoutPlan(
          existingWorkout.exercises.map((we) => ({
            id: we.id,
            name: we.exercise.name,
            sets: we.sets,
            reps: we.reps,
            restTime: we.restTime,
            notes: `${we.notes || "General"}`,
          }))
        ),
      };

      // Formatear plan nutricional
      const nutritionPlan = {
        macros: {
          protein: `${existingMealLogs
            .reduce((sum, log) => sum + log.protein, 0)
            .toFixed(0)}g`,
          carbs: `${existingMealLogs
            .reduce((sum, log) => sum + log.carbs, 0)
            .toFixed(0)}g`,
          fat: `${existingMealLogs
            .reduce((sum, log) => sum + log.fat, 0)
            .toFixed(0)}g`,
          description: "Basado en tus registros de comidas",
        },
        meals: {
          breakfast: existingMealLogs.find(
            (log) => log.mealType === "breakfast"
          ),
          lunch: existingMealLogs.find((log) => log.mealType === "lunch"),
          dinner: existingMealLogs.find((log) => log.mealType === "dinner"),
          snacks: existingMealLogs.find((log) => log.mealType === "snack"),
        },
      };

      return NextResponse.json({
        workoutPlan,
        nutritionPlan,
      });
    }

    // Si no existen, generar nuevos planes
    const workoutPlan = existingWorkout
      ? existingWorkout
      : await generateAndSaveWorkoutPlan(profile);

    const nutritionPlan =
      existingMealLogs.length > 0
        ? {
            /* formatear similar a arriba */
          }
        : await generateAndSaveNutritionPlan(profile);

    return NextResponse.json({
      workoutPlan,
      nutritionPlan,
    });
  } catch (error) {
    console.error("Error generando recomendaciones:", error);
    return NextResponse.json(
      { error: "Error al generar recomendaciones" },
      { status: 500 }
    );
  }
}

// Actualizar la función para usar el modelo Profile
async function generateAndSaveWorkoutPlan(profile) {
  const { id: profileId, userId, gender, goal, trainingFrequency } = profile;

  // Crear un nuevo workout en la base de datos
  const workout = await prisma.workout.create({
    data: {
      name: `Plan de entrenamiento personalizado (${getGoalText(goal)})`,
      description: `Plan de entrenamiento personalizado para ${
        gender === "male" ? "hombre" : "mujer"
      } con objetivo de ${getGoalText(
        goal
      )} y frecuencia de ${trainingFrequency} días por semana.`,
      userId: userId,
    },
  });

  // El resto de la función permanece igual
  const exercises = await getOrCreateExercises();

  let workoutExercises = [];

  if (trainingFrequency <= 3) {
    workoutExercises = await createFullBodyWorkout(
      workout.id,
      exercises,
      goal,
      gender
    );
  } else if (trainingFrequency <= 5) {
    workoutExercises = await createUpperLowerSplit(
      workout.id,
      exercises,
      goal,
      gender
    );
  } else {
    workoutExercises = await createPushPullLegsSplit(
      workout.id,
      exercises,
      goal,
      gender
    );
  }

  const workoutExercisesWithNames = await Promise.all(
    workoutExercises.map(async (exercise) => {
      const exerciseDetails = await prisma.exercise.findUnique({
        where: { id: exercise.exerciseId },
      });
      return {
        ...exercise,
        name: exerciseDetails ? exerciseDetails.name : "Ejercicio desconocido",
      };
    })
  );
  console.log(workoutExercises);
  console.log(workoutExercisesWithNames);

  return {
    id: workout.id,
    name: workout.name,
    description: workout.description,
    days: formatWorkoutPlan(workoutExercisesWithNames),
  };
}

// Actualizar la función para usar el modelo Profile
async function generateAndSaveNutritionPlan(profile) {
  const { userId, goal, dietaryPreference, gender, dailyCalorieTarget } =
    profile;

  // Obtener alimentos de la base de datos o crear nuevos si no existen
  const foods = await getOrCreateFoods(dietaryPreference);

  // Generar planes de comida para cada tipo de comida
  const breakfast = await createMealLog(
    userId,
    "breakfast",
    foods,
    goal,
    dietaryPreference,
    dailyCalorieTarget
  );
  const lunch = await createMealLog(
    userId,
    "lunch",
    foods,
    goal,
    dietaryPreference,
    dailyCalorieTarget
  );
  const dinner = await createMealLog(
    userId,
    "dinner",
    foods,
    goal,
    dietaryPreference,
    dailyCalorieTarget
  );
  const snacks = await createMealLog(
    userId,
    "snack",
    foods,
    goal,
    dietaryPreference,
    dailyCalorieTarget
  );

  // Devolver el plan completo

  return {
    macros: {
      protein: `${profile.dailyProteinTarget ?? 0}g (${Math.round(
        ((profile.dailyProteinTarget ?? 0 * 4) /
          (profile.dailyCalorieTarget ?? 1)) *
          100
      )}%)`,
      carbs: `${profile.dailyCarbTarget ?? 0}g (${Math.round(
        ((profile.dailyCarbTarget ?? 0 * 4) /
          (profile.dailyCalorieTarget ?? 1)) *
          100
      )}%)`,
      fat: `${profile.dailyFatTarget ?? 0}g (${Math.round(
        ((profile.dailyFatTarget ?? 0 * 9) /
          (profile.dailyCalorieTarget ?? 1)) *
          100
      )}%)`,
      description: `Basado en tu objetivo de ${getGoalText(
        goal
      )} y un consumo diario de ${profile.dailyCalorieTarget ?? 0} calorías`,
    },
    meals: {
      breakfast,
      lunch,
      dinner,
      snacks,
    },
  };
}

// Actualizar la función para considerar el objetivo calórico del perfil
async function createMealLog(
  userId,
  mealType,
  foods,
  goal,
  dietaryPreference,
  dailyCalorieTarget = 2000
) {
  // Seleccionar alimentos apropiados según el tipo de comida y preferencia dietética
  let selectedFoods = [];

  // El resto de la lógica de selección de alimentos permanece igual
  if (mealType === "breakfast") {
    const proteinFoods = foods.filter(
      (f) =>
        f.category === "proteína" &&
        f.name !== "Pechuga de pollo" &&
        f.name !== "Salmón"
    );
    const carbFoods = foods.filter(
      (f) =>
        f.category === "carbohidrato" &&
        (f.name === "Avena" || f.name === "Pan integral")
    );
    const fruitFoods = foods.filter((f) => f.category === "fruta");
    const fatFoods = foods.filter(
      (f) =>
        f.category === "grasa" &&
        (f.name === "Aguacate" || f.name === "Almendras")
    );

    selectedFoods = [
      proteinFoods[0],
      carbFoods[0],
      fruitFoods[0],
      fatFoods[0],
    ].filter(Boolean);
  } else if (mealType === "lunch") {
    const proteinFoods = foods.filter((f) => f.category === "proteína");
    const carbFoods = foods.filter(
      (f) => f.category === "carbohidrato" && f.name !== "Avena"
    );
    const vegFoods = foods.filter((f) => f.category === "verdura");
    const fatFoods = foods.filter(
      (f) => f.category === "grasa" && f.name === "Aceite de oliva"
    );

    selectedFoods = [
      proteinFoods[0],
      carbFoods[0],
      vegFoods[0],
      vegFoods[1],
      fatFoods[0],
    ].filter(Boolean);
  } else if (mealType === "dinner") {
    const proteinFoods = foods.filter((f) => f.category === "proteína");
    const vegFoods = foods.filter((f) => f.category === "verdura");
    const fatFoods = foods.filter((f) => f.category === "grasa");

    const carbFoods =
      dietaryPreference === "keto"
        ? []
        : foods.filter(
            (f) => f.category === "carbohidrato" && f.name !== "Avena"
          );

    selectedFoods = [
      proteinFoods[1] || proteinFoods[0],
      ...carbFoods.slice(0, 1),
      vegFoods[0],
      vegFoods[1],
      fatFoods[0],
    ].filter(Boolean);
  } else if (mealType === "snack") {
    const proteinFoods = foods.filter(
      (f) =>
        f.category === "proteína" &&
        (f.name === "Yogur griego" || f.name === "Huevos")
    );
    const fruitFoods = foods.filter((f) => f.category === "fruta");
    const nutFoods = foods.filter(
      (f) => f.category === "grasa" && f.name === "Almendras"
    );

    selectedFoods = [proteinFoods[0], fruitFoods[0], nutFoods[0]].filter(
      Boolean
    );
  }

  // Ajustar cantidades según el objetivo y las calorías diarias objetivo
  const multiplier = 1;

  // Distribuir las calorías según el tipo de comida
  const mealCaloriePercentage = {
    breakfast: 0.25, // 25% de las calorías diarias
    lunch: 0.35, // 35% de las calorías diarias
    dinner: 0.3, // 30% de las calorías diarias
    snack: 0.1, // 10% de las calorías diarias
  };

  // Ajustar el multiplicador según las calorías objetivo para este tipo de comida
  const targetMealCalories =
    dailyCalorieTarget * mealCaloriePercentage[mealType];

  // Calcular macros totales
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  // Crear entradas de comida
  const mealEntries = [];

  for (const food of selectedFoods) {
    // Ajustar la cantidad según la categoría y las calorías objetivo
    const baseQuantity =
      food.category === "proteína"
        ? 1
        : food.category === "carbohidrato"
        ? 1
        : 0.5;

    // Ajustar según el objetivo
    let quantity = baseQuantity;
    if (goal === "lose-weight") quantity *= 0.8;
    if (goal === "gain-muscle") quantity *= 1.2;

    totalCalories += food.calories * quantity;
    totalProtein += food.protein * quantity;
    totalCarbs += food.carbs * quantity;
    totalFat += food.fat * quantity;

    mealEntries.push({
      foodId: food.id,
      quantity,
    });
  }

  // Crear el registro de comida
  const mealLog = await prisma.mealLog.create({
    data: {
      userId,
      date: new Date(),
      mealType,
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      entries: {
        create: mealEntries,
      },
    },
    include: {
      entries: {
        include: {
          food: true,
        },
      },
    },
  });

  return mealLog;
}

// Función para formatear el plan de entrenamiento para la respuesta
function formatWorkoutPlan(workoutExercises) {
  // Agrupar ejercicios por día
  const exercisesByDay = workoutExercises.reduce((acc, ex) => {
    const day = ex.notes.split(":")[0].trim();
    if (!acc[day]) acc[day] = [];
    acc[day].push(ex);
    return acc;
  }, {});

  // Formatear cada día
  return Object.entries(exercisesByDay).map(([day, exercises]) => {
    return {
      day,
      exercises: exercises.map((ex) => ({
        id: ex.id,
        name: ex.name || "Ejercicio",
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime,
        notes: ex.notes.split(":").slice(1).join(":").trim(),
      })),
    };
  });
}

// Función para obtener la distribución de macros según el objetivo
function getMacrosDistribution(goal) {
  if (goal === "lose-weight") {
    return {
      protein: "40%",
      carbs: "30%",
      fat: "30%",
      description:
        "Mayor proporción de proteínas para preservar masa muscular durante el déficit calórico",
    };
  } else if (goal === "gain-muscle") {
    return {
      protein: "35%",
      carbs: "45%",
      fat: "20%",
      description:
        "Mayor proporción de carbohidratos para proporcionar energía para entrenamientos intensos",
    };
  } else {
    // maintain
    return {
      protein: "30%",
      carbs: "40%",
      fat: "30%",
      description:
        "Distribución equilibrada para mantener el peso y la composición corporal",
    };
  }
}

function getActivityLevelText(activityLevel) {
  switch (activityLevel) {
    case "sedentary":
      return "Sedentario (poco o ningún ejercicio)";
    case "light":
      return "Ligeramente activo (ejercicio ligero 1-3 días/semana)";
    case "moderate":
      return "Moderadamente activo (ejercicio moderado 3-5 días/semana)";
    case "active":
      return "Activo (ejercicio intenso 6-7 días/semana)";
    case "very-active":
      return "Muy activo (ejercicio muy intenso y trabajo físico)";
    default:
      return activityLevel;
  }
}

function getGoalText(goal) {
  switch (goal) {
    case "lose-weight":
      return "Perder peso";
    case "maintain":
      return "Mantener peso";
    case "gain-muscle":
      return "Ganar músculo";
    default:
      return goal;
  }
}
