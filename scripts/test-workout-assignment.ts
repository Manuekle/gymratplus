import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testWorkoutAssignment() {
  try {
    console.log('🧪 Probando asignación de rutinas...\n');

    // Obtener una relación instructor-estudiante válida
    const validRelation = await prisma.studentInstructor.findFirst({
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

    if (!validRelation) {
      console.log('❌ No se encontró ninguna relación instructor-estudiante válida');
      return;
    }

    console.log('✅ Relación encontrada:');
    console.log(`  - Estudiante: ${validRelation.student.name} (${validRelation.student.id})`);
    console.log(`  - Instructor: ${validRelation.instructor.user.name} (${validRelation.instructor.user.id})`);
    console.log(`  - Status: ${validRelation.status}`);

    // Verificar que el instructor tiene un perfil
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: validRelation.instructor.user.id },
      select: { id: true },
    });

    console.log(`\n📋 Perfil del instructor: ${instructorProfile?.id || 'No encontrado'}`);

    // Simular la validación que hace el endpoint
    const studentRelationship = await prisma.studentInstructor.findFirst({
      where: {
        studentId: validRelation.student.id,
        instructorProfileId: instructorProfile?.id || '',
        status: "active",
      },
    });

    console.log(`\n🔍 Validación de relación:`);
    console.log(`  - Relación encontrada: ${studentRelationship ? '✅' : '❌'}`);
    console.log(`  - Student ID: ${validRelation.student.id}`);
    console.log(`  - Instructor Profile ID: ${instructorProfile?.id}`);
    console.log(`  - Status buscado: "active"`);

    if (studentRelationship) {
      console.log('\n✅ La validación debería pasar correctamente');
    } else {
      console.log('\n❌ La validación fallará');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWorkoutAssignment(); 