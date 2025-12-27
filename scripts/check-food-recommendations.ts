/**
 * Script to check food recommendations for a user
 * Usage: npx tsx scripts/check-food-recommendations.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkFoodRecommendations() {
    try {
        console.log("🔍 Checking food recommendations...\n");

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

        // Check food recommendations
        const foodRecommendations = await prisma.foodRecommendation.findMany({
            where: {
                userId: user.id,
            },
            include: {
                mealPlanMeals: {
                    include: {
                        entries: {
                            include: {
                                food: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        console.log(`📊 Total food recommendations: ${foodRecommendations.length}\n`);

        if (foodRecommendations.length === 0) {
            console.log("ℹ️  No food recommendations found for this user");
            console.log("   Generate a nutrition plan first.\n");
            return;
        }

        foodRecommendations.forEach((rec, index) => {
            console.log(`\n${index + 1}. Food Recommendation`);
            console.log(`   ID: ${rec.id}`);
            console.log(`   Created: ${rec.createdAt}`);
            console.log(`   Calorie Target: ${rec.calorieTarget}`);
            console.log(`   Protein Target: ${rec.proteinTarget}g`);
            console.log(`   Carbs Target: ${rec.carbsTarget}g`);
            console.log(`   Fat Target: ${rec.fatTarget}g`);
            console.log(`   Description: ${rec.description || "N/A"}`);
            console.log(`   \n   Meals (${rec.mealPlanMeals.length}):`);

            if (rec.mealPlanMeals.length === 0) {
                console.log("      ⚠️  NO MEALS FOUND - This is the problem!");
            } else {
                rec.mealPlanMeals.forEach((meal) => {
                    console.log(`      - ${meal.mealType} (${meal.entries.length} entries)`);
                    meal.entries.forEach((entry) => {
                        console.log(`         • ${entry.food.name}: ${entry.quantity}g`);
                    });
                });
            }
        });

    } catch (error) {
        console.error("\n❌ Error:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
checkFoodRecommendations()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
