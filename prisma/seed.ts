import { PrismaClient } from "@prisma/client";
import { foodsToCreate } from "../src/data/food";
import { exercises } from "../src/data/exercises";

const prisma = new PrismaClient();

// Configuración de qué partes del seed ejecutar
// Puedes cambiar estos valores a true/false para controlar qué se ejecuta
const SEED_CONFIG = {
  FOODS: process.env.SEED_FOODS !== "false", // Por defecto true
  EXERCISES: process.env.SEED_EXERCISES === "true", // Por defecto false, debe ser explícito
};

function getMealTypesForCategory(category: string): string[] {
  const mealTypes: Record<string, string[]> = {
    meat: ["desayuno", "almuerzo", "cena"],
    fish: ["almuerzo", "cena"],
    eggs: ["desayuno", "almuerzo", "cena", "snack"],
    dairy: ["desayuno", "almuerzo", "cena", "snack"],
    legumes: ["almuerzo", "cena"],
    plant_protein: ["almuerzo", "cena"],
    fruits: ["desayuno", "snack"],
    vegetables: ["almuerzo", "cena"],
    cereals: ["desayuno", "almuerzo", "cena"],
    pasta: ["almuerzo", "cena"],
    rice: ["almuerzo", "cena"],
    nuts: ["desayuno", "snack"],
    seeds: ["desayuno", "snack"],
    oils: ["desayuno", "almuerzo", "cena"],
    beverages: ["desayuno", "almuerzo", "cena", "snack"],
    supplements: ["desayuno", "almuerzo", "cena", "snack"],
    bars: ["snack"],
    other: ["desayuno", "almuerzo", "cena", "snack"],
  };

  return mealTypes[category] || ["desayuno", "almuerzo", "cena", "snack"];
}

// Función para comparar si dos arrays son iguales
function arraysEqual(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, index) => val === sorted2[index]);
}

// Función para comparar si dos alimentos son iguales (ignorando isFavorite)
function areFoodsEqual(
  existingFood: any,
  newFoodData: any,
  mealType: string[],
): boolean {
  const existingSynonyms = existingFood.synonyms || [];
  const newSynonyms = newFoodData.synonyms || [];
  const existingPortions = existingFood.predefinedPortions
    ? JSON.stringify(existingFood.predefinedPortions)
    : null;
  const newPortions = newFoodData.predefinedPortions
    ? JSON.stringify(newFoodData.predefinedPortions)
    : null;

  return (
    existingFood.name === newFoodData.name &&
    existingFood.calories === newFoodData.calories &&
    existingFood.protein === newFoodData.protein &&
    existingFood.carbs === newFoodData.carbs &&
    existingFood.fat === newFoodData.fat &&
    (existingFood.fiber || 0) === (newFoodData.fiber || 0) &&
    (existingFood.sugar || 0) === (newFoodData.sugar || 0) &&
    existingFood.serving === newFoodData.serving &&
    existingFood.category === newFoodData.category &&
    arraysEqual(existingFood.mealType || [], mealType) &&
    arraysEqual(existingSynonyms, newSynonyms) &&
    existingFood.servingUnit === (newFoodData.servingUnit || null) &&
    existingPortions === newPortions
  );
}

