import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAssignedWorkoutsType() {
  try {
    console.log('🔧 Corrigiendo tipos de rutinas asignadas...\n');

    // Buscar rutinas que están asignadas pero tienen tipo "personal"
    const assignedWorkoutsWithWrongType = await prisma.workout.findMany({
      where: {
        assignedToId: { not: null },
        type: "personal",
        status: { not: "deleted" },
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`📊 Encontradas ${assignedWorkoutsWithWrongType.length} rutinas asignadas con tipo incorrecto`);

    if (assignedWorkoutsWithWrongType.length > 0) {
      console.log('\n📋 Rutinas que necesitan corrección:');
      assignedWorkoutsWithWrongType.forEach((workout) => {
        console.log(`  - ID: ${workout.id}`);
        console.log(`    Nombre: ${workout.name}`);
        console.log(`    Asignada a: ${workout.assignedTo?.name} (${workout.assignedTo?.email})`);
        console.log(`    Instructor: ${workout.instructor?.name} (${workout.instructor?.email})`);
        console.log(`    Tipo actual: ${workout.type}`);
        console.log(`    Status: ${workout.status}`);
        console.log('');
      });

      console.log('🔄 Actualizando tipos de "personal" a "assigned"...');
      
      // Actualizar todas las rutinas asignadas que tienen tipo "personal"
      const updateResult = await prisma.workout.updateMany({
        where: {
          assignedToId: { not: null },
          type: "personal",
          status: { not: "deleted" },
        },
        data: {
          type: "assigned",
        },
      });

      console.log(`✅ Actualizadas ${updateResult.count} rutinas`);
    } else {
      console.log('✅ No se encontraron rutinas que necesiten corrección');
    }

    // Verificar el estado final
    const finalCheck = await prisma.workout.findMany({
      where: {
        assignedToId: { not: null },
        type: "assigned",
        status: { not: "deleted" },
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`\n📊 Estado final:`);
    console.log(`  - Rutinas asignadas con tipo correcto: ${finalCheck.length}`);
    
    if (finalCheck.length > 0) {
      console.log('\n📋 Rutinas asignadas correctamente:');
      finalCheck.forEach((workout) => {
        console.log(`  - ${workout.name} → ${workout.assignedTo?.name} (${workout.type})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAssignedWorkoutsType(); 