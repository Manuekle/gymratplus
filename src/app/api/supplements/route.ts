import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET all supplements (system supplements and user's custom supplements)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchQuery = req.nextUrl.searchParams.get("search");
    const onlyCustom = req.nextUrl.searchParams.get("custom") === "true";

    // Build the where clause
    const where: any = {};

    // Include system supplements (userId is null) and user's custom supplements
    if (onlyCustom) {
      where.userId = userId;
    } else {
      where.OR = [{ userId: null }, { userId: userId }];
    }

    // Add search filter if provided
    if (searchQuery) {
      where.name = {
        contains: searchQuery,
        mode: "insensitive",
      };
    }

    const supplements = await prisma.supplement.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(supplements);
  } catch (error) {
    console.error("Error fetching supplements:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplements" },
      { status: 500 }
    );
  }
}

// POST create a custom supplement
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create the custom supplement
    const supplement = await prisma.supplement.create({
      data: {
        name: data.name,
        description: data.description || null,
        dosage: data.dosage || null,
        timing: data.timing || null,
        imageUrl: data.imageUrl || null,
        userId: userId,
      },
    });

    return NextResponse.json(supplement);
  } catch (error) {
    console.error("Error creating supplement:", error);
    return NextResponse.json(
      { error: "Failed to create supplement" },
      { status: 500 }
    );
  }
}

// PUT seed the database with initial supplements
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if supplements already exist
    const existingSupplementsCount = await prisma.supplement.count({
      where: {
        userId: null,
      },
    });

    if (existingSupplementsCount > 0) {
      return NextResponse.json({ message: "Supplements already seeded" });
    }

    // Define common supplements
    const supplementsToCreate = [
      {
        name: "Proteína de suero (Whey)",
        description:
          "Suplemento de proteína derivado del suero de la leche, ideal para la recuperación muscular.",
        dosage: "20-30g",
        timing: "Post-entrenamiento o entre comidas",
      },
      {
        name: "Creatina monohidrato",
        description: "Ayuda a aumentar la fuerza, potencia y masa muscular.",
        dosage: "5g",
        timing: "Diariamente, en cualquier momento del día",
      },
      {
        name: "BCAA (Aminoácidos de cadena ramificada)",
        description:
          "Ayuda a reducir la fatiga muscular y promueve la síntesis de proteínas.",
        dosage: "5-10g",
        timing: "Antes, durante o después del entrenamiento",
      },
      {
        name: "Glutamina",
        description:
          "Aminoácido que ayuda en la recuperación muscular y función inmunológica.",
        dosage: "5-10g",
        timing: "Post-entrenamiento o antes de dormir",
      },
      {
        name: "Beta-alanina",
        description:
          "Ayuda a reducir la fatiga muscular y aumentar la resistencia.",
        dosage: "3-5g",
        timing: "Antes del entrenamiento",
      },
      {
        name: "Cafeína",
        description:
          "Estimulante que mejora el rendimiento, la concentración y reduce la percepción de fatiga.",
        dosage: "100-200mg",
        timing: "30-60 minutos antes del entrenamiento",
      },
      {
        name: "Omega-3",
        description:
          "Ácidos grasos esenciales que ayudan a reducir la inflamación y mejoran la salud cardiovascular.",
        dosage: "1-3g",
        timing: "Con las comidas",
      },
      {
        name: "Vitamina D",
        description: "Esencial para la salud ósea, inmunológica y muscular.",
        dosage: "1000-5000 UI",
        timing: "Con una comida que contenga grasas",
      },
      {
        name: "ZMA (Zinc, Magnesio, Vitamina B6)",
        description:
          "Ayuda a mejorar la calidad del sueño y la recuperación muscular.",
        dosage: "Según indicaciones del fabricante",
        timing: "Antes de dormir, con el estómago vacío",
      },
      {
        name: "Multivitamínico",
        description:
          "Proporciona vitaminas y minerales esenciales para la salud general.",
        dosage: "Según indicaciones del fabricante",
        timing: "Con una comida",
      },
    ];

    // Seed the supplements
    const supplements = await Promise.all(
      supplementsToCreate.map((supplement) =>
        prisma.supplement.create({
          data: supplement,
        })
      )
    );

    return NextResponse.json({
      message: `Seeded ${supplements.length} supplements`,
    });
  } catch (error) {
    console.error("Error seeding supplements:", error);
    return NextResponse.json(
      { error: "Failed to seed supplements" },
      { status: 500 }
    );
  }
}
