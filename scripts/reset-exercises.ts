
import { prisma } from "../src/lib/database/prisma";
import { exercises } from "../src/data/exercises";

async function main() {
    console.log("Starting Exercise Database Reset...");

    // 1. Upsert Exercises (Update if exists, Create if not)
    console.log(`Processing ${exercises.length} exercises from source file...`);

    const processedNames = new Set<string>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const exercise of exercises) {
        if (processedNames.has(exercise.name.toLowerCase())) {
            console.warn(`Duplicate exercise in source file skipping: ${exercise.name}`);
            continue;
        }
        processedNames.add(exercise.name.toLowerCase());

        const existing = await prisma.exercise.findFirst({
            where: {
                name: { equals: exercise.name, mode: "insensitive" }
            }
        });

        if (existing) {
            // Update
            await prisma.exercise.update({
                where: { id: existing.id },
                data: {
                    description: exercise.description,
                    muscleGroup: exercise.muscleGroup,
                    equipment: exercise.equipment,
                    // Preserve other fields if needed, or overwrite them? 
                    // Using source file as source of truth for these fields.
                }
            });
            updatedCount++;
        } else {
            // Create
            await prisma.exercise.create({
                data: {
                    name: exercise.name,
                    description: exercise.description,
                    muscleGroup: exercise.muscleGroup,
                    equipment: exercise.equipment,
                }
            });
            createdCount++;
        }
    }

    console.log(`Upsert Complete: ${createdCount} created, ${updatedCount} updated.`);

    // 2. Prune Exercises NOT in source file
    // Be careful with Foreign Keys. We catch errors.
    console.log("Checking for obsolete exercises...");

    const allExercises = await prisma.exercise.findMany();
    const sourceNamesLower = new Set(exercises.map(e => e.name.toLowerCase()));

    let deletedCount = 0;
    let skippedCount = 0;

    for (const ex of allExercises) {
        if (!sourceNamesLower.has(ex.name.toLowerCase())) {
            // Candidate for deletion
            try {
                await prisma.exercise.delete({
                    where: { id: ex.id }
                });
                console.log(`Deleted obsolete exercise: ${ex.name}`);
                deletedCount++;
            } catch (error) {
                // Likely FK constraint
                console.warn(`Could not delete "${ex.name}" (likely in use): ${(error as any).code}`);
                skippedCount++;
            }
        }
    }

    console.log(`Pruning Complete: ${deletedCount} deleted, ${skippedCount} skipped (in use).`);
    console.log("Reset finished successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
