import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
    console.log("🧹 Starting database cleanup...");
    console.log("⚠️  This will delete ALL user activity, workouts, and logs.");
    console.log("🛡️  Preserving: Users, Exercises, Foods, Recipes");

    try {
        // 1. Delete Notifications & Communications
        console.log("Deleting Notifications & Push Subscriptions...");
        await prisma.notification.deleteMany({});
        await prisma.pushSubscription.deleteMany({});
        await prisma.verificationCode.deleteMany({});

        // 2. Delete Chat History
        console.log("Deleting Chat History...");
        await prisma.chatMessage.deleteMany({});
        await prisma.chat.deleteMany({});
        await prisma.studentInstructor.deleteMany({}); // Delete relationships initiated

        // 3. Delete Workout Activity (Logs -> Workouts)
        console.log("Deleting Workout Activity...");
        // Bottom-up deletion to avoid foreign key constraints (though cascade usually handles it, explicit is safer/cleaner)
        await prisma.setSession.deleteMany({});
        await prisma.exerciseSession.deleteMany({});
        await prisma.workoutSession.deleteMany({});

        // Delete Logs/Progress
        await prisma.workoutStreak.deleteMany({});

        // Delete Workouts (Reference User & Exercise)
        // Note: This preserves the 'Exercise' table which is the catalog
        await prisma.workoutExercise.deleteMany({});
        await prisma.workout.deleteMany({});

        // 4. Delete Nutrition Activity
        console.log("Deleting Nutrition Activity...");
        await prisma.mealEntryRecipe.deleteMany({});
        await prisma.mealLog.deleteMany({});
        await prisma.dailyWaterIntake.deleteMany({});

        // Delete Plans
        await prisma.mealPlanEntry.deleteMany({});
        await prisma.mealPlanMeal.deleteMany({});
        await prisma.foodRecommendation.deleteMany({});
        await prisma.foodPlan.deleteMany({});

        // 5. Delete Progress Tracking
        console.log("Deleting Progress Tracking...");
        await prisma.goalProgress.deleteMany({});
        await prisma.goal.deleteMany({});
        await prisma.weight.deleteMany({});
        await prisma.progressPhoto.deleteMany({});

        // 6. Delete Billing/Invoices
        console.log("Deleting Invoices...");
        await prisma.invoice.deleteMany({});

        console.log("\n✅ Database cleaned successfully!");
        console.log("   - Users: KEPT");
        console.log("   - Profiles: KEPT");
        console.log("   - Exercises (Catalog): KEPT");
        console.log("   - Foods/Recipes (Catalog): KEPT");

    } catch (error) {
        console.error("❌ Error cleaning database:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

cleanDatabase();
