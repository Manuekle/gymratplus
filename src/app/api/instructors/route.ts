import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const instructors = await prisma.user.findMany({
      where: { isInstructor: true },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });
    return NextResponse.json(instructors);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
