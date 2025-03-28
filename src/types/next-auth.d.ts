import type { DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    profile?: {
      gender?: string;
      phone?: string;
      birthdate?: Date | string;
      height?: string;
      currentWeight?: string;
      targetWeight?: string;
      activityLevel?: string;
      goal?: string;
      // Add other profile fields as needed
    };
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      experienceLevel: string;
      _localStorage?: {
        name: string;
        email: string;
        experienceLevel: string;
        image: string;
        profile?: {
          gender?: string;
          phone?: string;
          birthdate?: Date | string;
          height?: string;
          currentWeight?: string;
          targetWeight?: string;
          activityLevel?: string;
          goal?: string;
          preferredWorkoutTime?: string;
          dailyActivity?: string;
          dietaryPreference?: string;
        };
      };
    } & DefaultSession["user"];
    profile?: {
      gender?: string;
      phone?: string;
      birthdate?: Date | string;
      height?: string;
      currentWeight?: string;
      targetWeight?: string;
      activityLevel?: string;
      goal?: string;
      // Add other profile fields as needed
    };
  }
}
