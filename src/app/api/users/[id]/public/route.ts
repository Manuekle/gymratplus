import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";

type UserPublicResponse = {
  id: string;
  name: string | null;
  image: string | null;
  isInstructor: boolean;
  instructorProfile?: {
    id: string;
    bio: string | null;
    curriculum: string | null;
    pricePerMonth: number | null;
    contactEmail: string | null;
    contactPhone: string | null;
    country: string | null;
    city: string | null;
    isRemote: boolean;
    isPaid: boolean;
    totalStudents: number;
  };
  profile?: {
    goal: string | null;
    experienceLevel?: string | null;
  };
};

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Find the user by ID with public information
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        instructorProfile: {
          include: {
            students: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
        profile: {
          select: {
            goal: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format the response data
    const response: UserPublicResponse = {
      id: user.id,
      name: user.name,
      image: user.image,
      isInstructor: user.isInstructor,
      profile: user.profile
        ? {
          goal: user.profile.goal,
          experienceLevel: user.experienceLevel || null,
        }
        : undefined,
    };

    // If user is an instructor, include instructor profile
    if (user.isInstructor && user.instructorProfile) {
      // Count students (both pending and active)
      const studentCount =
        user.instructorProfile.students?.filter(
          (s) => s.status === "active" || s.status === "pending",
        ).length || 0;
      response.instructorProfile = {
        id: user.instructorProfile.id,
        bio: user.instructorProfile.bio,
        curriculum: user.instructorProfile.curriculum,
        pricePerMonth: user.instructorProfile.pricePerMonth,
        contactEmail: user.instructorProfile.contactEmail,
        contactPhone: user.instructorProfile.contactPhone,
        country: user.instructorProfile.country,
        city: user.instructorProfile.city,
        isRemote: user.instructorProfile.isRemote,
        isPaid: user.instructorProfile.isPaid,
        totalStudents: studentCount,
      };
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[GET_USER_PUBLIC_ERROR]", error);

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2023":
          return NextResponse.json(
            { error: "Invalid user ID format" },
            { status: 400 },
          );
        case "P2025":
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 },
          );
        default:
          console.error("Prisma error code:", error.code);
          break;
      }
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 },
    );
  }
}
