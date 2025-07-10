import { DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isInstructor?: boolean;
    experienceLevel?: string;
    profile?: {
      phone?: string;
      birthdate?: Date | string;
      preferredWorkoutTime?: string;
      dailyActivity?: string;
      goal?: string;
      dietaryPreference?: string;
      monthsTraining?: number;
      height?: string;
      currentWeight?: string;
      gender?: string;
    };
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      isInstructor?: boolean;
      experienceLevel?: string;
      profile?: unknown;
      instructorProfile?: unknown;
      _localStorage?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        experienceLevel?: string | null;
        isInstructor?: boolean;
        profile?: unknown;
        instructorProfile?: unknown;
      };
    } & DefaultSession["user"];
      phone?: string;
      birthdate?: Date | string;
      height?: string;
      currentWeight?: string;
  }

  interface User {
    id?: string;
    isInstructor?: boolean;
    experienceLevel?: string;
    interests?: string[]; // Nuevo campo para intereses
    profile?: {
      phone?: string;
      birthdate?: Date | string;
      preferredWorkoutTime?: string;
      dailyActivity?: string;
      goal?: string;
      dietaryPreference?: string;
      monthsTraining?: number;
      height?: number;
      currentWeight?: number;
      gender?: string;
    };
  }
}
