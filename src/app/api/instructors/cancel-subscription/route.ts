import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/database/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the user's subscription status
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isInstructor: false,
      },
      include: {
        instructorProfile: true,
      },
    });

    // Invalidate the session to force a refresh
    const response = NextResponse.json(
      {
        success: true,
        redirectTo: "/dashboard",
        isInstructor: updatedUser.isInstructor,
      },
      { status: 200 },
    );

    // Update the session cookie with the new isInstructor status
    response.cookies.set({
      name: "__Secure-next-auth.session-token",
      value: JSON.stringify({
        ...session,
        user: {
          ...session.user,
          isInstructor: false,
        },
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
