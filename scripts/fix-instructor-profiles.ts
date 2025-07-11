import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixInstructorProfiles() {
  console.log('🔍 Verificando datos de instructores...');

  try {
    // 1. Encontrar usuarios marcados como instructores pero sin perfil
    const usersWithoutProfile = await prisma.user.findMany({
      where: {
        isInstructor: true,
        instructorProfile: null
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    console.log(`📊 Encontrados ${usersWithoutProfile.length} usuarios marcados como instructores pero sin perfil`);

    if (usersWithoutProfile.length > 0) {
      console.log('👥 Usuarios sin perfil de instructor:');
      usersWithoutProfile.forEach(user => {
        console.log(`  - ${user.name} (${user.email})`);
      });

      // 2. Preguntar si se debe corregir automáticamente
      console.log('\n❓ ¿Deseas corregir estos datos? (s/n)');
      // En un entorno real, aquí se podría usar readline para input interactivo
      // Por ahora, asumimos que sí
      
      // 3. Opción 1: Desmarcar como instructores
      console.log('\n🔄 Desmarcando usuarios como instructores...');
      await prisma.user.updateMany({
        where: {
          isInstructor: true,
          instructorProfile: null
        },
        data: {
          isInstructor: false
        }
      });

      console.log('✅ Usuarios corregidos exitosamente');
    }

    // 4. Verificar instructores con perfil pero no marcados como instructores
    const usersWithProfileButNotInstructor = await prisma.user.findMany({
      where: {
        isInstructor: false,
        instructorProfile: {
          isNot: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    console.log(`\n📊 Encontrados ${usersWithProfileButNotInstructor.length} usuarios con perfil de instructor pero no marcados como instructores`);

    if (usersWithProfileButNotInstructor.length > 0) {
      console.log('👥 Usuarios con perfil pero no marcados como instructores:');
      usersWithProfileButNotInstructor.forEach(user => {
        console.log(`  - ${user.name} (${user.email})`);
      });

      // 5. Marcar como instructores
      console.log('\n🔄 Marcando usuarios como instructores...');
      await prisma.user.updateMany({
        where: {
          isInstructor: false,
          instructorProfile: {
            isNot: null
          }
        },
        data: {
          isInstructor: true
        }
      });

      console.log('✅ Usuarios marcados como instructores exitosamente');
    }

    // 6. Estadísticas finales
    const totalInstructors = await prisma.user.count({
      where: {
        isInstructor: true
      }
    });

    const totalInstructorProfiles = await prisma.instructorProfile.count();

    console.log('\n📈 Estadísticas finales:');
    console.log(`  - Usuarios marcados como instructores: ${totalInstructors}`);
    console.log(`  - Perfiles de instructor: ${totalInstructorProfiles}`);
    console.log(`  - Diferencia: ${totalInstructors - totalInstructorProfiles}`);

    if (totalInstructors === totalInstructorProfiles) {
      console.log('✅ Todos los datos están consistentes');
    } else {
      console.log('⚠️  Aún hay inconsistencias en los datos');
    }

  } catch (error) {
    console.error('❌ Error al verificar datos de instructores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
fixInstructorProfiles()
  .then(() => {
    console.log('🎉 Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en el script:', error);
    process.exit(1);
  }); 