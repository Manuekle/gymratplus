import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { sendEmail } from "@/lib/email/resend";
import { renderPaymentReminderEmail } from "@/lib/email/templates/payment-reminder-email";

export async function GET(req: Request) {
  // Security check: Verify Vercel Cron Secret
  // Using query param for now as "good enough" for quick testing, but header is better for production
  // Note: Vercel sends `Authorization: Bearer <CRON_SECRET>`

  const authHeader = req.headers.get("authorization");
  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    process.env.NODE_ENV === "production"
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 5);

    // Set time range for the target day (start of day to end of day)
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(
      `[Cron] Checking for renewals between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`,
    );

    // Find active users whose period ends in 5 days
    const usersToRemind = await prisma.user.findMany({
      where: {
        subscriptionStatus: "active",
        currentPeriodEnd: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionTier: true,
        planType: true,
        currentPeriodEnd: true,
      },
    });

    console.log(`[Cron] Found ${usersToRemind.length} users to remind.`);

    const results = await Promise.allSettled(
      usersToRemind.map(async (user) => {
        if (!user.email) return;

        const amount = user.subscriptionTier === "INSTRUCTOR" ? 74500 : 37700; // Simplified logic, should ideally come from plan details
        const planName =
          user.subscriptionTier === "INSTRUCTOR" ? "Instructor" : "Pro";

        const html = await renderPaymentReminderEmail({
          userName: user.name || "Usuario",
          planName: planName,
          renewalDate: user.currentPeriodEnd
            ? new Date(user.currentPeriodEnd).toLocaleDateString("es-ES")
            : "Próximamente",
          amount: amount,
          currency: "COP",
        });

        await sendEmail({
          to: user.email,
          subject: "Tu pago de GymRat+ se acerca",
          html: html,
        });

        return user.id;
      }),
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failureCount = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      processed: usersToRemind.length,
      sent: successCount,
      failed: failureCount,
    });
  } catch (error) {
    console.error("[Cron] Error processing payment reminders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
