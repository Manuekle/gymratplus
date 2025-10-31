import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import {
  InstructorResponse,
  InstructorFilters,
  PrismaWhereConditions,
} from "@/types/instructor";

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
    const filters: InstructorFilters = {
      tagFilter: searchParams.get("tagFilter"),
      country: searchParams.get("country"),
      isRemote: searchParams.get("isRemote"),
      isVerified: searchParams.get("isVerified"),
      maxPrice: searchParams.get("maxPrice"),
      experienceLevel: searchParams.get("experienceLevel"),
    };

    const {
      tagFilter,
      country,
      isRemote,
      isVerified,
      maxPrice,
      experienceLevel,
    } = filters;

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
    const whereConditions: PrismaWhereConditions = {
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
      if (maxPrice) {
        profileFilters.pricePerMonth = { lte: parseFloat(maxPrice) };
      }

      whereConditions.instructorProfile = {
        ...whereConditions.instructorProfile,
        ...profileFilters,
      };
    }

    if (experienceLevel) {
      whereConditions.experienceLevel = experienceLevel;
    }

    // Obtener instructores con filtros aplicados
    const instructors = await prisma.user.findMany({
      where: whereConditions,
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
    const result: InstructorResponse[] = filteredInstructors.map(
      (instructor) => {
        const { instructorProfile, ...userData } = instructor;
        return {
          ...userData,
          instructorProfile: instructorProfile
            ? {
                ...instructorProfile,
                tags: extractTags(instructorProfile.curriculum),
              }
            : null,
        };
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    return NextResponse.json<{ error: string }>(
      { error: "Error al cargar instructores" },
      { status: 500 },
    );
  }
}
