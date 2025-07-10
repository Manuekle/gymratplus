import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification-service";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    // Actualizar el estado del plan del instructor
    const instructor = await prisma.instructorProfile.update({
      where: { userId },
      data: {
        isPaid: false,
      },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: "Perfil de instructor no encontrado" },
        { status: 404 }
      );
    }

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
      { status: 200 }
    );
  } catch (error) {
    console.error("[INSTRUCTOR_CANCEL_PLAN_ERROR]", error);

    return NextResponse.json(
      {
        error:
          "Error al cancelar el plan. Por favor, inténtalo de nuevo más tarde.",
      },
      { status: 500 }
    );
  }
}
