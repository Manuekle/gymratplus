import type { NextAuthConfig } from "next-auth";

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

        // Enforce email verification
        const emailVerified = (auth.user as any)?.emailVerified;
        const isVerified = !!emailVerified;

        // If user is logged in but not verified, redirect to verify-email
        // BUT allow access to onboarding API endpoints or profile APIs if needed?
        // Actually, just block dashboard access.
        if (!isVerified) {
          return Response.redirect(new URL("/auth/verify-email", nextUrl));
        }

        return true;
      }

      if (isOnAuth) {
        if (isLoggedIn) {
          // Check verification status before redirecting to dashboard
          const emailVerified = (auth.user as any)?.emailVerified;
          if (!emailVerified) {
            return Response.redirect(new URL("/auth/verify-email", nextUrl));
          }
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // Handle verify-email page
      const isOnVerifyEmail = nextUrl.pathname === "/auth/verify-email";
      if (isOnVerifyEmail) {
        if (!isLoggedIn) return Response.redirect(new URL("/auth/signin", nextUrl));

        const emailVerified = (auth.user as any)?.emailVerified;
        if (emailVerified) {
          // Already verified, go to dashboard
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true; // Allow access to verify page
      }

      return true;
    },
  },
  providers: [], // Configured in auth.ts
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
