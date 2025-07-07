import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
/* import { UserRole, User } from "@/types/user"; */

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;

  const protectedRoutes = ["/onboarding", "/onboarding/recommendations", "/dashboard/instructors"];
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
