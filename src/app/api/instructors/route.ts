import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { InstructorFilters } from "@/types/instructor";

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
      maxPrice: searchParams.get("maxPrice"),
    };

    const { tagFilter, country, isRemote, maxPrice } = filters;

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
    const whereConditions: {
      isInstructor: boolean;
      instructorProfile?: {
        isNot?: null;
        country?: string;
        isRemote?: boolean;
        pricePerMonth?: { lte: number };
      };
      [key: string]: unknown;
    } = {
      isInstructor: true,
    };

    // Construir filtros del perfil de instructor
    const hasProfileFilters = country || isRemote === "true" || maxPrice;

    if (hasProfileFilters) {
      // Si hay filtros específicos, no necesitamos isNot: null
      // porque Prisma asume que el perfil debe existir si hay filtros
      const instructorProfileFilter: {
        country?: string;
        isRemote?: boolean;
        pricePerMonth?: { lte: number };
      } = {};

      if (country) {
        instructorProfileFilter.country = country;
      }
      if (isRemote === "true") {
        instructorProfileFilter.isRemote = true;
      }
      if (maxPrice) {
        instructorProfileFilter.pricePerMonth = {
          lte: parseFloat(maxPrice),
        };
      }

      whereConditions.instructorProfile = instructorProfileFilter;
    } else {
      // Si no hay filtros específicos, solo verificamos que el perfil exista
      whereConditions.instructorProfile = {
        isNot: null,
      };
    }

    // Obtener instructores con filtros aplicados
    const instructors = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        image: true,
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
    const result = filteredInstructors.map((instructor) => {
      const { instructorProfile, ...userData } = instructor;
      return {
        ...userData,
        email: null, // Add required fields
        updatedAt: new Date().toISOString(),
        isInstructor: true,
        interests: [],
        instructorProfile: instructorProfile
          ? {
              ...instructorProfile,
              tags: extractTags(instructorProfile.curriculum),
            }
          : null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al cargar instructores:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error al cargar instructores";
    return NextResponse.json<{ error: string }>(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
