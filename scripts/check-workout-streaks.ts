import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TableExistsResult {
  exists: boolean;
}

async function checkWorkoutStreaks() {
  try {
    console.log("Checking WorkoutStreak table...");

    // Verificar si la tabla existe
    const tableExists = await prisma.$queryRaw<TableExistsResult[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'WorkoutStreak'
      ) as "exists";
    `;

    const tableExistsResult = tableExists[0]?.exists || false;
    console.log("Table exists:", tableExistsResult);

    if (tableExistsResult) {
      // Contar registros
      const count = await prisma.workoutStreak.count();
      console.log(`Total WorkoutStreak records: ${count}`);

      // Mostrar algunos registros
      if (count > 0) {
        const streaks = await prisma.workoutStreak.findMany({
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });
        console.log(
          "Sample WorkoutStreak records:",
          JSON.stringify(streaks, null, 2),
        );
      }
    }
  } catch (error) {
    console.error("Error checking WorkoutStreak table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWorkoutStreaks();
