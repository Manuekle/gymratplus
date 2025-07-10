import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isInstructor: boolean;
    experienceLevel?: string;
    profile?: {
      phone?: string;
      birthdate?: Date | string;
      preferredWorkoutTime?: string;
      dailyActivity?: string;
      goal?: string;
      dietaryPreference?: string;
      monthsTraining?: number;
    };
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isInstructor: boolean;
      experienceLevel?: string;
      profile?: {
        phone?: string;
        birthdate?: Date | string;
        preferredWorkoutTime?: string;
        dailyActivity?: string;
        goal?: string;
        dietaryPreference?: string;
        monthsTraining?: number;
      };
    } & DefaultSession["user"];
      phone?: string;
      birthdate?: Date | string;
      height?: string;
      currentWeight?: string;
  }

  interface User extends DefaultUser {
    isInstructor: boolean;
    experienceLevel?: string;
    profile?: {
      phone?: string;
      birthdate?: Date | string;
      preferredWorkoutTime?: string;
      dailyActivity?: string;
      goal?: string;
      dietaryPreference?: string;
      monthsTraining?: number;
    };
  }
}
