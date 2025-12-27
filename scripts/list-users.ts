/**
 * Script to list all users in the database
 * Usage: npx tsx scripts/list-users.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listUsers() {
    try {
        console.log("🔍 Fetching all users...\n");

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                subscriptionTier: true,
                subscriptionStatus: true,
                planType: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        if (users.length === 0) {
            console.log("❌ No users found in the database");
            return;
        }

        console.log(`✅ Found ${users.length} user(s):\n`);

        users.forEach((user, index) => {
            console.log(`${index + 1}. User ID: ${user.id}`);
            console.log(`   Name: ${user.name || "N/A"}`);
            console.log(`   Email: ${user.email || "N/A"}`);
            console.log(`   Tier: ${user.subscriptionTier || "N/A"}`);
            console.log(`   Status: ${user.subscriptionStatus || "N/A"}`);
            console.log(`   Plan Type: ${user.planType || "N/A"}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log("");
        });
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
listUsers()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
