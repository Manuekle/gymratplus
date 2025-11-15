import { InstructorProfile, User } from "@prisma/client";

export interface InstructorProfileWithUser extends InstructorProfile {
  user: User;
}

export interface InstructorWithProfile extends User {
  instructorProfile: InstructorProfile | null;
}

export interface InstructorResponse
  extends Omit<User, "password" | "emailVerified"> {
  instructorProfile:
    | (Omit<InstructorProfile, "userId" | "createdAt" | "updatedAt"> & {
        tags: string[];
      })
    | null;
}

export interface InstructorFilters {
  tagFilter?: string | null;
  country?: string | null;
  isRemote?: string | null;
  maxPrice?: string | null;
  experienceLevel?: string | null;
}

export interface PrismaWhereConditions {
  isInstructor: boolean;
  instructorProfile: {
    isNot: null;
  } & Record<string, unknown>;
  experienceLevel?: string;
  [key: string]: unknown;
}
