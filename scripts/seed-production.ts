#!/usr/bin/env tsx
/**
 * Production Database Seed Script
 * 
 * This script seeds the production database with food and exercise data.
 * 
 * Usage:
 *   npm run seed:prod
 * 
 * Or directly:
 *   DATABASE_URL="your-production-url" tsx scripts/seed-production.ts
 */

import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { foodsToCreate } from "../src/data/food";
import { exercises } from "../src/data/exercises";

// Load environment variables
config({ path: [".env.local", ".env"] });

const prisma = new PrismaClient();

async function seedFood() {
    console.log("🍎 Starting food data seeding...");

    let created = 0;
    let skipped = 0;

    for (const food of foodsToCreate) {
        try {
            // Check if food already exists by name
            const existing = await prisma.food.findFirst({
                where: { name: food.name },
            });

            if (existing) {
                skipped++;
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
                    mealType: [], // Will be set based on usage
                    synonyms: food.synonyms || [],
                    servingUnit: food.servingUnit || "g",
                },
            });

            created++;

            if (created % 10 === 0) {
                console.log(`  ✓ Created ${created} food items...`);
            }
        } catch (error) {
            console.error(`  ✗ Error creating food "${food.name}":`, error);
        }
    }

    console.log(`✅ Food seeding complete: ${created} created, ${skipped} skipped`);
    return { created, skipped };
}

async function seedExercises() {
    console.log("\n💪 Starting exercise data seeding...");

    let created = 0;
    let skipped = 0;

    for (const exercise of exercises) {
        try {
            // Check if exercise already exists by name
            const existing = await prisma.exercise.findFirst({
                where: { name: exercise.name },
            });

            if (existing) {
                skipped++;
                continue;
            }

            // Create exercise
            await prisma.exercise.create({
                data: {
                    name: exercise.name,
                    description: exercise.description,
                    muscleGroup: exercise.muscleGroup,
                    equipment: exercise.equipment || "peso corporal",
                    difficulty: "intermediate", // Default difficulty
                },
            });

            created++;

            if (created % 10 === 0) {
                console.log(`  ✓ Created ${created} exercises...`);
            }
        } catch (error) {
            console.error(`  ✗ Error creating exercise "${exercise.name}":`, error);
        }
    }

    console.log(`✅ Exercise seeding complete: ${created} created, ${skipped} skipped`);
    return { created, skipped };
}

async function main() {
    console.log("🚀 Starting production database seeding...\n");
    console.log(`📊 Database: ${process.env.DATABASE_URL?.substring(0, 30)}...`);
    console.log(`📅 Date: ${new Date().toISOString()}\n`);

    try {
        // Test database connection
        await prisma.$connect();
        console.log("✅ Database connection successful\n");

        // Seed food data
        const foodStats = await seedFood();

        // Seed exercise data
        const exerciseStats = await seedExercises();

        // Summary
        console.log("\n" + "=".repeat(50));
        console.log("📊 SEEDING SUMMARY");
        console.log("=".repeat(50));
        console.log(`🍎 Food Items:     ${foodStats.created} created, ${foodStats.skipped} skipped`);
        console.log(`💪 Exercises:      ${exerciseStats.created} created, ${exerciseStats.skipped} skipped`);
        console.log(`📈 Total Created:  ${foodStats.created + exerciseStats.created}`);
        console.log(`⏭️  Total Skipped:  ${foodStats.skipped + exerciseStats.skipped}`);
        console.log("=".repeat(50));
        console.log("\n✅ Seeding completed successfully!");

    } catch (error) {
        console.error("\n❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
