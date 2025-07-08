import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar si el usuario es un instructor
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructorProfile) {
      return NextResponse.json({ error: 'Forbidden: User is not an instructor.' }, { status: 403 });
    }

    // Obtener los estudiantes del instructor con sus planes de nutrición
    const studentRelationships = await prisma.studentInstructor.findMany({
      where: {
        instructorProfileId: instructorProfile.id,
        status: "active",
      },
      include: {
        student: {
          include: {
            foodPlans: {
              where: {
                isActive: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
            mealLogs: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    // Formatear los datos de planes de nutrición
    const nutritionPlans = studentRelationships
      .filter(rel => rel.student.foodPlans.length > 0)
      .map(rel => {
        const activePlan = rel.student.foodPlans[0];
        const totalLogs = rel.student.mealLogs.length;
        const lastLogDate = rel.student.mealLogs[0]?.createdAt;
        
        // Calcular adherencia basada en logs recientes (últimos 7 días)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentLogs = rel.student.mealLogs.filter(log => 
          new Date(log.createdAt) >= weekAgo
        ).length;
        
        // Adherencia simplificada: logs de la semana / 21 comidas esperadas (3 por día)
        const adherenceRate = Math.min(100, Math.round((recentLogs / 21) * 100));
        
        // Progreso basado en tiempo del plan
        const planStartDate = new Date(activePlan.createdAt);
        const daysSinceStart = Math.floor((Date.now() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const progress = Math.min(100, Math.round((daysSinceStart / 30) * 100)); // 30 días por plan

        return {
          id: activePlan.id,
          studentId: rel.student.id,
          studentName: rel.student.name,
          studentEmail: rel.student.email,
          studentImage: rel.student.image,
          planName: activePlan.name,
          status: progress >= 100 ? "completed" : "active",
          startDate: activePlan.createdAt,
          progress,
          dailyCalories: activePlan.calorieTarget,
          dailyProtein: activePlan.protein,
          dailyCarbs: activePlan.carbs,
          dailyFat: activePlan.fat,
          adherenceRate,
          lastLogDate,
          totalLogs,
        };
      });

    return NextResponse.json(nutritionPlans, { status: 200 });
  } catch (error) {
    console.error('[GET_INSTRUCTOR_NUTRITION_PLANS_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructorProfile) {
      return NextResponse.json({ error: 'Forbidden: User is not an instructor.' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      studentId, 
      name, 
      description, 
      goal, 
      calorieTarget, 
      protein, 
      carbs, 
      fat 
    } = body;

    // Verificar que el estudiante pertenece al instructor
    const studentRelationship = await prisma.studentInstructor.findFirst({
      where: {
        instructorProfileId: instructorProfile.id,
        studentId,
        status: "active",
      },
    });

    if (!studentRelationship) {
      return NextResponse.json({ error: 'Student not found or not assigned to instructor.' }, { status: 404 });
    }

    // Desactivar planes activos previos del estudiante
    await prisma.foodPlan.updateMany({
      where: {
        userId: studentId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Crear el nuevo plan de nutrición
    const nutritionPlan = await prisma.foodPlan.create({
      data: {
        userId: studentId,
        name,
        description,
        goal,
        calorieTarget,
        protein,
        carbs,
        fat,
        isActive: true,
      },
    });

    return NextResponse.json(nutritionPlan, { status: 201 });
  } catch (error) {
    console.error('[POST_INSTRUCTOR_NUTRITION_PLAN_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 