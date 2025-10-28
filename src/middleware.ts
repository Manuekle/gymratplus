import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Get the current token
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;

  // Check if this is a request to update the instructor status
  if (path === "/api/auth/session" && req.method === "POST") {
    const body = await req.json();
    if (
      body?.isInstructor !== undefined &&
      token?.isInstructor !== body.isInstructor
    ) {
      // Create a new response with the updated token
      const response = NextResponse.next();
      const newToken = {
        ...token,
        isInstructor: body.isInstructor,
        // Force token update by modifying the expiry
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      };

      // Set the updated token in the session cookie
      response.cookies.set({
        name: "__Secure-next-auth.session-token",
        value: JSON.stringify(newToken),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return response;
    }
  }

  const protectedRoutes = [
    "/onboarding",
    "/onboarding/recommendations",
    "/dashboard/instructors",
  ];
  const isDashboardRoute = path.startsWith("/dashboard");

  // Si el usuario NO está autenticado y quiere acceder a rutas protegidas
  if (!token && (protectedRoutes.includes(path) || isDashboardRoute)) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // Si el usuario está autenticado pero no tiene perfil o está incompleto
  if (token?.profile && isDashboardRoute) {
    const { gender, birthdate, height, currentWeight, goal } = token.profile;

    if (!gender || !birthdate || !height || !currentWeight || !goal) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  // Si el usuario está autenticado y quiere acceder al panel de instructores pero no es instructor
  /* if (token && isDashboardRoute && path.includes("/dashboard/instructors")) {
    const user = token?.user as User;
    if (!user?.role?.includes(UserRole.INSTRUCTOR)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } */

  // Si el usuario está autenticado y viene de /auth/signin, redirige al dashboard
  if (token && path === "/auth/signin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Si el usuario está autenticado y viene de /auth/signup, redirige al onboarding
  if (token && path === "/auth/signup") {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // Manejo de rutas de instructores
  if (token && isDashboardRoute && path.startsWith("/dashboard/students")) {
    // Solo instructores pueden acceder a /dashboard/students
    if (!token.isInstructor) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Manejo de rutas de estudiantes
  if (token && isDashboardRoute && path.startsWith("/dashboard/instructors")) {
    // Solo estudiantes pueden acceder a /dashboard/instructors
    if (token.isInstructor) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/onboarding/:path*",
    "/onboarding/recommendations",
    "/dashboard/:path*",
    "/auth/signin",
    "/auth/signup",
    "/dashboard/students/:path*",
    "/dashboard/instructors/:path*",
  ],
};
