import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { planType } = body;

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Calculate subscription end date (1 month from now for monthly, 1 year for annual)
    const currentPeriodEnd = new Date();
    if (planType === "annual") {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    // Update user with subscription details
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionStatus: "trialing",
        planType,
        trialEndsAt,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      },
    });

    // In a real app, you would also:
    // 1. Process the payment with your payment processor
    // 2. Store payment details securely
    // 3. Set up webhooks for payment failures/successes
    // 4. Send confirmation email

    return NextResponse.json({
      success: true,
      message: "Suscripción activada exitosamente",
      subscription: {
        status: "trialing",
        planType,
        trialEndsAt,
        currentPeriodEnd,
      },
    });
  } catch {
    return new NextResponse(
      JSON.stringify({
        error: "Error al procesar la suscripción",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
