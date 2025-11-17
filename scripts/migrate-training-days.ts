import { prisma } from "../src/lib/database/prisma";

/**
 * Script para migrar los perfiles existentes y agregar trainingDays
 * Si el usuario tiene trainingFrequency, se establece trainingDays como array vacío
 * Los usuarios podrán actualizar sus días de entrenamiento desde el perfil
 */
async function migrateTrainingDays() {
  try {
    console.log("🔄 Iniciando migración de trainingDays...");

    // Obtener todos los perfiles
    // Usamos raw SQL para evitar problemas con el cliente de Prisma que puede no tener el campo aún
    const profilesRaw = await prisma.$queryRaw<
      Array<{
        id: string;
        userId: string;
        trainingFrequency: number | null;
        trainingDays: string[] | null;
      }>
    >`
      SELECT id, "userId", "trainingFrequency", "trainingDays"
      FROM "Profile"
      WHERE "trainingDays" IS NULL OR "trainingDays" = '{}'::text[]
    `;

    const profiles = profilesRaw.map((p) => ({
      id: p.id,
      userId: p.userId,
      trainingFrequency: p.trainingFrequency,
    }));

    console.log(`📊 Encontrados ${profiles.length} perfiles para actualizar`);

    let updated = 0;
    let skipped = 0;

    for (const profile of profiles) {
      try {
        // Establecer trainingDays como array vacío por defecto
        // Los usuarios podrán actualizar esto desde su perfil o onboarding
        await prisma.profile.update({
          where: { id: profile.id },
          data: {
            trainingDays: [],
          },
        });

        updated++;
        if (updated % 10 === 0) {
          console.log(`✅ Actualizados ${updated} perfiles...`);
        }
      } catch (error) {
        console.error(
          `❌ Error actualizando perfil ${profile.id}:`,
          error instanceof Error ? error.message : error,
        );
        skipped++;
      }
    }

    console.log("\n✨ Migración completada:");
    console.log(`   ✅ Perfiles actualizados: ${updated}`);
    console.log(`   ⚠️  Perfiles omitidos: ${skipped}`);
    console.log(`   📊 Total procesado: ${profiles.length}`);
  } catch (error) {
    console.error("❌ Error en la migración:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración
migrateTrainingDays()
  .then(() => {
    console.log("\n🎉 ¡Migración completada exitosamente!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Error fatal en la migración:", error);
    process.exit(1);
  });
