import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the user's subscription status without deleting their instructor profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isInstructor: false,
        instructorProfile: {
          update: {
            // Mark as not paid
            isPaid: false,
          },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
