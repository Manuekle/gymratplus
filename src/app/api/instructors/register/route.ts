import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createNotification } from "@/lib/notification-service";

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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      bio,
      curriculum,
      pricePerMonth,
      contactEmail,
      contactPhone,
      country,
      city,
      isRemote,
    } = instructorRegisterSchema.parse(body);

    // Actualizar el usuario para marcarlo como instructor
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isInstructor: true,
      },
    });

    // Preparar datos para crear/actualizar
    interface InstructorUpdateData {
      bio?: string;
      curriculum?: string;
      pricePerMonth?: number;
      contactEmail?: string;
      contactPhone?: string;
      country?: string;
      city?: string;
      isRemote?: boolean;
    }

    const updateData: InstructorUpdateData = {};
    const createData: InstructorUpdateData & { userId: string } = { userId: session.user.id };
    
    if (bio !== undefined) { updateData.bio = bio; createData.bio = bio; }
    if (curriculum !== undefined) { updateData.curriculum = curriculum; createData.curriculum = curriculum; }
    if (pricePerMonth !== undefined) { updateData.pricePerMonth = pricePerMonth; createData.pricePerMonth = pricePerMonth; }
    if (contactEmail !== undefined) { updateData.contactEmail = contactEmail; createData.contactEmail = contactEmail; }
    if (contactPhone !== undefined) { updateData.contactPhone = contactPhone; createData.contactPhone = contactPhone; }
    if (country !== undefined) { updateData.country = country; createData.country = country; }
    if (city !== undefined) { updateData.city = city; createData.city = city; }
    if (isRemote !== undefined) { updateData.isRemote = isRemote; createData.isRemote = isRemote; }

    // Crear o actualizar el perfil de instructor
    const instructorProfile = await prisma.instructorProfile.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: createData,
    });

    // Crear notificación de bienvenida para el instructor
    await createNotification({
      userId: session.user.id,
      title: "¡Bienvenido como instructor!",
      message:
        "Tu perfil de instructor ha sido creado exitosamente. Ahora puedes recibir solicitudes de alumnos.",
      type: "system",
    });

    return NextResponse.json({ user, instructorProfile }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("[INSTRUCTOR_REGISTER_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
