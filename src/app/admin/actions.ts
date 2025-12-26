"use server";

import { prisma } from "@/lib/database/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// --- Exercises ---

const ExerciseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  muscleGroup: z.string().min(1, "Muscle group is required"),
  equipment: z.string().optional(),
  videoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

export async function getExercises(query?: string) {
  const exercises = await prisma.exercise.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { muscleGroup: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50, // Limit for performance
  });
  return exercises;
}

export async function getExerciseById(id: string) {
  return await prisma.exercise.findUnique({
    where: { id },
  });
}

export async function createExercise(prevState: any, formData: FormData) {
  const validatedFields = ExerciseSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    muscleGroup: formData.get("muscleGroup"),
    equipment: formData.get("equipment"),
    videoUrl: formData.get("videoUrl"),
    difficulty: formData.get("difficulty"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Exercise.",
    };
  }

  const { name, description, muscleGroup, equipment, videoUrl, difficulty } =
    validatedFields.data;

  try {
    await prisma.exercise.create({
      data: {
        name,
        description,
        muscleGroup,
        equipment,
        videoUrl: videoUrl || null,
        difficulty,
      },
    });
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Exercise.",
    };
  }

  revalidatePath("/admin/exercises");
  redirect("/admin/exercises");
}

export async function updateExercise(
  id: string,
  prevState: any,
  formData: FormData,
) {
  const validatedFields = ExerciseSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    muscleGroup: formData.get("muscleGroup"),
    equipment: formData.get("equipment"),
    videoUrl: formData.get("videoUrl"),
    difficulty: formData.get("difficulty"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Exercise.",
    };
  }

  const { name, description, muscleGroup, equipment, videoUrl, difficulty } =
    validatedFields.data;

  try {
    await prisma.exercise.update({
      where: { id },
      data: {
        name,
        description,
        muscleGroup,
        equipment,
        videoUrl: videoUrl || null,
        difficulty,
      },
    });
  } catch (error) {
    return {
      message: "Database Error: Failed to Update Exercise.",
    };
  }

  revalidatePath("/admin/exercises");
  redirect("/admin/exercises");
}

export async function deleteExercise(id: string) {
  try {
    await prisma.exercise.delete({
      where: { id },
    });
    revalidatePath("/admin/exercises");
    return { message: "Deleted Exercise." };
  } catch (error) {
    return { message: "Database Error: Failed to Delete Exercise." };
  }
}

// --- Dashboard Stats ---

export async function getAdminStats() {
  const [
    usersCount,
    exercisesCount,
    activeSessionsCount,
    financialStats,
    analyticsData,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.exercise.count(),
    prisma.workoutSession.count({
      where: { completed: false },
    }),
    getFinancialStats(),
    getAnalyticsData(),
  ]);

  return {
    usersCount,
    exercisesCount,
    activeSessionsCount,
    totalRevenue: financialStats.totalRevenue,
    monthlyRevenue: financialStats.monthlyRevenue,
    analyticsData,
  };
}

// --- Foods ---

const FoodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
  serving: z.coerce.number().min(0),
  category: z.string().min(1, "Category is required"),
});

