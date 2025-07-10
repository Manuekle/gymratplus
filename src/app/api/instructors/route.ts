import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Tipos para los instructores
interface InstructorProfile {
  bio: string | null;
  isVerified: boolean;
  pricePerMonth: number | null;
  country: string | null;
  city: string | null;
  isRemote: boolean;
  curriculum: string | null;
}

interface Instructor {
  id: string;
  name: string | null;
  image: string | null;
  instructorProfile: InstructorProfile | null;
  tags?: string[];
}

// Función para extraer etiquetas de un texto
const extractTags = (text?: string | null): string[] => {
  if (!text) return [];
  // Separar por comas, eliminar espacios en blanco y filtrar valores vacíos
  return text.split(',').map(tag => tag.trim()).filter(Boolean);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagFilter = searchParams.get('tagFilter');
    const country = searchParams.get('country');
    const isRemote = searchParams.get('isRemote');
    const isVerified = searchParams.get('isVerified');
    const maxPrice = searchParams.get('maxPrice');
    const experienceLevel = searchParams.get('experienceLevel');
    
    // Obtener las etiquetas del usuario actual si no se proporcionan como parámetro
    let userTags: string[] = [];
    let hasUserInterests = false;
    
    if (!tagFilter) {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { interests: true }
        });
        userTags = user?.interests || [];
        hasUserInterests = (user?.interests?.length || 0) > 0;
      }
    } else {
      // Si se proporciona tagFilter como parámetro, usarlo en lugar de las etiquetas del usuario
      // Soporta múltiples ids separados por coma
      userTags = tagFilter.split(',').map(tag => tag.trim()).filter(Boolean);
      hasUserInterests = userTags.length > 0;
    }

    // Construir filtros para la consulta de Prisma
    const whereConditions: any = {
      isInstructor: true,
      instructorProfile: {
        isNot: null
      }
    };

    // Construir filtros para instructorProfile
    const instructorProfileFilters: any = {};

    // Filtro por país
    if (country) {
      instructorProfileFilters.country = country;
    }

    // Filtro por remoto
    if (isRemote === 'true') {
      instructorProfileFilters.isRemote = true;
    }

    // Filtro por verificado
    if (isVerified === 'true') {
      instructorProfileFilters.isVerified = true;
    }

    // Filtro por precio máximo
    if (maxPrice) {
      instructorProfileFilters.pricePerMonth = {
        lte: parseFloat(maxPrice)
      };
    }

    // Combinar filtros de instructorProfile
    if (Object.keys(instructorProfileFilters).length > 0) {
      whereConditions.instructorProfile = {
        ...whereConditions.instructorProfile,
        ...instructorProfileFilters
      };
    }

    // Filtro por nivel de experiencia
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
            bio: true,
            isVerified: true,
            pricePerMonth: true,
            country: true,
            city: true,
            isRemote: true,
            curriculum: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    }) as unknown as Instructor[];

    // Si no hay filtros de especialidad y el usuario no tiene intereses, seleccionar 6 instructores al azar
    let selectedInstructors = [...instructors];
    if (!hasUserInterests && !tagFilter) {
      // Mezclar el array y tomar los primeros 6
      selectedInstructors = [...instructors]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
    }

    // Filtrar instructores basados en las etiquetas solo si hay filtros de especialidad
    const filteredInstructors = hasUserInterests
      ? instructors.filter(instructor => {
          const curriculumTags = extractTags(instructor.instructorProfile?.curriculum);
          // Filtrar por coincidencia exacta de id
          return userTags.some(tag =>
            curriculumTags.includes(tag)
          );
        })
      : selectedInstructors; // Si no hay intereses, usar los instructores filtrados por otros criterios

    // Formatear la respuesta para incluir las etiquetas
    const result = filteredInstructors.map(instructor => ({
      ...instructor,
      instructorProfile: {
        ...instructor.instructorProfile,
        tags: extractTags(instructor.instructorProfile?.curriculum)
      }
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json(
      { error: 'Error al cargar instructores' },
      { status: 500 }
    );
  }
}
