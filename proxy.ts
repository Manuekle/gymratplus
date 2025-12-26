import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  // Get the current token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const path = req.nextUrl.pathname;

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
  if (token && isDashboardRoute) {
    const profile = token.profile as
      | {
          gender?: string;
          birthdate?: Date | string;
          height?: number;
          currentWeight?: number;
          goal?: string;
        }
      | null
      | undefined;

    // Si no tiene perfil O si tiene perfil pero está incompleto, redirigir a onboarding
    if (!profile) {
      // No tiene perfil - debe completar onboarding
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    const { gender, birthdate, height, currentWeight, goal } = profile;
    if (!gender || !birthdate || !height || !currentWeight || !goal) {
      // Tiene perfil pero está incompleto - debe completar onboarding
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

  // Si el usuario está autenticado y viene de /auth/signin, redirige al dashboard o admin
  if (token && path === "/auth/signin") {
    const authEmail = process.env.AUTH_EMAIL;
    if (token.email === authEmail) {
      // Si es admin, redirigir al panel de administración (o dashboard si prefiere)
      // Por ahora redirigimos al dashboard para dar opción, o admin directo.
      // El usuario pidió "mostrar donde quiere ir".
      // Vamos a redirigir al dashboard, pero el dashboard debe manejar la opción de ir a admin.
      // O podríamos redirigir a una página intermedia si existiera.
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Si el usuario está autenticado y viene de /auth/signup, redirige al onboarding
  if (token && path === "/auth/signup") {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // Manejo de rutas de instructores
  if (token && isDashboardRoute && path.startsWith("/dashboard/students")) {
    // Si el usuario acaba de suscribirse, forzar la actualización del token
    if (req.nextUrl.searchParams.get("subscribed") === "true") {
      const response = NextResponse.next();
      // Forzar la actualización del token
      response.cookies.set({
        name: "__Secure-next-auth.session-token",
        value: "",
        maxAge: -1,
        path: "/",
      });
      return response;
    }

    // Solo instructores pueden acceder a /dashboard/students
    if (!token.isInstructor) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Manejo de rutas de admin
  if (path.startsWith("/admin")) {
    const authEmail = process.env.AUTH_EMAIL;
    if (!token || token.email !== authEmail) {
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
    "/admin/:path*",
  ],
};
