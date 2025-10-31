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

    // Verificar si el usuario es un instructor
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructorProfile) {
      return NextResponse.json(
        { error: "Forbidden: User is not an instructor." },
        { status: 403 },
      );
    }

    // Obtener todos los estudiantes activos del instructor
    const studentRelationships = await prisma.studentInstructor.findMany({
      where: {
        instructorProfileId: instructorProfile.id,
        status: "active",
      },
      include: {
        student: {
          include: {
            workoutStreak: true,
            workoutSessions: {
              where: {
                completed: true,
              },
              orderBy: {
                date: "desc",
              },
            },
            mealLogs: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
            foodPlans: {
              where: {
                isActive: true,
              },
            },
            assignedWorkouts: {
              take: 1,
            },
          },
        },
      },
    });

    // Calcular estadísticas
    const totalStudents = studentRelationships.length;
    const activeToday = studentRelationships.filter((rel) => {
      const lastWorkout = rel.student.workoutSessions[0];
      return (
        lastWorkout &&
        new Date(lastWorkout.date).toDateString() === new Date().toDateString()
      );
    }).length;

    const activeThisWeek = studentRelationships.filter((rel) => {
      const lastWorkout = rel.student.workoutSessions[0];
      if (!lastWorkout) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(lastWorkout.date) >= weekAgo;
    }).length;

    const avgStreak =
      totalStudents > 0
        ? Math.round(
            studentRelationships.reduce(
              (acc, rel) =>
                acc + (rel.student.workoutStreak?.currentStreak || 0),
              0,
            ) / totalStudents,
          )
        : 0;

    const totalRevenue = studentRelationships.reduce(
      (acc, rel) => acc + (rel.agreedPrice || 0),
      0,
    );

    // Calcular estudiantes con planes activos
    const studentsWithWorkoutPlans = studentRelationships.filter(
      (rel) => rel.student.assignedWorkouts.length > 0,
    ).length;
    const studentsWithMealPlans = studentRelationships.filter(
      (rel) => rel.student.foodPlans.length > 0,
    ).length;

    const stats = {
      totalStudents,
      activeToday,
      activeThisWeek,
      avgStreak,
      totalRevenue,
      studentsWithWorkoutPlans,
      studentsWithMealPlans,
      activePercentage:
        totalStudents > 0 ? Math.round((activeToday / totalStudents) * 100) : 0,
      weeklyActivePercentage:
        totalStudents > 0
          ? Math.round((activeThisWeek / totalStudents) * 100)
          : 0,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("[GET_INSTRUCTOR_STUDENTS_STATS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
