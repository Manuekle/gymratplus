import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const instructors = await prisma.user.findMany({
      where: { isInstructor: true, isActive: true },
      select: {
        id: true,
        name: true,
        image: true,
        instructorProfile: {
          select: { specialty: true }
        }
      }
    });
    // Formatear para que specialty esté al toplevel
    const result = instructors.map(i => ({
      id: i.id,
      name: i.name,
      image: i.image,
      specialty: i.instructorProfile?.specialty || null,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
} 