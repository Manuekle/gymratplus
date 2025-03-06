import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;

  const protectedRoutes = ["/onboarding", "/onboarding/recommendations"];
  const isDashboardRoute = path.startsWith("/dashboard");
  const authRoutes = ["/auth/signin", "/auth/signup"];

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

  // Si el usuario está autenticado y quiere entrar a /auth/signin o /auth/signup
  if (token && authRoutes.includes(path)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
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
  ],
};
