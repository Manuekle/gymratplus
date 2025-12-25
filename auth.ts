import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/database/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import type { NextAuthConfig } from "next-auth";

// --- Type Definitions ---

// import type { Profile, InstructorProfile } from "@prisma/client";

interface CustomUserForCredentials {
  id: string;
  email: string | null;
  password?: string | null;
  name?: string | null;
  image?: string | null;
  isInstructor?: boolean;
  emailVerified?: Date | null; // Add types
}

// --- NextAuth v5 Configuration ---

export const config = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciales requeridas");
        }

        const user = (await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            isInstructor: true,
          },
        })) as CustomUserForCredentials | null;

        if (!user || !user.password) {
          throw new Error("Credenciales inválidas");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Credenciales inválidas");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          isInstructor: user.isInstructor ?? false,
        };
      },
    }),
  ],
  callbacks: {
    // We do NOT override 'authorized' here because middleware uses authConfig.
    // However, for Node environment usage (session checking), authConfig 'authorized' logic is still valid.
    // If we want to extend it, we could.
    // But 'jwt' and 'session' are the critical Node-side callbacks.

    async jwt(params) {
      // Run base mapping logic from authConfig (Edge compatible parts)
      let updatedToken = await authConfig.callbacks.jwt!(params);
      const { user } = params;

      const userId = user?.id || updatedToken.sub;
      if (!userId) return updatedToken;

      try {
        // Fetch fresh data from database (Node only)
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: true,
            instructorProfile: true,
          },
        });

        if (dbUser) {
          console.log(`[AUTH-JWT] User: ${dbUser.email}, DB Verified: ${dbUser.emailVerified}, isOAuth: ${updatedToken.isOAuth}, Image: ${dbUser.image}`);
          updatedToken.picture = dbUser.image;
          updatedToken.name = dbUser.name;
          updatedToken.email = dbUser.email;
          updatedToken.emailVerified = dbUser.emailVerified;
          updatedToken.isInstructor = dbUser.isInstructor ?? false;
          updatedToken.experienceLevel = dbUser.experienceLevel ?? null;
          updatedToken.interests = (dbUser.interests as string[]) ?? [];
          updatedToken.profile = dbUser.profile;
          updatedToken.instructorProfile = dbUser.instructorProfile;
          updatedToken.subscriptionTier = (dbUser as any).subscriptionTier ?? "FREE";
          updatedToken.subscriptionStatus = (dbUser as any).subscriptionStatus ?? null;
        }
      } catch (error) {
        console.error("[AUTH-JWT] Database error:", error);
      }

      return updatedToken;
    },
    async session(params) {
      // Run base mapping from authConfig
      const updatedSession = await authConfig.callbacks.session!(params);
      const { token } = params;

      console.log(`[AUTH-SESSION] Verified: ${(updatedSession.user as any).emailVerified}, isOAuth: ${(updatedSession.user as any).isOAuth}`);

      // Ensure specific fields are present for consistency (Node only enrichments)
      (updatedSession.user as any).instructorProfile = token.instructorProfile;
      (updatedSession.user as any).experienceLevel = token.experienceLevel;
      (updatedSession.user as any).subscriptionStatus = token.subscriptionStatus;

      return updatedSession;
    },
    // We removed 'redirect' here because it's in auth.config.ts?
    // Wait, auth.config.ts has a simple logic. The previous redirect logic was quite specific.
    // If we want to KEEP the previous redirect logic, we should probably add it back or ensure auth.config.ts version covers it.
    // The previous logic handled base URL redirects. auth.config.ts version (in my plan) didn't include the redirect logic?
    // Let me check what I wrote for auth.config.ts step... I copied `callbacks: { authorized }`.
    // I did NOT copy the `redirect` callback to auth.config.ts.
    // So I should keep `redirect` HERE effectively by merging, but `...authConfig` is spread first.
    // So if I add `redirect` here, it works.
    async redirect({ url, baseUrl }) {
      try {
        // If URL is the base, redirect to dashboard
        if (url === baseUrl || url === `${baseUrl}/`) {
          return `${baseUrl}/dashboard`;
        }

        // If URL starts with base, it's a valid internal URL
        if (url.startsWith(baseUrl)) {
          return url;
        }

        // Handle relative URLs (e.g., /profile)
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`;
        }

        // Default: redirect to dashboard
        return `${baseUrl}/dashboard`;
      } catch (e) {
        console.error("Error in redirect:", e);
        return `${baseUrl}/dashboard`;
      }
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
