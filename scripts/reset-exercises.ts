import { prisma } from "../src/lib/database/prisma";
import { exercises } from "../src/data/exercises";

async function main() {
    console.log("🗑️  Starting COMPLETE Exercise Database Reset...");
    console.log("⚠️  WARNING: This will DELETE ALL exercises and insert fresh data!");

    try {
        // Step 1: Delete ALL exercises from database
        console.log("\n📊 Deleting all existing exercises...");
        const deleteResult = await prisma.exercise.deleteMany({});
        console.log(`✅ Deleted ${deleteResult.count} exercises from database`);

        // Step 2: Insert fresh exercises from source file
        console.log(`\n📥 Inserting ${exercises.length} exercises from source file...`);

        let insertedCount = 0;
        const errors: string[] = [];

        for (const exercise of exercises) {
            try {
                await prisma.exercise.create({
                    data: {
                        name: exercise.name,
                        description: exercise.description,
                        muscleGroup: exercise.muscleGroup,
                        equipment: exercise.equipment,
                    },
                });
                insertedCount++;

                // Progress indicator every 20 exercises
                if (insertedCount % 20 === 0) {
                    console.log(`   ... ${insertedCount}/${exercises.length} inserted`);
                }
            } catch (error) {
                const errorMsg = `Failed to insert "${exercise.name}": ${error instanceof Error ? error.message : "Unknown error"}`;
                errors.push(errorMsg);
                console.error(`❌ ${errorMsg}`);
            }
        }

        console.log(`\n✅ Successfully inserted ${insertedCount}/${exercises.length} exercises`);

        if (errors.length > 0) {
            console.log(`\n⚠️  ${errors.length} errors occurred:`);
            errors.forEach(err => console.log(`   - ${err}`));
        }

        console.log("\n🎉 Database reset complete!");
    } catch (error) {
        console.error("\n❌ Fatal error during reset:", error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
