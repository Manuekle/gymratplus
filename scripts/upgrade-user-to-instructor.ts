/**
 * Script to upgrade a specific user to Instructor plan
 * Usage: npx tsx scripts/upgrade-user-to-instructor.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function upgradeUserToInstructor() {
    const userId = "cmjnh1end00001bflu3xk61rr";

    try {
        console.log(`🔍 Looking for user with ID: ${userId}`);

        // First, check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                subscriptionTier: true,
                subscriptionStatus: true,
                planType: true,
            },
        });

        if (!existingUser) {
            console.error(`❌ User with ID ${userId} not found`);
            return;
        }

        console.log("\n📋 Current user details:");
        console.log(`   Name: ${existingUser.name}`);
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Current Tier: ${existingUser.subscriptionTier}`);
        console.log(`   Current Status: ${existingUser.subscriptionStatus}`);
        console.log(`   Current Plan Type: ${existingUser.planType}`);

        // Calculate dates
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 days trial

        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1); // 1 month

        console.log("\n🔄 Upgrading to Instructor plan...");

        // Update user to Instructor plan
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionTier: "INSTRUCTOR",
                subscriptionStatus: "active",
                planType: "instructor",
                trialEndsAt,
                currentPeriodEnd,
                cancelAtPeriodEnd: false,
            },
        });

        console.log("\n✅ User successfully upgraded!");
        console.log("\n📋 Updated user details:");
        console.log(`   Name: ${updatedUser.name}`);
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   New Tier: ${updatedUser.subscriptionTier}`);
        console.log(`   New Status: ${updatedUser.subscriptionStatus}`);
        console.log(`   New Plan Type: ${updatedUser.planType}`);
        console.log(`   Trial Ends At: ${updatedUser.trialEndsAt}`);
        console.log(`   Current Period End: ${updatedUser.currentPeriodEnd}`);
        console.log(`   Cancel At Period End: ${updatedUser.cancelAtPeriodEnd}`);

        console.log("\n🎉 Done!");
    } catch (error) {
        console.error("\n❌ Error upgrading user:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
upgradeUserToInstructor()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
