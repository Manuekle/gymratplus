import { DefaultSession } from "next-auth";

// Extend NextAuth v5 types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isInstructor: boolean;
      experienceLevel: string | null;
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
      instructorProfile?: {
        id?: string;
        userId?: string;
        isPaid?: boolean;
      };
      subscriptionTier: string;
      subscriptionStatus: string | null;
      _localStorage: {
        name: string | null;
        email: string | null;
        image: string | null;
        experienceLevel: string | null;
        isInstructor: boolean;
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
        instructorProfile?: {
          id?: string;
          userId?: string;
          isPaid?: boolean;
        };
        subscriptionTier: string;
        subscriptionStatus: string | null;
      };
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    isInstructor?: boolean;
    experienceLevel?: string | null;
    interests?: string[];
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

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isInstructor?: boolean;
    experienceLevel?: string | null;
    interests?: string[];
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
    instructorProfile?: {
      id?: string;
      userId?: string;
      isPaid?: boolean;
    };
    subscriptionTier?: string;
    subscriptionStatus?: string | null;
  }
}
