import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tagIds = searchParams.get('tags')?.split(',').filter(Boolean) || [];

    const instructors = await prisma.user.findMany({
      where: { 
        isInstructor: true,
        ...(tagIds.length > 0 && {
          tags: {
            some: {
              id: { in: tagIds }
            }
          }
        })
      },
      select: {
        id: true,
        name: true,
        image: true,
        tags: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(instructors);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json(
      { error: 'Error fetching instructors' },
      { status: 500 }
    );
  }
}
