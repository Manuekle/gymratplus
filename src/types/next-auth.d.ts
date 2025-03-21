// import { DefaultSession } from "next-auth";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//     } & DefaultSession["user"];
//   }
// }
import type { DefaultSession } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    profile?: {
      gender?: string;
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
      // Other user fields
    } & DefaultSession["user"];
    profile?: {
      gender?: string;
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
