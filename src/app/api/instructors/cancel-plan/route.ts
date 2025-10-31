import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";
import { createNotification } from "@/lib/notifications/notification-service";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    // Verificar si el perfil de instructor existe primero
    const existingProfile = await prisma.instructorProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Perfil de instructor no encontrado" },
        { status: 404 },
      );
    }

    // Actualizar el estado del plan del instructor y el estado del usuario
    await prisma.$transaction([
      // Actualizar el perfil del instructor
      prisma.instructorProfile.update({
        where: { userId },
        data: { isPaid: false },
      }),
      // Actualizar el estado del usuario
      prisma.user.update({
        where: { id: userId },
        data: { isInstructor: false },
      }),
    ]);

    // Aquí podrías cancelar suscripciones activas en tu proveedor de pagos
    // Por ejemplo, si usas Stripe:
    // if (instructor.stripeSubscriptionId) {
    //   await cancelStripeSubscription(instructor.stripeSubscriptionId);
    // }

    // Notificar al usuario sobre la cancelación
    await createNotification({
      userId,
      title: "Suscripción cancelada",
      message:
        "Tu suscripción ha sido cancelada exitosamente. Ya no tendrás acceso a las funciones premium.",
      type: "system",
    });

    return NextResponse.json(
      { message: "Plan cancelado exitosamente" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[INSTRUCTOR_CANCEL_PLAN_ERROR]", error);

    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      {
        error:
          "Error al cancelar el plan. Por favor, inténtalo de nuevo más tarde.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
