import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStudentInstructorStatus() {
  console.log('🔍 Verificando status de relaciones StudentInstructor...');

  try {
    // 1. Verificar relaciones con status "accepted" que deberían ser "active"
    const acceptedRelations = await prisma.studentInstructor.findMany({
      where: {
        status: "accepted"
      },
      include: {
        student: {
          select: {
            name: true,
            email: true
          }
        },
        instructor: {
          select: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log(`📊 Encontradas ${acceptedRelations.length} relaciones con status "accepted"`);

    if (acceptedRelations.length > 0) {
      console.log('👥 Relaciones con status "accepted":');
      acceptedRelations.forEach(rel => {
        console.log(`  - ${rel.student.name} -> ${rel.instructor.user.name} (${rel.id})`);
      });

      // Actualizar a "active"
      console.log('\n🔄 Actualizando status de "accepted" a "active"...');
      await prisma.studentInstructor.updateMany({
        where: {
          status: "accepted"
        },
        data: {
          status: "active"
        }
      });

      console.log('✅ Relaciones actualizadas exitosamente');
    }

    // 2. Verificar relaciones con status "active" que no deberían estar ahí
    const activeRelations = await prisma.studentInstructor.findMany({
      where: {
        status: "active"
      },
      include: {
        student: {
          select: {
            name: true,
            email: true
          }
        },
        instructor: {
          select: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log(`\n📊 Encontradas ${activeRelations.length} relaciones con status "active"`);

    if (activeRelations.length > 0) {
      console.log('👥 Relaciones con status "active":');
      activeRelations.forEach(rel => {
        console.log(`  - ${rel.student.name} -> ${rel.instructor.user.name} (${rel.id})`);
      });
    }

    // 3. Verificar relaciones con status "pending"
    const pendingRelations = await prisma.studentInstructor.findMany({
      where: {
        status: "pending"
      },
      include: {
        student: {
          select: {
            name: true,
            email: true
          }
        },
        instructor: {
          select: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log(`\n📊 Encontradas ${pendingRelations.length} relaciones con status "pending"`);

    if (pendingRelations.length > 0) {
      console.log('👥 Relaciones con status "pending":');
      pendingRelations.forEach(rel => {
        console.log(`  - ${rel.student.name} -> ${rel.instructor.user.name} (${rel.id})`);
      });
    }

    // 4. Estadísticas finales
    const totalRelations = await prisma.studentInstructor.count();
    const activeCount = await prisma.studentInstructor.count({ where: { status: "active" } });
    const pendingCount = await prisma.studentInstructor.count({ where: { status: "pending" } });
    const acceptedCount = await prisma.studentInstructor.count({ where: { status: "accepted" } });

    console.log('\n📈 Estadísticas finales:');
    console.log(`  - Total de relaciones: ${totalRelations}`);
    console.log(`  - Status "active": ${activeCount}`);
    console.log(`  - Status "pending": ${pendingCount}`);
    console.log(`  - Status "accepted": ${acceptedCount}`);

    if (acceptedCount === 0) {
      console.log('✅ Todos los status están correctos');
    } else {
      console.log('⚠️  Aún hay relaciones con status "accepted"');
    }

  } catch (error) {
    console.error('❌ Error al verificar status de relaciones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
fixStudentInstructorStatus()
  .then(() => {
    console.log('🎉 Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en el script:', error);
    process.exit(1);
  }); 