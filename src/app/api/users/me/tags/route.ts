import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/users/me/tags - Get current user's interests
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      // El campo interests ya existe tras la migración y prisma generate
    });

    return NextResponse.json(user?.interests ?? []);
  } catch (error) {
    console.error('Error fetching user interests:', error);
    return NextResponse.json(
      { error: 'Error fetching user interests' },
      { status: 500 }
    );
  }
}

// PUT /api/users/me/tags - Update user's interests
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { interests } = await request.json();
    if (!Array.isArray(interests)) {
      return new NextResponse('Invalid interests', { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { interests },
    });

    return NextResponse.json(interests);
  } catch (error) {
    console.error('Error updating user interests:', error);
    return NextResponse.json(
      { error: 'Error updating user interests' },
      { status: 500 }
    );
  }
}
