#!/usr/bin/env tsx
/**
 * Food Data Seed Script
 * 
 * Seeds only food data into the database.
 * 
 * Usage:
 *   npm run seed:food
 */

import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { foodsToCreate } from "../src/data/food";

// Load environment variables
config({ path: [".env.local", ".env"] });

const prisma = new PrismaClient();

async function main() {
    console.log("🍎 Starting food data seeding...\n");

    let created = 0;
    let skipped = 0;
    let errors = 0;

    try {
        await prisma.$connect();
        console.log("✅ Database connected\n");

        for (const food of foodsToCreate) {
            try {
                // Check if food already exists
                const existing = await prisma.food.findFirst({
                    where: { name: food.name },
                });

                if (existing) {
                    skipped++;
                    process.stdout.write(".");
                    continue;
                }

                // Create food item
                await prisma.food.create({
                    data: {
                        name: food.name,
                        calories: food.calories,
                        protein: food.protein,
                        carbs: food.carbs,
                        fat: food.fat,
                        fiber: food.fiber || 0,
                        sugar: food.sugar || 0,
                        serving: food.serving,
                        category: food.category,
                        mealType: [],
                        synonyms: food.synonyms || [],
                        servingUnit: food.servingUnit || "g",
                    },
                });

                created++;
                process.stdout.write("✓");

                if ((created + skipped) % 50 === 0) {
                    console.log(` ${created + skipped}/${foodsToCreate.length}`);
                }
            } catch (error) {
                errors++;
                process.stdout.write("✗");
                console.error(`\n  Error with "${food.name}":`, error);
            }
        }

        console.log("\n\n" + "=".repeat(50));
        console.log("📊 FOOD SEEDING SUMMARY");
        console.log("=".repeat(50));
        console.log(`✅ Created:  ${created}`);
        console.log(`⏭️  Skipped:  ${skipped}`);
        console.log(`❌ Errors:   ${errors}`);
        console.log(`📊 Total:    ${foodsToCreate.length}`);
        console.log("=".repeat(50));

    } catch (error) {
        console.error("\n❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
