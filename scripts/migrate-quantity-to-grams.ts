/**
 * Script para migrar quantity de servings a gramos en MealPlanEntry
 *
 * Este script convierte todos los quantity que están en servings (formato antiguo)
 * a gramos (formato nuevo estandarizado)
 *
 * Uso: npx tsx scripts/migrate-quantity-to-grams.ts
 */

import { prisma } from "@/lib/database/prisma";

async function migrateQuantityToGrams() {
  console.log("🚀 Iniciando migración de quantity a gramos...\n");

  try {
    // Obtener todos los MealPlanEntry
    const entries = await prisma.mealPlanEntry.findMany({
      include: {
        food: true,
      },
    });

    console.log(`📊 Encontrados ${entries.length} entries para verificar\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const entry of entries) {
      try {
        const food = entry.food;
        if (!food) {
          console.log(
            `⚠️  Entry ${entry.id} sin alimento asociado, saltando...`,
          );
          skipped++;
          continue;
        }

        const servingSize = food.serving || 100;

        // Si quantity es menor que servingSize, probablemente ya está en gramos
        // Si quantity es mayor o igual a servingSize y es múltiplo, probablemente está en servings
        // Por seguridad, verificamos si quantity parece estar en servings (valores típicos: 0.5, 1.0, 1.5, 2.0, etc.)
        // y si al multiplicar por servingSize da un valor razonable

        // Heurística: si quantity < servingSize/2, probablemente ya está en gramos
        // Si quantity >= servingSize/2 y es un número "redondo" (múltiplo de 0.1 o 0.5), probablemente está en servings

        const isLikelyInServings =
          entry.quantity < servingSize / 2 &&
          entry.quantity > 0.1 &&
          entry.quantity < 10 &&
          (entry.quantity % 0.1 < 0.01 || entry.quantity % 0.5 < 0.01);

        if (!isLikelyInServings) {
          // Probablemente ya está en gramos
          skipped++;
          continue;
        }

        // Convertir de servings a gramos
        const quantityInGrams = entry.quantity * servingSize;

        await prisma.mealPlanEntry.update({
          where: { id: entry.id },
          data: {
            quantity: quantityInGrams,
          },
        });

        migrated++;
        if (migrated % 10 === 0) {
          console.log(
            `📈 Progreso: ${migrated} migrados, ${skipped} saltados, ${errors} errores\n`,
          );
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error migrando entry ${entry.id}:`, error);
      }
    }

    console.log("\n✨ Migración completada!");
    console.log(`✅ Migrados: ${migrated}`);
    console.log(`⏭️  Saltados: ${skipped}`);
    console.log(`❌ Errores: ${errors}`);
  } catch (error) {
    console.error("❌ Error fatal en la migración:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrateQuantityToGrams()
  .then(() => {
    console.log("\n🎉 Migración finalizada exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Error en la migración:", error);
    process.exit(1);
  });
