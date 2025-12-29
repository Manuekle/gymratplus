import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";
import { getCached, CacheKeys } from "@/lib/cache/redis";

// GET all foods without pagination (for AI and meal logging)
export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Use cache for all foods query
        const foods = await getCached(
            `${CacheKeys.FOODS_ALL}:${userId}`,
            () =>
                prisma.food.findMany({
                    where: {
                        OR: [{ userId: null }, { userId }],
                    },
                    select: {
                        id: true,
                        name: true,
                        calories: true,
                        protein: true,
                        carbs: true,
                        fat: true,
                        fiber: true,
                        sugar: true,
                        serving: true,
                        category: true,
                        mealType: true,
                        synonyms: true,
                        predefinedPortions: true,
                        servingUnit: true,
                    },
                    orderBy: { name: "asc" },
                }),
            3600, // Cache for 1 hour
        );

        return NextResponse.json(foods);
    } catch (error) {
        console.error("Error fetching all foods:", error);
        return NextResponse.json(
            { error: "Failed to fetch foods" },
            { status: 500 },
        );
    }
}
