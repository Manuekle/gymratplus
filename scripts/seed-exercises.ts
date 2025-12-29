import { PrismaClient } from "@prisma/client";
import { exercises } from "../src/data/exercises";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function seedExercises() {
  console.log("🚀 Starting Exercise Seed from local data...");

  try {
    let created = 0;
    let skipped = 0;

    for (const exercise of exercises) {
      // Check if exercise already exists by name
      const existing = await prisma.exercise.count({
        where: { name: exercise.name },
      });

      if (existing > 0) {
        skipped++;
        continue;
      }

      await prisma.exercise.create({
        data: {
          id: nanoid(),
          name: exercise.name,
          description: exercise.description || null,
          muscleGroup: exercise.muscleGroup,
          equipment: exercise.equipment || null,
        },
      });
      created++;

      if (created % 20 === 0) {
        console.log(`💾 Created ${created} exercises...`);
      }
    }

    console.log("\n==================================================");
    console.log("📊 EXERCISE SEEDING SUMMARY");
    console.log("==================================================");
    console.log(`✅ Created:  ${created}`);
    console.log(`⏭️  Skipped:  ${skipped}`);
    console.log(`📊 Total:    ${exercises.length}`);
    console.log("==================================================\n");
  } catch (error) {
    console.error("❌ Fatal Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedExercises();
