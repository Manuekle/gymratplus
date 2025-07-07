import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Esquema de validación para el registro del instructor
const instructorRegisterSchema = z.object({
  bio: z.string().optional(),
  curriculum: z.string().optional(),
  pricePerMonth: z.number().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  isRemote: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { bio, curriculum, pricePerMonth, contactEmail, contactPhone, country, city, isRemote } = instructorRegisterSchema.parse(body);

    // Actualizar el usuario para marcarlo como instructor
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isInstructor: true,
      },
    });

    // Crear o actualizar el perfil de instructor
    const instructorProfile = await prisma.instructorProfile.upsert({
      where: { userId: session.user.id },
      update: {
        bio,
        curriculum,
        pricePerMonth,
        contactEmail,
        contactPhone,
        country,
        city,
        isRemote,
      },
      create: {
        userId: session.user.id,
        bio,
        curriculum,
        pricePerMonth,
        contactEmail,
        contactPhone,
        country,
        city,
        isRemote,
      },
    });

    return NextResponse.json({ user, instructorProfile }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }

    console.error('[INSTRUCTOR_REGISTER_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 