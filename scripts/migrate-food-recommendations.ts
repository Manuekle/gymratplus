/**
 * Script de migración para convertir FoodRecommendation de JSON a estructura normalizada
 *
 * Este script:
 * 1. Lee todos los FoodRecommendation con datos en formato JSON
 * 2. Crea las nuevas tablas MealPlanMeal y MealPlanEntry
 * 3. Migra los datos manteniendo compatibilidad
 *
 * Uso: npx tsx scripts/migrate-food-recommendations.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface LegacyMeal {
  entries: Array<{
    foodId: string;
    quantity: number;
    food?: {
      id: string;
      name: string;
      category: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      serving: number;
      servingUnit?: string | null;
    };
  }>;
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
}

interface LegacyMeals {
  breakfast?: LegacyMeal;
  lunch?: LegacyMeal;
  dinner?: LegacyMeal;
  snacks?: LegacyMeal;
}

interface LegacyMacros {
  protein?: string;
  carbs?: string;
  fat?: string;
  description?: string;
}

async function migrateFoodRecommendations() {
  console.log("🚀 Iniciando migración de FoodRecommendation...\n");

  try {
    // Primero verificar si las columnas legacy existen
    const columnCheck = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'FoodRecommendation' 
      AND column_name IN ('macros', 'meals')
    `;

    const hasLegacyColumns = columnCheck.length > 0;

    if (!hasLegacyColumns) {
      console.log(
        "ℹ️  Las columnas legacy (macros, meals) ya no existen en la base de datos.",
      );
      console.log("ℹ️  Esto significa que:");
      console.log("   1. La migración de schema ya se aplicó, O");
      console.log("   2. Los datos ya fueron migrados previamente");
      console.log(
        "\n✅ No hay nada que migrar. El script finaliza exitosamente.\n",
      );
      return;
    }

    console.log(
      "✅ Columnas legacy encontradas. Procediendo con la migración...\n",
    );

    // Usar SQL raw para leer los campos legacy
    const recommendationsRaw = await prisma.$queryRaw<
      Array<{
        id: string;
        userId: string;
        instructorId: string | null;
        assignedToId: string | null;
        date: Date;
        macros: string | null;
        meals: string | null;
        calorieTarget: number;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
      }>
    >`
      SELECT 
        id, 
        "userId", 
        "instructorId", 
        "assignedToId", 
        date, 
        macros, 
        meals, 
        "calorieTarget", 
        notes, 
        "createdAt", 
        "updatedAt"
      FROM "FoodRecommendation"
      WHERE meals IS NOT NULL
    `;

    console.log(
      `📊 Encontrados ${recommendationsRaw.length} planes para migrar\n`,
    );

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const recRaw of recommendationsRaw) {
      try {
        // Verificar si ya fue migrado (tiene mealPlanMeals)
        const existingMeals = await prisma.mealPlanMeal.findFirst({
          where: { foodRecommendationId: recRaw.id },
        });

        if (existingMeals) {
          console.log(`⏭️  Plan ${recRaw.id} ya migrado, saltando...`);
          skipped++;
          continue;
        }

        // Parsear JSON legacy desde string
        let mealsJson: LegacyMeals | null = null;
        let macrosJson: LegacyMacros | null = null;

        try {
          mealsJson = recRaw.meals ? JSON.parse(recRaw.meals) : null;
          macrosJson = recRaw.macros ? JSON.parse(recRaw.macros) : null;
        } catch (parseError) {
          console.log(
            `⚠️  Error parseando JSON del plan ${recRaw.id}, saltando...`,
          );
          skipped++;
          continue;
        }

        if (!mealsJson) {
          console.log(
            `⚠️  Plan ${recRaw.id} no tiene datos de meals, saltando...`,
          );
          skipped++;
          continue;
        }

        // Extraer macros si están en formato legacy
        let proteinTarget: number | undefined;
        let carbsTarget: number | undefined;
        let fatTarget: number | undefined;
        let description: string | undefined;

        if (macrosJson) {
          // Intentar extraer valores numéricos de strings como "224g (39%)"
          if (macrosJson.protein) {
            const proteinMatch = macrosJson.protein.match(/(\d+(?:\.\d+)?)/);
            if (proteinMatch) {
              proteinTarget = parseFloat(proteinMatch[1]);
            }
          }
          if (macrosJson.carbs) {
            const carbsMatch = macrosJson.carbs.match(/(\d+(?:\.\d+)?)/);
            if (carbsMatch) {
              carbsTarget = parseFloat(carbsMatch[1]);
            }
          }
          if (macrosJson.fat) {
            const fatMatch = macrosJson.fat.match(/(\d+(?:\.\d+)?)/);
            if (fatMatch) {
              fatTarget = parseFloat(fatMatch[1]);
            }
          }
          description = macrosJson.description;
        }

        // Actualizar FoodRecommendation con nuevos campos
        await prisma.foodRecommendation.update({
          where: { id: recRaw.id },
          data: {
            proteinTarget,
            carbsTarget,
            fatTarget,
            description,
          },
        });

        // Mapeo de tipos de comida
        const mealTypeMap: Record<string, string> = {
          breakfast: "breakfast",
          lunch: "lunch",
          dinner: "dinner",
          snacks: "snacks",
        };

        // Migrar cada tipo de comida
        for (const [mealKey, mealType] of Object.entries(mealTypeMap)) {
          const meal = mealsJson[mealKey as keyof LegacyMeals];
          if (!meal || !meal.entries || meal.entries.length === 0) {
            continue;
          }

          // Crear MealPlanMeal
          const mealPlanMeal = await prisma.mealPlanMeal.create({
            data: {
              foodRecommendationId: recRaw.id,
              mealType,
              order: Object.keys(mealTypeMap).indexOf(mealKey),
            },
          });

          // Migrar entries
          for (let idx = 0; idx < meal.entries.length; idx++) {
            const entry = meal.entries[idx];

            // Verificar que el foodId existe
            if (!entry.foodId) {
              console.log(
                `⚠️  Entry sin foodId en plan ${recRaw.id}, comida ${mealKey}, saltando...`,
              );
              continue;
            }

            // Verificar que el alimento existe en la base de datos
            const foodExists = await prisma.food.findUnique({
              where: { id: entry.foodId },
            });

            if (!foodExists) {
              console.log(
                `⚠️  Alimento ${entry.foodId} no existe en la BD (plan ${recRaw.id}, comida ${mealKey}), saltando entry...`,
              );
              continue;
            }

            // Crear MealPlanEntry
            await prisma.mealPlanEntry.create({
              data: {
                mealPlanMealId: mealPlanMeal.id,
                foodId: entry.foodId,
                quantity: entry.quantity || 0,
                order: idx,
              },
            });
          }
        }

        migrated++;
        console.log(`✅ Plan ${recRaw.id} migrado exitosamente`);

        // Mostrar progreso cada 10 planes
        if (migrated % 10 === 0) {
          console.log(
            `\n📈 Progreso: ${migrated} migrados, ${skipped} saltados, ${errors} errores\n`,
          );
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error migrando plan ${recRaw.id}:`, error);
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
migrateFoodRecommendations()
  .then(() => {
    console.log("\n🎉 Migración finalizada exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Error en la migración:", error);
    process.exit(1);
  });
