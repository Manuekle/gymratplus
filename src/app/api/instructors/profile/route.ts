import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const instructorProfileUpdateSchema = z.object({
  bio: z.string().optional(),
  curriculum: z.string().optional(),
  pricePerMonth: z.number().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  isRemote: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: userId },
    });

    if (!instructorProfile) {
      return NextResponse.json(
        { error: "Instructor profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(instructorProfile, { status: 200 });
  } catch (error) {
    console.error("[GET_INSTRUCTOR_PROFILE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const updateData = instructorProfileUpdateSchema.parse(body);

    // Verificar si el usuario es un instructor y tiene un perfil de instructor
    const existingProfile = await prisma.instructorProfile.findUnique({
      where: { userId: userId },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Instructor profile not found" },
        { status: 404 },
      );
    }

    // Actualizar el perfil del instructor
    const updatedProfile = await prisma.instructorProfile.update({
      where: { userId: userId },
      data: updateData,
    });

    return NextResponse.json(updatedProfile, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("[INSTRUCTOR_PROFILE_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