async function seedFoods() {
  if (!SEED_CONFIG.FOODS) {
    console.log("⏭️  Saltando seed de alimentos (SEED_FOODS=false)");
    return;
  }

  console.log("🌱 Iniciando seed de alimentos...");

  // Obtener alimentos existentes
  const existingFoods = await prisma.food.findMany({
    where: { userId: null },
  });

  console.log(`📊 Alimentos existentes: ${existingFoods.length}`);
  console.log(`📦 Alimentos en seed: ${foodsToCreate.length}`);

  let created = 0;
  let updated = 0;
  let unchanged = 0;

  // Procesar cada alimento del seed
  for (const { isFavorite, ...foodData } of foodsToCreate) {
    const mealType = getMealTypesForCategory(foodData.category);

    // Buscar si ya existe un alimento con el mismo nombre
    const existingFood = existingFoods.find(
      (f) => f.name.toLowerCase().trim() === foodData.name.toLowerCase().trim(),
    );

    if (existingFood) {
      // Verificar si necesita actualización
      const needsUpdate = !areFoodsEqual(existingFood, foodData, mealType);

      if (needsUpdate) {
        await prisma.food.update({
          where: { id: existingFood.id },
          data: {
            name: foodData.name,
            calories: foodData.calories,
            protein: foodData.protein,
            carbs: foodData.carbs,
            fat: foodData.fat,
            fiber: foodData.fiber ?? null,
            sugar: foodData.sugar ?? null,
            serving: foodData.serving,
            category: foodData.category,
            mealType,
            synonyms: foodData.synonyms || [],
            predefinedPortions: foodData.predefinedPortions
              ? JSON.parse(JSON.stringify(foodData.predefinedPortions))
              : null,
            servingUnit: foodData.servingUnit || null,
          },
        });
        updated++;
        console.log(`🔄 Actualizado: ${foodData.name}`);
      } else {
        unchanged++;
      }
    } else {
      // Crear nuevo alimento
      await prisma.food.create({
        data: {
          name: foodData.name,
          calories: foodData.calories,
          protein: foodData.protein,
          carbs: foodData.carbs,
          fat: foodData.fat,
          fiber: foodData.fiber ?? null,
          sugar: foodData.sugar ?? null,
          serving: foodData.serving,
          category: foodData.category,
          mealType,
          synonyms: foodData.synonyms || [],
          predefinedPortions: foodData.predefinedPortions
            ? JSON.parse(JSON.stringify(foodData.predefinedPortions))
            : null,
          servingUnit: foodData.servingUnit || null,
          userId: null, // Alimentos base del sistema
        },
      });
      created++;
      console.log(`✨ Creado: ${foodData.name}`);
    }
  }

  console.log("\n📈 Resumen de Alimentos:");
  console.log(`   ✨ Nuevos: ${created}`);
  console.log(`   🔄 Actualizados: ${updated}`);
  console.log(`   ✓ Sin cambios: ${unchanged}`);
}

async function seedExercises() {
  if (!SEED_CONFIG.EXERCISES) {
    console.log(
      "⏭️  Saltando seed de ejercicios (SEED_EXERCISES no está en 'true')",
    );
    return;
  }

  console.log("\n💪 Iniciando seed de ejercicios...");

  // Obtener ejercicios existentes
  const existingExercises = await prisma.exercise.findMany();

  console.log(`📊 Ejercicios existentes: ${existingExercises.length}`);
  console.log(`📦 Ejercicios en seed: ${exercises.length}`);

  let created = 0;
  let updated = 0;
  let unchanged = 0;

  // Procesar cada ejercicio del seed
  for (const exerciseData of exercises) {
    // Buscar si ya existe un ejercicio con el mismo nombre
    const existingExercise = existingExercises.find(
      (e) =>
        e.name.toLowerCase().trim() === exerciseData.name.toLowerCase().trim(),
    );

    if (existingExercise) {
      // Verificar si necesita actualización
      const needsUpdate =
        existingExercise.description !== exerciseData.description ||
        existingExercise.muscleGroup !== exerciseData.muscleGroup ||
        existingExercise.equipment !== (exerciseData.equipment || null);

      if (needsUpdate) {
        await prisma.exercise.update({
          where: { id: existingExercise.id },
          data: {
            name: exerciseData.name,
            description: exerciseData.description || null,
            muscleGroup: exerciseData.muscleGroup,
            equipment: exerciseData.equipment || null,
          },
        });
        updated++;
        console.log(`🔄 Actualizado: ${exerciseData.name}`);
      } else {
        unchanged++;
      }
    } else {
      // Crear nuevo ejercicio
      await prisma.exercise.create({
        data: {
          name: exerciseData.name,
          description: exerciseData.description || null,
          muscleGroup: exerciseData.muscleGroup,
          equipment: exerciseData.equipment || null,
        },
      });
      created++;
      console.log(`✨ Creado: ${exerciseData.name}`);
    }
  }

  console.log("\n📈 Resumen de Ejercicios:");
  console.log(`   ✨ Nuevos: ${created}`);
  console.log(`   🔄 Actualizados: ${updated}`);
  console.log(`   ✓ Sin cambios: ${unchanged}`);
}

async function main() {
  console.log("🚀 Iniciando seed...\n");
  console.log("📋 Configuración:");
  console.log(`   - Alimentos: ${SEED_CONFIG.FOODS ? "✅" : "❌"}`);
  console.log(`   - Ejercicios: ${SEED_CONFIG.EXERCISES ? "✅" : "❌"}`);
  console.log(
    "\n💡 Para ejecutar solo ejercicios: SEED_EXERCISES=true npm run seed",
  );
  console.log("💡 Para ejecutar solo alimentos: SEED_FOODS=true npm run seed");
  console.log("💡 Para ejecutar ambos: npm run seed (o sin variables)\n");

  await seedFoods();
  await seedExercises();

  console.log(`\n✨ Seed completado!`);
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
