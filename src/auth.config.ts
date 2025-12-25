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
      const pathname = nextUrl.pathname;

      const isOnAuth = pathname.startsWith("/auth");
      const isOnVerifyEmail = pathname === "/auth/verify-email";
      const isOnOnboarding = pathname === "/onboarding";
      const isOnPublic = pathname === "/" || pathname === "/about" || pathname === "/privacy"; // Add public pages if any

      const rawVerified = (auth?.user as any)?.emailVerified;
      const isOAuth = !!(auth?.user as any)?.isOAuth;
      const isVerified = !!rawVerified || isOAuth;
      const hasProfile = !!(auth?.user as any)?.profile;

      console.log(`[AUTH-MW] Path: ${pathname}, LoggedIn: ${isLoggedIn}, VerifiedVal: ${rawVerified}, isOAuth: ${isOAuth}, isVerified: ${isVerified}, Profile: ${hasProfile}`);

      // 1. If not logged in
      if (!isLoggedIn) {
        // Allow public pages and auth pages (except verify-email which needs login)
        if (isOnPublic || (isOnAuth && !isOnVerifyEmail)) {
          return true;
        }
        return false; // Redirect to sign-in
      }

      // 2. If logged in but not verified
      if (!isVerified) {
        // Allow verify-email page
        if (isOnVerifyEmail) return true;
        // Redirect everything else (except maybe logout/api if not caught) to verify-email
        return Response.redirect(new URL("/auth/verify-email", nextUrl));
      }

      // 3. If logged in and verified
      if (isVerified) {
        // If on verify page or other auth pages, move forward
        if (isOnVerifyEmail || isOnAuth) {
          if (!hasProfile) return Response.redirect(new URL("/onboarding", nextUrl));
          return Response.redirect(new URL("/dashboard", nextUrl));
        }

        // Handle Onboarding state
        if (!hasProfile) {
          if (isOnOnboarding) return true;
          // Protect dashboard and others if no profile
          return Response.redirect(new URL("/onboarding", nextUrl));
        }

        // Has profile - should not be on onboarding
        if (isOnOnboarding) {
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
