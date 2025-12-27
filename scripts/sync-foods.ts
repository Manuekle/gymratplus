/**
 * Script to sync foods from data file to database
 * Usage: npx tsx scripts/sync-foods.ts
 */

import { PrismaClient } from "@prisma/client";
import { foodsToCreate } from "../src/data/food";

const prisma = new PrismaClient();

async function syncFoods() {
    try {
        console.log("🔄 Syncing foods to database...\n");

        const existingFoods = await prisma.food.findMany({
            where: { userId: null },
        });

        console.log(`📊 Current foods in database: ${existingFoods.length}`);
        console.log(`📊 Foods in data file: ${foodsToCreate.length}\n`);

        let added = 0;
        let skipped = 0;

        for (const foodData of foodsToCreate) {
            // Check if food already exists
            const exists = existingFoods.some(
                (f) => f.name === foodData.name && f.category === foodData.category
            );

            if (exists) {
                skipped++;
                continue;
            }

            // Determine meal types for this food
            const getMealTypesForCategory = (category: string): string[] => {
                const mealTypeMap: Record<string, string[]> = {
                    meat: ["lunch", "dinner"],
                    fish: ["lunch", "dinner"],
                    eggs: ["breakfast", "lunch", "dinner"],
                    dairy: ["breakfast", "snack"],
                    legumes: ["lunch", "dinner"],
                    plant_protein: ["lunch", "dinner"],
                    cereals: ["breakfast"],
                    pasta: ["lunch", "dinner"],
                    rice: ["lunch", "dinner"],
                    bars: ["snack"],
                    vegetables: ["lunch", "dinner"],
                    fruits: ["breakfast", "snack"],
                    nuts: ["snack"],
                    seeds: ["snack", "breakfast"],
                    oils: ["lunch", "dinner"],
                    beverages: ["breakfast", "snack"],
                    supplements: ["breakfast", "snack"],
                    other: ["breakfast", "lunch", "dinner", "snack"],
                };

                return mealTypeMap[category] || ["breakfast", "lunch", "dinner", "snack"];
            };

            const mealType = getMealTypesForCategory(foodData.category);

            await prisma.food.create({
                data: {
                    name: foodData.name,
                    calories: foodData.calories,
                    protein: foodData.protein,
                    carbs: foodData.carbs,
                    fat: foodData.fat,
                    fiber: foodData.fiber,
                    sugar: foodData.sugar,
                    serving: foodData.serving,
                    category: foodData.category,
                    mealType,
                    synonyms: foodData.synonyms,
                    predefinedPortions: foodData.predefinedPortions as any,
                    servingUnit: foodData.servingUnit,
                    userId: null,
                },
            });

            added++;
            console.log(`✅ Added: ${foodData.name}`);
        }

        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Added: ${added}`);
        console.log(`   ⏭️  Skipped (already exists): ${skipped}`);
        console.log(`   📦 Total in database: ${existingFoods.length + added}`);

    } catch (error) {
        console.error("\n❌ Error:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
syncFoods()
    .then(() => {
        console.log("\n✅ Sync completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
