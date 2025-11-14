import { PrismaClient } from "@prisma/client";
import { foodsToCreate } from "../src/data/food";

const prisma = new PrismaClient();

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
    arraysEqual(existingFood.mealType || [], mealType)
  );
}

async function main() {
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
            ...foodData,
            mealType,
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
          ...foodData,
          mealType,
          userId: null, // Alimentos base del sistema
        },
      });
      created++;
      console.log(`✨ Creado: ${foodData.name}`);
    }
  }

  console.log("\n📈 Resumen:");
  console.log(`   ✨ Nuevos: ${created}`);
  console.log(`   🔄 Actualizados: ${updated}`);
  console.log(`   ✓ Sin cambios: ${unchanged}`);
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
