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
    async jwt({ token, user, account, trigger, session }) {
      // Basic mapping on first sign in
      if (user) {
        token.sub = user.id;
        token.isInstructor = (user as any).isInstructor;
        token.subscriptionTier = (user as any).subscriptionTier;
      }
      if (account) {
        token.isOAuth = account.provider !== "credentials";
      }

      // Handle update trigger from client-side update()
      if (trigger === "update" && session?.user) {
        return { ...token, ...session.user };
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || session.user.id;
        session.user.name = (token.name as string) || session.user.name;
        session.user.image = (token.picture as string) || session.user.image;
        (session.user as any).emailVerified = token.emailVerified as any;
        (session.user as any).isOAuth = !!token.isOAuth;
        (session.user as any).profile = token.profile as any;
        (session.user as any).isInstructor = token.isInstructor as any;
        (session.user as any).subscriptionTier = token.subscriptionTier as any;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isOnAuth = pathname.startsWith("/auth");
      const isOnVerifyEmail = pathname === "/auth/verify-email";
      const isOnOnboarding = pathname === "/onboarding";
      const isOnPublic =
        pathname === "/" ||
        pathname === "/about" ||
        pathname === "/privacy" ||
        pathname === "/terms" ||
        pathname === "/terms-of-service" ||
        pathname.startsWith("/profile");

      const rawVerified = (auth?.user as any)?.emailVerified;
      const isOAuth = !!(auth?.user as any)?.isOAuth;
      const isVerified = !!rawVerified || isOAuth;
      const hasProfile = !!(auth?.user as any)?.profile;

      console.log(
        `[AUTH-MW] Path: ${pathname}, LoggedIn: ${isLoggedIn}, VerifiedVal: ${rawVerified}, isOAuth: ${isOAuth}, isVerified: ${isVerified}, Profile: ${hasProfile}`,
      );

      // 1. If not logged in
      if (!isLoggedIn) {
        if (isOnPublic || (isOnAuth && !isOnVerifyEmail)) return true;
        return false;
      }

      // 2. If logged in but not verified
      if (!isVerified) {
        if (isOnVerifyEmail) return true;
        return Response.redirect(new URL("/auth/verify-email", nextUrl));
      }

      // 3. If logged in and verified
      // If on verify page or other auth pages, move forward
      if (isOnVerifyEmail || (isOnAuth && pathname !== "/auth/error")) {
        if (!hasProfile)
          return Response.redirect(new URL("/onboarding", nextUrl));
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Handle Onboarding state
      if (!hasProfile) {
        if (isOnOnboarding) return true;
        return Response.redirect(new URL("/onboarding", nextUrl));
      }

      // Has profile - should not be on onboarding
      if (isOnOnboarding) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Configured in auth.ts
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