export async function getFoods(query?: string) {
  const foods = await prisma.food.findMany({
    where: query
      ? {
          name: { contains: query, mode: "insensitive" },
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return foods;
}

export async function getFoodById(id: string) {
  return await prisma.food.findUnique({
    where: { id },
  });
}

export async function createFood(prevState: any, formData: FormData) {
  const validatedFields = FoodSchema.safeParse({
    name: formData.get("name"),
    calories: formData.get("calories"),
    protein: formData.get("protein"),
    carbs: formData.get("carbs"),
    fat: formData.get("fat"),
    serving: formData.get("serving"),
    category: formData.get("category"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Food.",
    };
  }

  const { name, calories, protein, carbs, fat, serving, category } =
    validatedFields.data;

  try {
    await prisma.food.create({
      data: {
        name,
        calories,
        protein,
        carbs,
        fat,
        serving,
        category,
        // Default values for other required fields if any, or handle optionality
        mealType: [], // Default empty or handle via form
      },
    });
  } catch (error) {
    console.error(error);
    return {
      message: "Database Error: Failed to Create Food.",
    };
  }

  revalidatePath("/admin/foods");
  redirect("/admin/foods");
}

export async function updateFood(
  id: string,
  prevState: any,
  formData: FormData,
) {
  const validatedFields = FoodSchema.safeParse({
    name: formData.get("name"),
    calories: formData.get("calories"),
    protein: formData.get("protein"),
    carbs: formData.get("carbs"),
    fat: formData.get("fat"),
    serving: formData.get("serving"),
    category: formData.get("category"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Food.",
    };
  }

  const { name, calories, protein, carbs, fat, serving, category } =
    validatedFields.data;

  try {
    await prisma.food.update({
      where: { id },
      data: {
        name,
        calories,
        protein,
        carbs,
        fat,
        serving,
        category,
      },
    });
  } catch (error) {
    return {
      message: "Database Error: Failed to Update Food.",
    };
  }

  revalidatePath("/admin/foods");
  redirect("/admin/foods");
}

export async function deleteFood(id: string) {
  try {
    await prisma.food.delete({
      where: { id },
    });
    revalidatePath("/admin/foods");
    return { message: "Deleted Food." };
  } catch (error) {
    return { message: "Database Error: Failed to Delete Food." };
  }
}

// --- Emails ---

import { sendEmail } from "@/lib/email/resend";

export async function sendAdminEmail(prevState: any, formData: FormData) {
  const to = formData.get("to") as string;
  const subject = formData.get("subject") as string;
  const customMessage = formData.get("message") as string;

  if (!to || !subject || !customMessage) {
    return { message: "Please fill in all fields." };
  }

  // Basic HTML wrapper
  const html = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h1>${subject}</h1>
      <p style="white-space: pre-line;">${customMessage}</p>
      <hr />
      <p style="font-size: 12px; color: #888;">Sent from GymRat+ Admin</p>
    </div>
  `;

  const result = await sendEmail({
    to,
    subject,
    html,
  });

  if (!result.success) {
    return { message: "Failed to send email: " + result.error };
  }

  return { message: "Email Sent Successfully!", success: true };
}

// --- Financials ---

export async function getFinancialStats() {
  // Calculate Total Revenue (all paid invoices)
  const allPaidInvoices = await prisma.invoice.findMany({
    where: { status: "paid" },
    select: { amount: true },
  });
  const totalRevenue = allPaidInvoices.reduce(
    (acc, inv) => acc + inv.amount,
    0,
  );

  // Calculate Monthly Revenue (current month's paid invoices)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyPaidInvoices = await prisma.invoice.findMany({
    where: {
      status: "paid",
      billingDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    select: { amount: true },
  });
  const monthlyRevenue = monthlyPaidInvoices.reduce(
    (acc, inv) => acc + inv.amount,
    0,
  );

  return {
    totalRevenue,
    monthlyRevenue,
  };
}

export async function getInvoices(query?: string) {
  const invoices = await prisma.invoice.findMany({
    where: query
      ? {
          OR: [
            { invoiceNumber: { contains: query, mode: "insensitive" } },
            { user: { email: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { billingDate: "desc" },
    take: 50,
  });
  return invoices;
}

export async function getAnalyticsData() {
  // Determine the last 6 months range
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // 1. Fetch Revenue Data (Monthly grouped)
  const rawRevenue = await prisma.invoice.groupBy({
    by: ["billingDate"],
    _sum: {
      amount: true,
    },
    where: {
      status: "paid",
      billingDate: {
        gte: sixMonthsAgo,
      },
    },
    orderBy: {
      billingDate: "asc",
    },
  });

  // 2. Fetch User Growth Data (Monthly grouped)
  const rawUsers = await prisma.user.groupBy({
    by: ["createdAt"],
    _count: {
      id: true,
    },
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Dictionary to hold aggregated data by "Month Year" key
  const monthlyData: Record<
    string,
    { name: string; revenue: number; users: number }
  > = {};

  // Initialize map with all 6 months to ensure no gaps
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const monthYear = d.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }); // e.g., "Jan 24"
    monthlyData[monthYear] = { name: monthYear, revenue: 0, users: 0 };
  }

  // Process Revenue
  rawRevenue.forEach((entry) => {
    const monthYear = new Date(entry.billingDate).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    if (monthlyData[monthYear]) {
      monthlyData[monthYear].revenue += entry._sum.amount || 0;
    }
  });

  // Process Users
  rawUsers.forEach((entry) => {
    const monthYear = new Date(entry.createdAt).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    if (monthlyData[monthYear]) {
      monthlyData[monthYear].users += entry._count.id || 0;
    }
  });

  return Object.values(monthlyData);
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  // Fetch related stats
  const [workoutCount, invoiceCount, invoices] = await Promise.all([
    prisma.workoutSession.count({ where: { userId: id, completed: true } }),
    prisma.invoice.count({ where: { userId: id } }),
    prisma.invoice.findMany({
      where: { userId: id },
      orderBy: { billingDate: "desc" },
      take: 10,
    }),
  ]);

  return {
    ...user,
    stats: {
      workoutCount,
      invoiceCount,
    },
    invoices,
  };
}

// --- Users ---

export async function getUsers(query?: string) {
  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionTier: true,
      isInstructor: true,
      createdAt: true,
      _count: {
        select: { sessions: true },
      },
    },
    take: 50,
  });
  return users;
}

// --- Admin Workouts (Templates) ---

const WorkoutTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  difficulty: z.string().optional(), // We might need to add this field to prisma or use description
});

export async function getAdminWorkouts(query?: string) {
  // Fetch workouts that are "System" templates (no assigned user, or specifically marked)
  // For now, we assume createdBy admin user (AUTH_EMAIL) or assignedToId is null
  // But since we don't strictly track "admin" ID in DB, we'll check `type: "system"`?
  // The Schema has `type` String @default("personal"). We can use that.

  const workouts = await prisma.workout.findMany({
    where: {
      OR: [
        { type: "system" },
        { assignedToId: null }, // Fallback
      ],
      name: query ? { contains: query, mode: "insensitive" } : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
    },
    take: 50,
  });
  return workouts;
}

export async function createAdminWorkout(prevState: any, formData: FormData) {
  // 1. Validate Admin (Double check)
  // In server actions we can check auth again if needed, but layout handles it mostly.

  const validatedFields = WorkoutTemplateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Template.",
    };
  }

  const { name, description } = validatedFields.data;

  // We need a creator ID. We'll find the admin user by AUTH_EMAIL.
  const adminEmail = process.env.AUTH_EMAIL;
  if (!adminEmail)
    return { message: "Server Error: No Admin Email Configured" };

  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!adminUser)
    return { message: "Server Error: Admin User not found in DB" };

  try {
    await prisma.workout.create({
      data: {
        name,
        description,
        createdById: adminUser.id,
        type: "system", // Mark as system template
        status: "published", // Ready to be cloned
      },
    });
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Template.",
    };
  }

  revalidatePath("/admin/workouts");
  redirect("/admin/workouts");
}

export async function deleteWorkout(id: string) {
  try {
    await prisma.workout.delete({ where: { id } });
    revalidatePath("/admin/workouts");
    return { message: "Deleted Workout." };
  } catch (error) {
    return { message: "Database Error: Failed to Delete Workout." };
  }
}

// --- Instructors Verification ---

export async function getPendingInstructors() {
  return await prisma.instructorProfile.findMany({
    where: {
      isVerified: false,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function verifyInstructor(profileId: string) {
  try {
    await prisma.instructorProfile.update({
      where: { id: profileId },
      data: { isVerified: true },
    });

    // Optional: Send email notification to instructor
    revalidatePath("/admin/instructors");
    return { message: "Instructor Verified.", success: true };
  } catch (error) {
    return { message: "Database Error: Failed to verify." };
  }
}
