/**
 * Script para eliminar todos los planes de alimentación (FoodRecommendation)
 *
 * ⚠️ ADVERTENCIA: Este script eliminará TODOS los planes de alimentación
 * y sus datos relacionados (MealPlanMeal, MealPlanEntry)
 *
 * Uso: npx tsx scripts/delete-all-food-recommendations.ts
 */

import { prisma } from "@/lib/database/prisma";

async function deleteAllFoodRecommendations() {
  console.log(
    "⚠️  ADVERTENCIA: Este script eliminará TODOS los planes de alimentación\n",
  );
  console.log("🚀 Iniciando eliminación de planes de alimentación...\n");

  try {
    // Primero contar cuántos planes hay
    const count = await prisma.foodRecommendation.count();
    console.log(
      `📊 Encontrados ${count} planes de alimentación para eliminar\n`,
    );

    if (count === 0) {
      console.log("✅ No hay planes de alimentación para eliminar.\n");
      return;
    }

    // Eliminar en cascada: primero las entradas, luego las comidas, luego los planes
    // Como tenemos onDelete: Cascade en el schema, solo necesitamos eliminar los planes principales

    // Contar entradas relacionadas
    const mealPlanMealsCount = await prisma.mealPlanMeal.count();
    const mealPlanEntriesCount = await prisma.mealPlanEntry.count();

    console.log(`📊 Datos relacionados:`);
    console.log(`   - MealPlanMeal: ${mealPlanMealsCount}`);
    console.log(`   - MealPlanEntry: ${mealPlanEntriesCount}\n`);

    console.log("🗑️  Eliminando planes de alimentación...\n");

    // Eliminar todos los planes (las relaciones se eliminan automáticamente por cascade)
    const result = await prisma.foodRecommendation.deleteMany({});

    console.log(`✅ Eliminados ${result.count} planes de alimentación\n`);

    // Verificar que se eliminaron correctamente
    const remainingCount = await prisma.foodRecommendation.count();
    const remainingMeals = await prisma.mealPlanMeal.count();
    const remainingEntries = await prisma.mealPlanEntry.count();

    console.log("📊 Verificación:");
    console.log(`   - FoodRecommendation restantes: ${remainingCount}`);
    console.log(`   - MealPlanMeal restantes: ${remainingMeals}`);
    console.log(`   - MealPlanEntry restantes: ${remainingEntries}\n`);

    if (
      remainingCount === 0 &&
      remainingMeals === 0 &&
      remainingEntries === 0
    ) {
      console.log(
        "✅ Todos los planes de alimentación y datos relacionados han sido eliminados exitosamente\n",
      );
    } else {
      console.log("⚠️  Algunos datos aún permanecen en la base de datos\n");
    }
  } catch (error) {
    console.error("❌ Error eliminando planes de alimentación:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar eliminación
deleteAllFoodRecommendations()
  .then(() => {
    console.log("🎉 Proceso finalizado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Error en el proceso:", error);
    process.exit(1);
  });
