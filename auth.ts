import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/database/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import type { NextAuthConfig } from "next-auth";

// --- Type Definitions ---

import type { Profile, InstructorProfile } from "@prisma/client";

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

    async jwt({ token, user, account, trigger, session }) {
      // 1. Save data from account on first sign in
      if (account) {
        token.isOAuth = !!account.provider && account.provider !== "credentials";
      }

      const userId = user?.id || token.sub;

      if (!userId) return token;

      // Always get fresh data from database
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          instructorProfile: true,
        },
      });

      if (dbUser) {
        console.log(`[AUTH-JWT] User: ${dbUser.email}, DB Verified: ${dbUser.emailVerified}, isOAuth: ${token.isOAuth}`);
        // Update basic fields
        token.sub = dbUser.id;
        token.name = dbUser.name ?? null;
        token.email = dbUser.email ?? null;
        token.picture = dbUser.image ?? null;
        token.emailVerified = dbUser.emailVerified;

        // If it's an OAuth user and emailVerified is null in DB, we should technically trust them
        // but Prisma Adapter usually sets it.

        // Update extended fields
        token.isInstructor = dbUser.isInstructor ?? false;
        token.experienceLevel = dbUser.experienceLevel ?? null;
        token.interests = (dbUser.interests as string[]) ?? [];
        token.profile = dbUser.profile as Profile | null as any;
        token.instructorProfile =
          dbUser.instructorProfile as InstructorProfile | null as any;
        token.subscriptionTier = (dbUser as any).subscriptionTier ?? "FREE";
        token.subscriptionStatus = (dbUser as any).subscriptionStatus ?? null;
      }

      // Handle 'update' trigger
      if (trigger === "update" && session?.user) {
        console.log("[AUTH-JWT] Update trigger detected");
        if (session.user.image !== undefined) token.picture = session.user.image;
        if (session.user.isInstructor !== undefined) token.isInstructor = session.user.isInstructor;
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.sub) return session;

      console.log(`[AUTH-SESSION] Verified: ${token.emailVerified}, isOAuth: ${token.isOAuth}`);

      const sessionUser = {
        ...session.user,
        id: token.sub,
        name: token.name ?? session.user.name ?? null,
        email: token.email ?? session.user.email ?? null,
        image: token.picture ?? session.user.image ?? null,
        emailVerified: (token.emailVerified as Date | null) || (token.isOAuth ? new Date() : null),
        isOAuth: !!token.isOAuth,
        isInstructor: token.isInstructor as boolean,
        experienceLevel: token.experienceLevel as string | null,
        profile: token.profile as any,
        instructorProfile: token.instructorProfile as any,
        subscriptionTier: token.subscriptionTier as string,
        subscriptionStatus: token.subscriptionStatus as string | null,
      };

      const localStorageData = {
        ...sessionUser,
        profile: token.profile as any,
        instructorProfile: token.instructorProfile as any,
        subscriptionTier: token.subscriptionTier as string,
        subscriptionStatus: token.subscriptionStatus as string | null,
      };

      return {
        ...session,
        user: {
          ...sessionUser,
          _localStorage: localStorageData,
        },
      };
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
