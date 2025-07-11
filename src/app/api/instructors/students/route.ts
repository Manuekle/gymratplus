import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar si el usuario es un instructor y obtener su perfil de instructor
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructorProfile) {
      return NextResponse.json(
        { error: "Forbidden: User is not an instructor or profile not found." },
        { status: 403 },
      );
    }

    // Devuelve relaciones aceptadas y pendientes
    const studentInstructorRelationships =
      await prisma.studentInstructor.findMany({
        where: {
          instructorProfileId: instructorProfile.id,
          status: { in: ["accepted", "pending", "active"] },
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              workoutStreak: {
                select: {
                  currentStreak: true,
                  lastWorkoutAt: true,
                },
              },
              workoutSessions: {
                where: {
                  completed: true,
                  date: {
                    gte: new Date(
                      new Date().setHours(0, 0, 0, 0) - 7 * 24 * 60 * 60 * 1000,
                    ), // Últimos 7 días
                  },
                },
                orderBy: {
                  date: "desc",
                },
              },
              assignedWorkouts: {
                where: { assignedToId: { not: null } },
                select: { id: true },
              },
              foodPlans: {
                where: { isActive: true },
                select: { id: true },
              },
              mealLogs: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { createdAt: true },
              },
            },
          },
        },
      });

    // Formatear los datos para la respuesta
    const studentsData = studentInstructorRelationships
      .filter((rel) => rel.student)
      .map((rel) => {
        const totalWorkouts = rel.student.workoutSessions.length;
        let weeks = 1;
        if (totalWorkouts > 0) {
          const firstSession = rel.student.workoutSessions[totalWorkouts - 1];
          const lastSession = rel.student.workoutSessions[0];
          if (firstSession && lastSession) {
            const diff =
              (new Date(lastSession.date).getTime() - new Date(firstSession.date).getTime()) /
              (1000 * 60 * 60 * 24 * 7);
            weeks = Math.max(1, Math.round(diff));
          }
        }
        return {
          id: rel.id,
          studentId: rel.student.id,
          name: rel.student.name,
          email: rel.student.email,
          image: rel.student.image,
          agreedPrice: rel.agreedPrice,
          status: rel.status,
          lastWorkoutAt:
            rel.student.workoutSessions.length > 0
              ? rel.student.workoutSessions[0]?.date || null
              : null,
          currentWorkoutStreak: rel.student.workoutStreak?.currentStreak || 0,
          completedWorkoutsLast7Days: rel.student.workoutSessions.length,
          totalWorkouts,
          averageWorkoutsPerWeek:
            totalWorkouts > 0 ? Math.round(totalWorkouts / weeks) : 0,
          lastNutritionLog: rel.student.mealLogs[0]?.createdAt || null,
          hasActiveMealPlan: rel.student.foodPlans.length > 0,
          hasActiveWorkoutPlan: rel.student.assignedWorkouts.length > 0,
        };
      });

    return NextResponse.json(studentsData, { status: 200 });
  } catch (error) {
    console.error("[GET_INSTRUCTOR_STUDENTS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
