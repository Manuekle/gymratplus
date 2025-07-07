import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, User, InstructorProfile } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const isRemote = searchParams.get('isRemote');

    const whereClause: Prisma.UserWhereInput = {
      isInstructor: true,
    };

    if (country) {
      whereClause.instructorProfile = { country };
    }
    if (city) {
      whereClause.instructorProfile = { ...whereClause.instructorProfile as object, city };
    }
    if (isRemote === 'true') {
      whereClause.instructorProfile = { ...whereClause.instructorProfile as object, isRemote: true };
    } else if (isRemote === 'false') {
      whereClause.instructorProfile = { ...whereClause.instructorProfile as object, isRemote: false };
    }

    const instructors = await prisma.user.findMany({
      where: whereClause,
      include: {
        instructorProfile: true, // Incluir el perfil del instructor
      },
      // Aquí podrías añadir paginación o límites si fuera necesario
    });

    // Filtrar instructores que realmente tienen un perfil de instructor
    const filteredInstructors = instructors.filter((i: User & { instructorProfile: InstructorProfile | null }) => i.instructorProfile !== null);

    return NextResponse.json(filteredInstructors, { status: 200 });
  } catch (error) {
    console.error('[GET_INSTRUCTORS_ERROR]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
} 