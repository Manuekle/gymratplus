import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStudentInstructorRelationship() {
  try {
    console.log('🔍 Verificando relaciones instructor-estudiante...\n');

    // Obtener todas las relaciones
    const allRelations = await prisma.studentInstructor.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(`📊 Total de relaciones encontradas: ${allRelations.length}\n`);

    // Agrupar por status
    const relationsByStatus = allRelations.reduce((acc, relation) => {
      const status = relation.status || 'undefined';
      if (!acc[status]) acc[status] = [];
      acc[status].push(relation);
      return acc;
    }, {} as Record<string, typeof allRelations>);

    // Mostrar relaciones por status
    Object.entries(relationsByStatus).forEach(([status, relations]) => {
      console.log(`\n📋 Status "${status}": ${relations.length} relaciones`);
      relations.forEach((relation) => {
        console.log(`  - Estudiante: ${relation.student.name} (${relation.student.email})`);
        console.log(`    Instructor: ${relation.instructor.user.name} (${relation.instructor.user.email})`);
        console.log(`    ID Relación: ${relation.id}`);
      });
    });

    // Verificar relaciones específicas (puedes cambiar estos IDs)
    console.log('\n🔍 Verificando relaciones específicas...');
    
    // Ejemplo: buscar relaciones con status "active"
    const activeRelations = await prisma.studentInstructor.findMany({
      where: { status: "active" },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(`\n✅ Relaciones con status "active": ${activeRelations.length}`);
    activeRelations.forEach((relation) => {
      console.log(`  - Estudiante: ${relation.student.name} (${relation.studentId})`);
      console.log(`    Instructor: ${relation.instructor.user.name} (${relation.instructor.userId})`);
      console.log(`    Perfil Instructor ID: ${relation.instructorProfileId}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudentInstructorRelationship(); 