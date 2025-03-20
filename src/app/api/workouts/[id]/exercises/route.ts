import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authRoute } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function POST(req: Request, context: { params: { id: string } }) {
  const { params } = context; // Extraemos params correctamente
  const session = await getServerSession(authRoute);
  if (!session)
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { exerciseId, sets, reps, weight, restTime, notes } =
      await req.json();
    if (!exerciseId || !sets || !reps) {
      return NextResponse.json(
        { error: "Ejercicio, sets y reps son obligatorios" },
        { status: 400 }
      );
    }

    const workout = await prisma.workout.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: { exercises: true },
    });

    if (!workout)
      return NextResponse.json(
        { error: "Workout no encontrado" },
        { status: 404 }
      );

    const newExercise = await prisma.workoutExercise.create({
      data: {
        workoutId: params.id,
        exerciseId,
        sets,
        reps,
        weight,
        restTime,
        notes,
        order: workout.exercises.length, // Se agrega al final
      },
    });

    return NextResponse.json(newExercise, { status: 201 });
  } catch (error) {
    console.error("Error al agregar ejercicio:", error);
    return NextResponse.json(
      { error: "Error agregando ejercicio" },
      { status: 500 }
    );
  }
}
