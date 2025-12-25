import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
    console.log("🧹 Starting database cleanup...");
    console.log("⚠️  This will delete ALL user activity, workouts, and logs.");
    console.log("🛡️  Preserving: Users, Exercises, Foods, Recipes");

    try {
        // 1. Delete Notifications & Communications
        try {
            console.log("Deleting Notifications...");
            await prisma.notification.deleteMany({});
            await prisma.pushSubscription.deleteMany({});
            await prisma.verificationCode.deleteMany({});
        } catch (e) {
            console.log("Skipping missing Notification tables");
        }

        // 2. Delete Chat History
        try {
            console.log("Deleting Chat History...");
            await prisma.chatMessage.deleteMany({});
            await prisma.chat.deleteMany({});
            await prisma.studentInstructor.deleteMany({});
        } catch (e) {
            console.log("Skipping missing Chat tables");
        }

        // 3. Delete Workout Activity
        try {
            console.log("Deleting Workout Activity...");
            await prisma.setSession.deleteMany({});
            await prisma.exerciseSession.deleteMany({});
            await prisma.workoutSession.deleteMany({});
            await prisma.workoutStreak.deleteMany({});
            await prisma.workoutExercise.deleteMany({});
            await prisma.workout.deleteMany({});
        } catch (e) {
            console.log("Skipping missing Workout tables");
        }

        // 4. Delete Nutrition Activity
        try {
            console.log("Deleting Nutrition Activity...");
            await prisma.mealEntryRecipe.deleteMany({});
            await prisma.mealLog.deleteMany({});
            await prisma.dailyWaterIntake.deleteMany({});
            await prisma.mealPlanEntry.deleteMany({});
            await prisma.mealPlanMeal.deleteMany({});
            await prisma.foodRecommendation.deleteMany({});
            await prisma.foodPlan.deleteMany({});
        } catch (e) {
            console.log("Skipping missing Nutrition tables");
        }

        // 5. Delete Progress Tracking
        try {
            console.log("Deleting Progress Tracking...");
            await prisma.goalProgress.deleteMany({});
            await prisma.goal.deleteMany({});
            await prisma.weight.deleteMany({});
            await prisma.progressPhoto.deleteMany({});
        } catch (e) {
            console.log("Skipping missing Progress tables");
        }

        // 6. Delete Billing/Invoices
        try {
            console.log("Deleting Invoices...");
            await prisma.invoice.deleteMany({});
        } catch (e) {
            console.log("Skipping missing Invoice tables");
        }

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
