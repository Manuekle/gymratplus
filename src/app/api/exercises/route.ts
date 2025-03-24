import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// export async function GET() {
//   try {
//     const exercises = await prisma.exercise.findMany();
//     return NextResponse.json(exercises);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Error obteniendo ejercicios" },
//       { status: 500 }
//     );
//   }
// }
export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany();
    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Error fetching exercises" },
      { status: 500 }
    );
  }
}
