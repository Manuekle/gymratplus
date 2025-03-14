import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfDay, endOfDay, parseISO } from "date-fns";

const prisma = new PrismaClient();

// GET all meal logs for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const date = req.nextUrl.searchParams.get("date");
    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");
    const planId = req.nextUrl.searchParams.get("planId");

    // Build the where clause
    const where: any = {
      userId: userId,
    };

    // Filter by plan if provided
    if (planId) {
      where.planId = planId;
    }

    // Filter by specific date
    if (date) {
      // Parsear la fecha y crear límites del día en la zona horaria local
      const parsedDate = parseISO(date);
      const start = startOfDay(parsedDate);
      const end = endOfDay(parsedDate);

      console.log("Filtering logs between:", {
        start: start.toISOString(),
        end: end.toISOString(),
        originalDate: date,
      });

      where.consumedAt = {
        gte: start,
        lte: end,
      };
    }
    // Filter by date range
    else if (startDate && endDate) {
      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(parseISO(endDate));

      where.consumedAt = {
        gte: start,
        lte: end,
      };
    }

    const mealLogs = await prisma.mealLog.findMany({
      where,
      include: {
        food: true,
        recipe: true,
      },
      orderBy: {
        consumedAt: "asc", // Cambiar a orden ascendente para mostrar las comidas en orden cronológico
      },
    });

    return NextResponse.json(mealLogs);
  } catch (error) {
    console.error("Error fetching meal logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal logs" },
      { status: 500 }
    );
  }
}

// POST create a new meal log
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.json();

    console.log("Datos recibidos:", data);

    // Validate required fields
    if (!data.mealType) {
      return NextResponse.json(
        { error: "Meal type is required" },
        { status: 400 }
      );
    }

    if (!data.foodId && !data.recipeId) {
      return NextResponse.json(
        { error: "Either food or recipe is required" },
        { status: 400 }
      );
    }

    if (!data.quantity) {
      return NextResponse.json(
        { error: "Quantity is required" },
        { status: 400 }
      );
    }

    // Buscar el plan activo del usuario si no se proporciona un planId
    let planId = data.planId;
    if (!planId) {
      const activePlan = await prisma.nutritionPlan.findFirst({
        where: {
          userId: userId,
          isActive: true,
        },
      });
      if (activePlan) {
        planId = activePlan.id;
      }
    }

    // Calculate nutrition values based on food or recipe
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    if (data.foodId) {
      const food = await prisma.food.findUnique({
        where: {
          id: data.foodId,
        },
      });

      if (!food) {
        return NextResponse.json({ error: "Food not found" }, { status: 404 });
      }

      // Calculate nutrition values based on quantity
      const ratio = data.quantity / food.serving;
      calories = Math.round(food.calories * ratio);
      protein = Number.parseFloat((food.protein * ratio).toFixed(1));
      carbs = Number.parseFloat((food.carbs * ratio).toFixed(1));
      fat = Number.parseFloat((food.fat * ratio).toFixed(1));
    } else if (data.recipeId) {
      const recipe = await prisma.recipe.findUnique({
        where: {
          id: data.recipeId,
        },
      });

      if (!recipe) {
        return NextResponse.json(
          { error: "Recipe not found" },
          { status: 404 }
        );
      }

      // Calculate nutrition values based on servings
      const ratio = data.quantity / recipe.servings;
      calories = Math.round(recipe.calories * ratio);
      protein = Number.parseFloat((recipe.protein * ratio).toFixed(1));
      carbs = Number.parseFloat((recipe.carbs * ratio).toFixed(1));
      fat = Number.parseFloat((recipe.fat * ratio).toFixed(1));
    }

    try {
      // Corregir el manejo de la fecha
      let consumedAt;
      if (data.consumedAt) {
        // Parsear la fecha ISO y asegurarnos de que se maneje en la zona horaria local
        consumedAt = new Date(data.consumedAt);

        // Verificar si la fecha es válida
        if (isNaN(consumedAt.getTime())) {
          console.error("Fecha inválida:", data.consumedAt);
          return NextResponse.json(
            { error: "Invalid date format" },
            { status: 400 }
          );
        }

        console.log("Fecha recibida:", data.consumedAt);
        console.log("Fecha a guardar:", consumedAt.toISOString());
      } else {
        consumedAt = new Date();
      }

      // Preparar los datos para crear el MealLog
      const mealLogData: any = {
        mealType: data.mealType,
        consumedAt: consumedAt,
        quantity: data.quantity,
        notes: data.notes || null,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
        User: {
          connect: {
            id: userId,
          },
        },
      };

      // Conectar con food o recipe según corresponda
      if (data.foodId) {
        mealLogData.food = {
          connect: {
            id: data.foodId,
          },
        };
      }

      if (data.recipeId) {
        mealLogData.recipe = {
          connect: {
            id: data.recipeId,
          },
        };
      }

      // Conectar con plan si existe
      if (planId) {
        mealLogData.plan = {
          connect: {
            id: planId,
          },
        };
      }

      // Crear el registro en MealLog
      const mealLog = await prisma.mealLog.create({
        data: mealLogData,
        include: {
          food: true,
          recipe: true,
        },
      });

      // Si hay un plan especificado, crear también el registro en MealPlanItem
      let mealPlanItem = null;
      if (planId) {
        try {
          // Buscar el plan
          const plan = await prisma.nutritionPlan.findUnique({
            where: {
              id: planId,
            },
            include: {
              days: true,
            },
          });

          if (!plan) {
            console.error("Plan not found:", planId);
          } else {
            // Determinar el número de día (usaremos 1 por defecto)
            const dayNumber = 1;

            // Buscar si ya existe el día en el plan
            let day = plan.days.find((d) => d.dayNumber === dayNumber);

            // Si no existe, crearlo
            if (!day) {
              day = await prisma.nutritionDay.create({
                data: {
                  nutritionPlanId: planId,
                  dayNumber: dayNumber,
                  dayName: null,
                },
              });
            }

            // Preparar datos para MealPlanItem
            const mealPlanItemData: any = {
              nutritionDayId: day.id,
              mealType: data.mealType,
              time: consumedAt.toISOString(),
              quantity: data.quantity,
              notes: data.notes || null,
              calories: calories,
              protein: protein,
              carbs: carbs,
              fat: fat,
            };

            // Conectar con food o recipe según corresponda
            if (data.foodId) {
              mealPlanItemData.food = {
                connect: {
                  id: data.foodId,
                },
              };
            }

            if (data.recipeId) {
              mealPlanItemData.recipe = {
                connect: {
                  id: data.recipeId,
                },
              };
            }

            // Crear el MealPlanItem asociado al día
            mealPlanItem = await prisma.mealPlanItem.create({
              data: mealPlanItemData,
              include: {
                food: true,
                recipe: true,
              },
            });
          }
        } catch (mealPlanError) {
          console.error("Error creating MealPlanItem:", mealPlanError);
          // No fallamos la operación principal si falla la creación del MealPlanItem
        }
      }

      return NextResponse.json({ mealLog, mealPlanItem });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          error: "Database error",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating meal log:", error);
    return NextResponse.json(
      {
        error: "Failed to create meal log",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
