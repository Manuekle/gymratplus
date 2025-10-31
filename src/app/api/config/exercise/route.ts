/* eslint-disable @typescript-eslint/no-unused-vars */
// Archivo: app/api/config/exercise/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { authOptions } from "@/lib/auth/auth";
import { getServerSession } from "next-auth/next";
import { exercises } from "@/data/exercises";

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Filtrar ejercicios únicos por nombre
    const uniqueExercises = exercises.filter(
      (exercise, index, self) =>
        index === self.findIndex((e) => e.name === exercise.name),
    );

    const newExercises = await prisma.exercise.createMany({
      data: uniqueExercises,
      skipDuplicates: true, // Evita agregar duplicados en la base de datos
    });

    return NextResponse.json(newExercises);
  } catch (error) {
    console.error("Error adding exercises:", error);
    return NextResponse.json(
      { error: "Failed to add exercises" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Buscar nombres duplicados
    const duplicates = await prisma.exercise.groupBy({
      by: ["name"],
      _count: { name: true },
      having: { name: { _count: { gt: 1 } } },
    });

    const duplicateNames = duplicates.map((d) => d.name);

    // Eliminar duplicados manteniendo solo el primero
    for (const name of duplicateNames) {
      const exercises = await prisma.exercise.findMany({
        where: { name },
        orderBy: { id: "asc" },
      });

      // Mantener solo el primero, eliminar el resto
      const toDelete = exercises.slice(1).map((e) => e.id);
      await prisma.exercise.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    return NextResponse.json({
      message: "Ejercicios duplicados eliminados correctamente",
    });
  } catch (error) {
    console.error("Error eliminando duplicados:", error);
    return NextResponse.json(
      { error: "Error eliminando duplicados" },
      { status: 500 },
    );
  }
}
