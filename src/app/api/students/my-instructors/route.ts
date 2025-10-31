import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = session.user.id;

    // Obtener las relaciones de instructor-alumno donde el usuario actual es el estudiante y la relación está activa
    const studentInstructorRelationships =
      await prisma.studentInstructor.findMany({
        where: {
          studentId: studentId,
          status: "active",
        },
        include: {
          instructor: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                  email: true, // Incluir email del usuario instructor
                },
              },
            },
          },
        },
      });

    // Formatear los datos para la respuesta, incluyendo la información de contacto del instructor
    const instructorsData = studentInstructorRelationships.map((rel) => ({
      id: rel.instructor.id,
      userId: rel.instructor.userId,
      name: rel.instructor.user.name,
      image: rel.instructor.user.image,
      bio: rel.instructor.bio,
      curriculum: rel.instructor.curriculum,
      pricePerMonth: rel.agreedPrice,
      contactEmail: rel.instructor.contactEmail,
      contactPhone: rel.instructor.contactPhone,
      country: rel.instructor.country,
      city: rel.instructor.city,
      isRemote: rel.instructor.isRemote,
      status: rel.status, // Estado de la relación (debería ser 'active')
      startDate: rel.startDate,
    }));

    return NextResponse.json(instructorsData, { status: 200 });
  } catch (error) {
    console.error("[GET_STUDENT_INSTRUCTORS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
