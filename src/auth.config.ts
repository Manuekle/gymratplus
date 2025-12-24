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
      const isOnVerifyEmail = nextUrl.pathname === "/auth/verify-email";
      const emailVerified = (auth?.user as any)?.emailVerified;
      const isVerified = !!emailVerified;

      // 1. Handle Verify Email Page specific logic
      // This must come BEFORE generic isOnAuth check to avoid loops
      if (isOnVerifyEmail) {
        if (!isLoggedIn) return false; // Redirect to signin
        if (isVerified) return Response.redirect(new URL("/dashboard", nextUrl));
        return true; // Allow stay if logged in and not verified
      }

      // 2. Handle Dashboard
      if (isOnDashboard) {
        if (!isLoggedIn) return false; // Redirect to login
        if (!isVerified) return Response.redirect(new URL("/auth/verify-email", nextUrl));
        return true;
      }

      // 3. Handle other Auth pages (Signin/Signup)
      if (isOnAuth) {
        if (isLoggedIn) {
          // If already verified, go to dashboard
          if (isVerified) return Response.redirect(new URL("/dashboard", nextUrl));
          // If not verified, go to verify-email
          return Response.redirect(new URL("/auth/verify-email", nextUrl));
        }
        return true;
      }

      return true;
    },
  },
  providers: [], // Configured in auth.ts
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
