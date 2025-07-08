import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
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

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calcular fechas basadas en el rango de tiempo
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Obtener estudiantes del instructor con sus datos nutricionales
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
            },
            mealLogs: {
              where: {
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    // Calcular estadísticas generales
    const totalStudents = studentRelationships.length;
    const activePlans = studentRelationships.filter(rel => rel.student.foodPlans.length > 0).length;

    // Calcular promedios de macros
    const activePlansData = studentRelationships
      .filter(rel => rel.student.foodPlans.length > 0)
      .map(rel => rel.student.foodPlans[0]);

    const averageCalories = activePlansData.length > 0 
      ? Math.round(activePlansData.reduce((acc, plan) => acc + plan.calorieTarget, 0) / activePlansData.length)
      : 0;

    const averageProtein = activePlansData.length > 0 
      ? Math.round(activePlansData.reduce((acc, plan) => acc + plan.protein, 0) / activePlansData.length)
      : 0;

    const averageCarbs = activePlansData.length > 0 
      ? Math.round(activePlansData.reduce((acc, plan) => acc + plan.carbs, 0) / activePlansData.length)
      : 0;

    const averageFat = activePlansData.length > 0 
      ? Math.round(activePlansData.reduce((acc, plan) => acc + plan.fat, 0) / activePlansData.length)
      : 0;

    // Calcular adherencia promedio
    const adherenceRates = studentRelationships
      .filter(rel => rel.student.foodPlans.length > 0)
      .map(rel => {
        const recentLogs = rel.student.mealLogs.length;
        const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const expectedLogs = daysDiff * 3; // 3 comidas por día
        const adherence = Math.min(100, Math.max(0, Math.round((recentLogs / expectedLogs) * 100)));
        return isNaN(adherence) ? 0 : adherence;
      });

    const averageAdherence = adherenceRates.length > 0 
      ? Math.round(adherenceRates.reduce((acc, rate) => acc + rate, 0) / adherenceRates.length)
      : 0;

    // Top performers (estudiantes con mayor adherencia)
    const topPerformers = studentRelationships
      .filter(rel => rel.student.foodPlans.length > 0)
      .map(rel => {
        const plan = rel.student.foodPlans[0];
        const recentLogs = rel.student.mealLogs.length;
        const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const expectedLogs = daysDiff * 3;
        const adherenceRate = Math.min(100, Math.max(0, Math.round((recentLogs / expectedLogs) * 100)));
        
        return {
          id: rel.student.id,
          name: rel.student.name,
          email: rel.student.email,
          image: rel.student.image,
          adherenceRate: isNaN(adherenceRate) ? 0 : adherenceRate,
          caloriesConsumed: plan.calorieTarget, // Simplificado
          targetCalories: plan.calorieTarget,
          progress: isNaN(adherenceRate) ? 0 : adherenceRate,
        };
      })
      .sort((a, b) => b.adherenceRate - a.adherenceRate)
      .slice(0, 4);

    // Actividad reciente
    const recentActivity = studentRelationships
      .flatMap(rel => 
        rel.student.mealLogs.slice(0, 3).map(log => ({
          id: log.id,
          studentName: rel.student.name,
          studentEmail: rel.student.email,
          studentImage: rel.student.image,
          action: "Registró comida",
          date: log.createdAt,
          calories: 0, // Los logs no tienen calorías directamente
          macros: { protein: 0, carbs: 0, fat: 0 }, // Simplificado
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Tendencias semanales (simplificado)
    const weeklyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLogs = studentRelationships.flatMap(rel => 
        rel.student.mealLogs.filter(log => 
          new Date(log.createdAt).toDateString() === date.toDateString()
        )
      );
      
      const dayAdherence = totalStudents > 0 
        ? Math.min(100, Math.max(0, Math.round((dayLogs.length / (totalStudents * 3)) * 100)))
        : 0;
      
      weeklyTrends.push({
        date: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        averageCalories: averageCalories,
        averageAdherence: isNaN(dayAdherence) ? 0 : dayAdherence,
        activeStudents: Math.min(totalStudents, dayLogs.length),
        targetCalories: averageCalories,
      });
    }

    // Distribución de macros
    const macroDistribution = [
      { name: "Proteínas", value: averageProtein, color: "#ef4444" },
      { name: "Carbohidratos", value: averageCarbs, color: "#3b82f6" },
      { name: "Grasas", value: averageFat, color: "#f59e0b" },
    ];

    // Adherencia por estudiante
    const adherenceByStudent = studentRelationships
      .filter(rel => rel.student.foodPlans.length > 0)
      .map(rel => {
        const recentLogs = rel.student.mealLogs.length;
        const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const expectedLogs = daysDiff * 3;
        const adherence = Math.min(100, Math.max(0, Math.round((recentLogs / expectedLogs) * 100)));
        
        return {
          name: rel.student.name?.split(' ')[0] + ' ' + (rel.student.name?.split(' ')[1]?.charAt(0) || ''),
          adherence: isNaN(adherence) ? 0 : adherence,
          target: 100,
        };
      })
      .sort((a, b) => b.adherence - a.adherence);

    const analytics = {
      totalStudents,
      activePlans,
      averageAdherence,
      averageCalories,
      averageProtein,
      averageCarbs,
      averageFat,
      topPerformers,
      recentActivity,
      weeklyTrends,
      macroDistribution,
      adherenceByStudent,
    };

    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error('[GET_INSTRUCTOR_NUTRITION_ANALYTICS_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 