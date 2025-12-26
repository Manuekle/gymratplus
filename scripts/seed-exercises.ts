#!/usr/bin/env tsx
/**
 * Exercise Data Seed Script
 * 
 * Seeds only exercise data into the database.
 * 
 * Usage:
 *   npm run seed:exercises
 */

import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { exercises } from "../src/data/exercises";

// Load environment variables
config({ path: [".env.local", ".env"] });

const prisma = new PrismaClient();

async function main() {
    console.log("💪 Starting exercise data seeding...\n");

    let created = 0;
    let skipped = 0;
    let errors = 0;

    try {
        await prisma.$connect();
        console.log("✅ Database connected\n");

        for (const exercise of exercises) {
            try {
                // Check if exercise already exists
                const existing = await prisma.exercise.findFirst({
                    where: { name: exercise.name },
                });

                if (existing) {
                    skipped++;
                    process.stdout.write(".");
                    continue;
                }

                // Create exercise
                await prisma.exercise.create({
                    data: {
                        name: exercise.name,
                        description: exercise.description,
                        muscleGroup: exercise.muscleGroup,
                        equipment: exercise.equipment || "peso corporal",
                        difficulty: "intermediate",
                    },
                });

                created++;
                process.stdout.write("✓");

                if ((created + skipped) % 50 === 0) {
                    console.log(` ${created + skipped}/${exercises.length}`);
                }
            } catch (error) {
                errors++;
                process.stdout.write("✗");
                console.error(`\n  Error with "${exercise.name}":`, error);
            }
        }

        console.log("\n\n" + "=".repeat(50));
        console.log("📊 EXERCISE SEEDING SUMMARY");
        console.log("=".repeat(50));
        console.log(`✅ Created:  ${created}`);
        console.log(`⏭️  Skipped:  ${skipped}`);
        console.log(`❌ Errors:   ${errors}`);
        console.log(`📊 Total:    ${exercises.length}`);
        console.log("=".repeat(50));

    } catch (error) {
        console.error("\n❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
