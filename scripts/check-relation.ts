import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRelation() {
  const relationId = 'cmcy1zlu6000wv90wst4737a6';
  
  console.log(`🔍 Verificando relación con ID: ${relationId}`);

  try {
    // Buscar la relación específica
    const relation = await prisma.studentInstructor.findUnique({
      where: { id: relationId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        instructor: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (relation) {
      console.log('✅ Relación encontrada:');
      console.log(`  - ID: ${relation.id}`);
      console.log(`  - Status: ${relation.status}`);
      console.log(`  - Student: ${relation.student.name} (${relation.student.email})`);
      console.log(`  - Instructor: ${relation.instructor.user.name} (${relation.instructor.user.email})`);
      console.log(`  - Instructor Profile ID: ${relation.instructorProfileId}`);
      console.log(`  - Start Date: ${relation.startDate}`);
      console.log(`  - Updated At: ${relation.updatedAt}`);
    } else {
      console.log('❌ Relación no encontrada');
      
      // Verificar si hay relaciones similares
      const allRelations = await prisma.studentInstructor.findMany({
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
      
      console.log('\n📊 Todas las relaciones existentes:');
      allRelations.forEach((rel, index) => {
        console.log(`  ${index + 1}. ID: ${rel.id}`);
        console.log(`     Status: ${rel.status}`);
        console.log(`     Student: ${rel.student.name} -> Instructor: ${rel.instructor.user.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error al verificar la relación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
checkRelation()
  .then(() => {
    console.log('🎉 Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en el script:', error);
    process.exit(1);
  }); 