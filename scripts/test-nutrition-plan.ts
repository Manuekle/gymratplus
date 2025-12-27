/**
 * Script to test nutrition plan generation
 * Usage: npx tsx scripts/test-nutrition-plan.ts
 */

import { createNutritionPlan } from "../src/lib/nutrition/nutrition-utils";

async function testNutritionPlan() {
    try {
        console.log("🧪 Testing nutrition plan generation...\n");

        const profile = {
            userId: "cmjnh1end00001bflu3xk61rr",
            goal: "gain-muscle",
            dietaryPreference: "no-preference",
            dailyCalorieTarget: 2500,
            dailyProteinTarget: 180,
            dailyCarbTarget: 280,
            dailyFatTarget: 70,
        };

        console.log("📋 Profile:");
        console.log(JSON.stringify(profile, null, 2));
        console.log("\n🔄 Generating nutrition plan...\n");

        const plan = await createNutritionPlan(profile);

        console.log("\n✅ Plan generated successfully!");
        console.log("\n📊 Plan structure:");
        console.log(`   - userId: ${plan.userId}`);
        console.log(`   - date: ${plan.date}`);
        console.log(`   - breakfast: ${plan.breakfast ? "✅" : "❌"} (${plan.breakfast?.entries?.length || 0} entries)`);
        console.log(`   - lunch: ${plan.lunch ? "✅" : "❌"} (${plan.lunch?.entries?.length || 0} entries)`);
        console.log(`   - dinner: ${plan.dinner ? "✅" : "❌"} (${plan.dinner?.entries?.length || 0} entries)`);
        console.log(`   - snack: ${plan.snack ? "✅" : "❌"} (${plan.snack?.entries?.length || 0} entries)`);

        if (plan.breakfast) {
            console.log("\n🍳 Breakfast details:");
            console.log(`   Calories: ${plan.breakfast.calories}`);
            console.log(`   Protein: ${plan.breakfast.protein}g`);
            console.log(`   Carbs: ${plan.breakfast.carbs}g`);
            console.log(`   Fat: ${plan.breakfast.fat}g`);
            console.log(`   Entries: ${plan.breakfast.entries.length}`);
            plan.breakfast.entries.forEach((entry, i) => {
                console.log(`      ${i + 1}. Food ID: ${entry.foodId}, Quantity: ${entry.quantity}g`);
            });
        }

    } catch (error) {
        console.error("\n❌ Error:", error);
        if (error instanceof Error) {
            console.error("Message:", error.message);
            console.error("Stack:", error.stack);
        }
        throw error;
    }
}

// Run the script
testNutritionPlan()
    .then(() => {
        console.log("\n✅ Test completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Test failed!");
        console.error(error);
        process.exit(1);
    });
