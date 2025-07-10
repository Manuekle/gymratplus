import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/users/me/tags - Get current user's tags
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(user?.tags || []);
  } catch (error) {
    console.error('Error fetching user tags:', error);
    return NextResponse.json(
      { error: 'Error fetching user tags' },
      { status: 500 }
    );
  }
}

// PUT /api/users/me/tags - Update user's tags
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { tagIds } = await request.json();

    // First, verify all tag IDs exist
    const existingTags = await prisma.tag.findMany({
      where: { id: { in: tagIds } },
    });

    if (existingTags.length !== tagIds.length) {
      return new NextResponse('One or more tags not found', { status: 400 });
    }

    // Update user's tags
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        tags: {
          set: tagIds.map((id: string) => ({ id })),
        },
      },
    });

    // Return updated tags
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser?.tags || []);
  } catch (error) {
    console.error('Error updating user tags:', error);
    return NextResponse.json(
      { error: 'Error updating user tags' },
      { status: 500 }
    );
  }
}
