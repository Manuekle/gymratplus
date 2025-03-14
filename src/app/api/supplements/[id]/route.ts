import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET a specific supplement
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const supplementId = params.id;

    const supplement = await prisma.supplement.findUnique({
      where: {
        id: supplementId,
      },
    });

    if (!supplement) {
      return NextResponse.json(
        { error: "Supplement not found" },
        { status: 404 }
      );
    }

    // Check if the supplement is a system supplement or belongs to the user
    if (supplement.userId !== null && supplement.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(supplement);
  } catch (error) {
    console.error("Error fetching supplement:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplement" },
      { status: 500 }
    );
  }
}

// PUT update a supplement
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const supplementId = params.id;
    const data = await req.json();

    // Get the supplement
    const supplement = await prisma.supplement.findUnique({
      where: {
        id: supplementId,
      },
    });

    if (!supplement) {
      return NextResponse.json(
        { error: "Supplement not found" },
        { status: 404 }
      );
    }

    // Check if the supplement is a system supplement or belongs to the user
    if (supplement.userId !== null && supplement.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If it's a system supplement, don't allow updates
    if (supplement.userId === null) {
      return NextResponse.json(
        { error: "Cannot update system supplements" },
        { status: 403 }
      );
    }

    // Update the supplement
    const updatedSupplement = await prisma.supplement.update({
      where: {
        id: supplementId,
      },
      data: {
        name: data.name || supplement.name,
        description:
          data.description !== undefined
            ? data.description
            : supplement.description,
        dosage: data.dosage !== undefined ? data.dosage : supplement.dosage,
        timing: data.timing !== undefined ? data.timing : supplement.timing,
        imageUrl:
          data.imageUrl !== undefined ? data.imageUrl : supplement.imageUrl,
      },
    });

    return NextResponse.json(updatedSupplement);
  } catch (error) {
    console.error("Error updating supplement:", error);
    return NextResponse.json(
      { error: "Failed to update supplement" },
      { status: 500 }
    );
  }
}

// DELETE a supplement
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const supplementId = params.id;

    // Get the supplement
    const supplement = await prisma.supplement.findUnique({
      where: {
        id: supplementId,
      },
    });

    if (!supplement) {
      return NextResponse.json(
        { error: "Supplement not found" },
        { status: 404 }
      );
    }

    // Check if the supplement is a custom supplement and belongs to the user
    if (supplement.userId === null) {
      return NextResponse.json(
        { error: "Cannot delete system supplements" },
        { status: 403 }
      );
    }

    if (supplement.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the supplement
    await prisma.supplement.delete({
      where: {
        id: supplementId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting supplement:", error);
    return NextResponse.json(
      { error: "Failed to delete supplement" },
      { status: 500 }
    );
  }
}
