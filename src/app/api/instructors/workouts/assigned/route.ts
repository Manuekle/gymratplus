import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "../../../../../../auth.ts";

// Habilita el registro detallado de consultas de Prisma
const prismaWithLogging = prisma.$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      const start = Date.now();
      const result = await query(args);
      const duration = Date.now() - start;
      console.log(`[PRISMA] ${operation} on ${model} took ${duration}ms`);
      return result;
    },
  },
});

export async function GET() {
  console.log(
    "=== Iniciando solicitud GET a /api/instructors/workouts/assigned ===",
  );

  try {
    // Obtener la sesión del usuario
    console.log("Obteniendo sesión del usuario...");
    const session = await auth();

    if (!session || !session.user) {
      console.error("No se encontró sesión de usuario");
      return NextResponse.json(
        { error: "No autorizado - Sesión no encontrada" },
        { status: 401 },
      );
    }

    console.log("Sesión encontrada para el usuario:", session.user.email);
    console.log("ID del usuario en sesión:", session.user.id);

    // Verificar que el usuario sea un instructor
    console.log("Verificando si el usuario es instructor...");
    const instructor = await prismaWithLogging.user.findUnique({
      where: { id: session.user.id },
      select: { isInstructor: true },
    });

    console.log("Resultado de la verificación de instructor:", instructor);

    if (!instructor?.isInstructor) {
      console.error("El usuario no es un instructor");
      return NextResponse.json(
        { error: "Solo los instructores pueden ver las rutinas asignadas" },
        { status: 403 },
      );
    }

    // Obtener las rutinas asignadas por este instructor
    console.log("Buscando rutinas asignadas para el instructor...");

    // Primero, verificar si hay rutinas asignadas
    const workoutCount = await prismaWithLogging.workout.count({
      where: {
        instructorId: session.user.id,
        assignedToId: { not: null },
        type: "assigned",
        status: { not: "deleted" },
      },
    });

    console.log(`Se encontraron ${workoutCount} rutinas asignadas`);

    // Si no hay rutinas asignadas, devolver un array vacío
    if (workoutCount === 0) {
      console.log("No se encontraron rutinas asignadas");
      return NextResponse.json([]);
    }

    // Obtener las rutinas asignadas con toda la información necesaria
    const assignedWorkouts = await prismaWithLogging.workout.findMany({
      where: {
        instructorId: session.user.id,
        assignedToId: { not: null },
        type: "assigned",
        status: { not: "deleted" },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        assignedDate: "desc" as const,
      },
    });

    console.log("Rutinas asignadas encontradas:", assignedWorkouts.length);
    return NextResponse.json(assignedWorkouts);
  } catch (error) {
    console.error("Error al obtener las rutinas asignadas:", error);

    // Proporcionar más detalles sobre el error
    let errorMessage =
      "Error interno del servidor al obtener las rutinas asignadas";
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      console.error("Stack trace:", error.stack);
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    );
  } finally {
    console.log(
      "=== Finalizando solicitud GET a /api/instructors/workouts/assigned ===",
    );
  }
}
