/**
 * Script to check meal logs for a user
 * Usage: npx tsx scripts/check-meal-logs.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkMealLogs() {
    try {
        console.log("🔍 Checking meal logs...\n");

        // Get the user
        const user = await prisma.user.findFirst({
            where: {
                email: "elustondo129@gmail.com",
            },
        });

        if (!user) {
            console.log("❌ User not found");
            return;
        }

        console.log(`✅ User found: ${user.name} (${user.email})`);
        console.log(`   User ID: ${user.id}\n`);

        // Check meal logs
        const mealLogs = await prisma.mealLog.findMany({
            where: {
                userId: user.id,
            },
            include: {
                food: true,
                recipe: true,
            },
            orderBy: {
                consumedAt: "desc",
            },
            take: 10,
        });

        console.log(`📊 Total meal logs: ${mealLogs.length}\n`);

        if (mealLogs.length === 0) {
            console.log("ℹ️  No meal logs found for this user");
            console.log("   This is why the nutrition page shows an error.\n");
        } else {
            console.log("Recent meal logs:");
            mealLogs.forEach((log, index) => {
                console.log(`\n${index + 1}. ${log.mealType}`);
                console.log(`   Date: ${log.consumedAt}`);
                console.log(`   Food: ${log.food?.name || log.recipe?.name || log.customName || "N/A"}`);
                console.log(`   Calories: ${log.calories}`);
                console.log(`   Protein: ${log.protein}g | Carbs: ${log.carbs}g | Fat: ${log.fat}g`);
            });
        }

        // Check if there are any foods in the database
        const foodCount = await prisma.food.count();
        console.log(`\n📦 Total foods in database: ${foodCount}`);

        // Check if there are any recipes
        const recipeCount = await prisma.recipe.count();
        console.log(`📦 Total recipes in database: ${recipeCount}`);

    } catch (error) {
        console.error("\n❌ Error:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
checkMealLogs()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
