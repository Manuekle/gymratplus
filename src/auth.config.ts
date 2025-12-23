import type { NextAuthConfig } from "next-auth";
import { SubscriptionTier, hasAccess } from "@/lib/subscriptions/feature-gates";

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAuth = nextUrl.pathname.startsWith("/auth");

      if (isOnDashboard) {
        if (!isLoggedIn) return false; // Redirect to login

        // Role-based Access Control
        const userTier = (auth?.user as any)?.subscriptionTier || "FREE";
        const path = nextUrl.pathname;

        // Instructor-only routes
        if (
          path.startsWith("/dashboard/students") &&
          !hasAccess(userTier, SubscriptionTier.INSTRUCTOR)
        ) {
          return Response.redirect(
            new URL("/dashboard/profile/billing?upgrade=instructor", nextUrl),
          );
        }

        // Pro-only routes
        if (
          (path.startsWith("/dashboard/nutrition") ||
            path.startsWith("/dashboard/chats")) &&
          !hasAccess(userTier, SubscriptionTier.PRO)
        ) {
          return Response.redirect(
            new URL("/dashboard/profile/billing?upgrade=pro", nextUrl),
          );
        }

        return true;
      }

      if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return true;
    },
  },
  providers: [], // Configured in auth.ts
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
