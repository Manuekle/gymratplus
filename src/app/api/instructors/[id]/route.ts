import { NextResponse } from "next/server";
import { Prisma, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Extend the User type to include instructorProfile with students count
type UserWithInstructorProfile = User & {
  instructorProfile: {
    id: string;
    bio: string | null;
    curriculum: string | null;
    pricePerMonth: number | null;
    contactEmail: string | null;
    contactPhone: string | null;
    country: string | null;
    city: string | null;
    isRemote: boolean | null;
    startDate: Date | null;
    experienceYears: number | null;
    rating: number | null;
    students: Array<{ id: string }>;
  } | null;
};

// Type for the instructor profile response
type InstructorResponse = {
  id: string;
  userId: string;
  instructorProfileId: string; // Add instructorProfileId to the response type
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  curriculum: string | null;
  pricePerMonth: number | null;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string | null;
  city: string | null;
  isRemote: boolean;
  status?: string; // Made optional since it's not in the model
  startDate: string;
  specialties: string[]; // This should be handled or removed if not in the model
  experienceYears: number | null;
  rating: number | null;
  totalStudents: number;
};

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    // In Next.js 13+, params is already resolved when the route handler is called
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "Instructor ID is required" },
        { status: 400 },
      );
    }

    // Find the instructor by ID
    const instructor = (await prisma.user.findUnique({
      where: { id },
      include: {
        instructorProfile: {
          include: {
            students: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })) as UserWithInstructorProfile | null;

    if (!instructor) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 },
      );
    }

    // Get the instructor profile and student count
    const instructorProfile = instructor?.instructorProfile;
    const studentCount = instructorProfile?.students?.length || 0;

    if (!instructorProfile) {
      console.error(`[INSTRUCTOR_NOT_FOUND] ID: ${id}`);
      return NextResponse.json(
        { error: "Instructor not found or doesn't have a profile" },
        { status: 404 },
      );
    }

    // Format the response data
    const response: InstructorResponse = {
      id: instructor.id,
      userId: instructor.id,
      instructorProfileId: instructorProfile.id, // Include the instructor profile ID
      name: instructor.name,
      email: instructor.email,
      image: instructor.image,
      bio: instructorProfile.bio ?? null,
      curriculum: instructorProfile.curriculum ?? null,
      pricePerMonth: instructorProfile.pricePerMonth ?? null,
      contactEmail: instructorProfile.contactEmail ?? null,
      contactPhone: instructorProfile.contactPhone ?? null,
      country: instructorProfile.country ?? null,
      city: instructorProfile.city ?? null,
      isRemote: instructorProfile.isRemote ?? false,
      status: "active", // Default status for backward compatibility
      startDate: instructorProfile.startDate
        ? new Date(instructorProfile.startDate).toISOString()
        : new Date().toISOString(),
      specialties: [], // This should be handled or removed if not in the model
      experienceYears: instructorProfile.experienceYears ?? null,
      rating: instructorProfile.rating ?? null,
      totalStudents: studentCount,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[GET_INSTRUCTOR_BY_ID_ERROR]", error);

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2023":
          return NextResponse.json(
            { error: "Invalid instructor ID format" },
            { status: 400 },
          );
        case "P2025":
          return NextResponse.json(
            { error: "Instructor not found" },
            { status: 404 },
          );
        case "P2002":
          return NextResponse.json(
            { error: "A unique constraint was violated" },
            { status: 409 },
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
