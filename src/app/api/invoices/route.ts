import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { auth } from "@auth";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Get all invoices for the user
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        billingDate: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error("[Get Invoices] Error:", error);

    return NextResponse.json(
      {
        error: "Error al obtener las facturas",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    );
  }
}
