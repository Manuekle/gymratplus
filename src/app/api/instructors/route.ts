import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Función para extraer etiquetas de un texto
const extractTags = (text?: string | null): string[] => {
  if (!text) return [];
  // Separar por comas, eliminar espacios en blanco y filtrar valores vacíos
  return text
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagFilter = searchParams.get("tagFilter");
    const country = searchParams.get("country");
    const isRemote = searchParams.get("isRemote");
    const isVerified = searchParams.get("isVerified");
    const maxPrice = searchParams.get("maxPrice");
    const experienceLevel = searchParams.get("experienceLevel");

    // Obtener las etiquetas del usuario actual si no se proporcionan como parámetro
    let userTags: string[] = [];
    let hasUserInterests = false;

    if (tagFilter) {
      // Si se proporciona tagFilter como parámetro, usarlo
      userTags = tagFilter
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      hasUserInterests = userTags.length > 0;
    }

    // Construir filtros básicos
    const whereConditions = {
      isInstructor: true,
      instructorProfile: {
        isNot: null,
      },
    };

    // Agregar filtros adicionales si se proporcionan
    if (country || isRemote === "true" || isVerified === "true" || maxPrice) {
      const profileFilters: Record<string, unknown> = {};

      if (country) profileFilters.country = country;
      if (isRemote === "true") profileFilters.isRemote = true;
      if (isVerified === "true") profileFilters.isVerified = true;
      if (maxPrice)
        profileFilters.pricePerMonth = { lte: parseFloat(maxPrice) };

      (whereConditions as any).instructorProfile = {
        ...(whereConditions as any).instructorProfile,
        ...profileFilters,
      };
    }

    if (experienceLevel) {
      (whereConditions as any).experienceLevel = experienceLevel;
    }

    // Obtener instructores con filtros aplicados
    const instructors = await prisma.user.findMany({
      where: whereConditions as any,
      select: {
        id: true,
        name: true,
        image: true,
        experienceLevel: true,
        instructorProfile: {
          select: {
            id: true,
            bio: true,
            isVerified: true,
            pricePerMonth: true,
            country: true,
            city: true,
            isRemote: true,
            curriculum: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Filtrar instructores que tienen perfil válido
    const validInstructors = instructors.filter(
      (instructor) =>
        instructor.instructorProfile && instructor.instructorProfile.id,
    );

    // Si no hay filtros de especialidad, seleccionar 6 instructores al azar
    let selectedInstructors = [...validInstructors];
    if (!hasUserInterests) {
      selectedInstructors = [...validInstructors]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
    }

    // Filtrar instructores basados en las etiquetas solo si hay filtros de especialidad
    const filteredInstructors = hasUserInterests
      ? validInstructors.filter((instructor) => {
          const curriculumTags = extractTags(
            instructor.instructorProfile?.curriculum,
          );
          return userTags.some((tag) => curriculumTags.includes(tag));
        })
      : selectedInstructors;

    // Formatear la respuesta para incluir las etiquetas
    const result = filteredInstructors.map((instructor) => ({
      ...instructor,
      instructorProfile: {
        ...instructor.instructorProfile,
        tags: extractTags(instructor.instructorProfile?.curriculum),
      },
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    return NextResponse.json(
      { error: "Error al cargar instructores" },
      { status: 500 },
    );
  }
}
