import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/database/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";

// --- Type Definitions ---

type ProfileType = {
  id: string;
  userId: string;
  [key: string]: unknown;
};

type InstructorProfileType = {
  id: string;
  userId: string;
  isPaid: boolean;
  [key: string]: unknown;
};

interface CustomUserForCredentials {
  id: string;
  email: string | null;
  password?: string | null;
  name?: string | null;
  image?: string | null;
  isInstructor?: boolean;
}

// --- NextAuth v5 Configuration ---

export const config = {
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
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const isLoginOrInitialSession = !!user;
      const userId = user?.id || token.sub;

      if (!userId) return token;

      // Get fresh data from database on login or if token is missing extended data
      if (isLoginOrInitialSession || !token.profile) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: true,
            instructorProfile: true,
          },
        });

        if (dbUser) {
          // Update basic fields
          token.sub = dbUser.id;
          token.name = dbUser.name ?? null;
          token.email = dbUser.email ?? null;
          token.picture = dbUser.image ?? null;

          // Update extended fields
          token.isInstructor = dbUser.isInstructor ?? false;
          token.experienceLevel = dbUser.experienceLevel ?? null;
          token.interests = (dbUser.interests as string[]) ?? [];
          token.profile = (dbUser.profile as ProfileType | null) ?? null;
          token.instructorProfile =
            (dbUser.instructorProfile as InstructorProfileType | null) ?? null;
          token.subscriptionTier = (dbUser as any).subscriptionTier ?? "FREE";
          token.subscriptionStatus = (dbUser as any).subscriptionStatus ?? null;
        }
      }

      // Handle 'update' trigger - Force reload from database
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: true,
            instructorProfile: true,
          },
        });

        if (dbUser) {
          // Update all fields from database
          token.sub = dbUser.id;
          token.name = dbUser.name ?? null;
          token.email = dbUser.email ?? null;
          token.picture = dbUser.image ?? null;
          token.isInstructor = dbUser.isInstructor ?? false;
          token.experienceLevel = dbUser.experienceLevel ?? null;
          token.interests = (dbUser.interests as string[]) ?? [];
          token.profile = (dbUser.profile as ProfileType | null) ?? null;
          token.instructorProfile =
            (dbUser.instructorProfile as InstructorProfileType | null) ?? null;
          token.subscriptionTier = (dbUser as any).subscriptionTier ?? "FREE";
          token.subscriptionStatus = (dbUser as any).subscriptionStatus ?? null;
        }

        // If session has specific data, also update it
        if (session?.user) {
          if (session.user.image !== undefined) {
            token.picture = session.user.image;
          }
          if (session.user.isInstructor !== undefined) {
            token.isInstructor = session.user.isInstructor;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token.sub) return session;

      const sessionUser = {
        ...session.user,
        id: token.sub,
        name: token.name ?? session.user.name ?? null,
        email: token.email ?? session.user.email ?? null,
        image: token.picture ?? session.user.image ?? null,
        isInstructor: token.isInstructor as boolean,
        experienceLevel: token.experienceLevel as string | null,
        profile: token.profile as ProfileType | null,
        instructorProfile:
          token.instructorProfile as InstructorProfileType | null,
        subscriptionTier: token.subscriptionTier as string,
        subscriptionStatus: token.subscriptionStatus as string | null,
      };

      const localStorageData = {
        ...sessionUser,
        profile: token.profile as ProfileType | null,
        instructorProfile:
          token.instructorProfile as InstructorProfileType | null,
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
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
