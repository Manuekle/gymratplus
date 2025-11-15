import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/database/prisma";
import {
  DefaultSession,
  NextAuthOptions,
  User as NextAuthUser,
  Session as NextAuthSession,
} from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
// import { redis } from "@/lib/database/redis"; // Reserved for future use

// --- 1. Extensión de Tipos para NextAuth ---

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

declare module "next-auth" {
  // Aseguramos que Session extienda NextAuthSession
  interface Session extends NextAuthSession {
    user: {
      id: string;
      isInstructor: boolean;
      experienceLevel: string | null;
      profile: ProfileType | null;
      instructorProfile: InstructorProfileType | null;
      _localStorage: {
        name: string | null;
        email: string | null;
        image: string | null;
        experienceLevel: string | null;
        isInstructor: boolean;
        profile: ProfileType | null;
        instructorProfile: InstructorProfileType | null;
      };
    } & DefaultSession["user"];
  }

  // Aseguramos que User extienda NextAuthUser
  interface User extends NextAuthUser {
    id: string;
    isInstructor?: boolean;
    experienceLevel?: string | null;
    profile?: ProfileType | null;
    instructorProfile?: InstructorProfileType | null;
  }
}

declare module "next-auth/jwt" {
  // Aseguramos que JWT extienda NextAuthJWT
  interface JWT extends NextAuthJWT {
    id: string;
    name: string | null; // Se tipa como null si no está presente
    email: string | null; // Se tipa como null si no está presente
    image: string | null; // Se tipa como null si no está presente
    isInstructor: boolean;
    experienceLevel: string | null;
    profile: ProfileType | null;
    instructorProfile: InstructorProfileType | null;
    interests?: string[];
  }
}

// --- 2. Tipado para Credentials Provider ---

interface CustomUserForCredentials extends NextAuthUser {
  id: string;
  email: string | null;
  password?: string | null;
  name?: string | null;
  image?: string | null;
  isInstructor?: boolean;
}

// --- 3. Opciones de NextAuth (authOptions) ---

export const authOptions: NextAuthOptions = {
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
          where: { email: credentials.email },
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
          credentials.password,
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
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user, trigger = "default", session }) {
      const isLoginOrInitialSession = !!user;
      const userId = user?.id || token.id;

      if (!userId) return token;

      // 1. Get fresh data from database on login or if token is missing extended data
      if (isLoginOrInitialSession || !token.profile) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: true,
            instructorProfile: true,
          },
        });

        if (dbUser) {
          // Update basic fields (from DefaultSession)
          token.id = dbUser.id;
          // Coalesce a null si no existen para asegurar la tipificación de JWT
          token.name = dbUser.name ?? null;
          token.email = dbUser.email ?? null;
          token.image = dbUser.image ?? null;

          // Update extended fields
          token.isInstructor = dbUser.isInstructor ?? false;
          token.experienceLevel = dbUser.experienceLevel ?? null;
          token.interests = (dbUser.interests as string[]) ?? [];
          token.profile = (dbUser.profile as ProfileType | null) ?? null;
          token.instructorProfile =
            (dbUser.instructorProfile as InstructorProfileType | null) ?? null;
        }
      }

      // 2. Handle 'update' trigger - Forzar recarga desde la base de datos
      if (trigger === "update") {
        // Cuando se actualiza algo importante (imagen, isInstructor, etc),
        // forzar recarga desde la base de datos para obtener los datos más recientes
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: true,
            instructorProfile: true,
          },
        });

        if (dbUser) {
          // Actualizar todos los campos desde la base de datos
          token.id = dbUser.id;
          token.name = dbUser.name ?? null;
          token.email = dbUser.email ?? null;
          token.image = dbUser.image ?? null;
          token.isInstructor = dbUser.isInstructor ?? false;
          token.experienceLevel = dbUser.experienceLevel ?? null;
          token.interests = (dbUser.interests as string[]) ?? [];
          token.profile = (dbUser.profile as ProfileType | null) ?? null;
          token.instructorProfile =
            (dbUser.instructorProfile as InstructorProfileType | null) ?? null;
        }

        // Si session tiene datos específicos, también actualizarlos
        if (session?.user) {
          if (session.user.image !== undefined) {
            token.image = session.user.image;
          }
          if (session.user.isInstructor !== undefined) {
            token.isInstructor = session.user.isInstructor;
          }
        }
      }

      return token as NextAuthJWT; // Aseguramos que el retorno es el tipo JWT de next-auth
    },
    async session({ session, token }) {
      if (!session.user || !token.id) return session as NextAuthSession;

      // Usamos el token tipado para poblar la sesión
      const typedToken = token as JWT;

      const sessionUser = {
        ...session.user,
        id: typedToken.id,
        // Usar la triple coalescencia: token -> session default -> null
        name: typedToken.name ?? session.user.name ?? null,
        email: typedToken.email ?? session.user.email ?? null,
        image: typedToken.image ?? session.user.image ?? null,

        isInstructor: typedToken.isInstructor,
        experienceLevel: typedToken.experienceLevel,
        profile: typedToken.profile,
        instructorProfile: typedToken.instructorProfile,
      };

      const localStorageData = {
        ...sessionUser, // Copia los campos de sessionUser
        // Asegurar que profile/instructorProfile se mantienen con el tipo correcto
        profile: typedToken.profile,
        instructorProfile: typedToken.instructorProfile,
      };

      return {
        ...session,
        user: {
          ...sessionUser,
          _localStorage: localStorageData,
        },
      } as NextAuthSession; // Aseguramos el retorno del tipo Session de next-auth
    },
    async redirect({ url, baseUrl }): Promise<string> {
      try {
        // Corrección de sintaxis: se incluye la llave de cierre de la función.

        // 1. Si la URL es la base, redirigir al dashboard
        if (url === baseUrl || url === `${baseUrl}/`) {
          return `${baseUrl}/dashboard`;
        }

        // 2. Si la URL comienza con la base, es una URL interna válida
        if (url.startsWith(baseUrl)) {
          return url;
        }

        // 3. Manejo de URLs relativas (ej: /perfil)
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`;
        }

        // 4. Default: si no es válida o es externa, redirigir al dashboard o a la base
        return `${baseUrl}/dashboard`;
      } catch (e) {
        console.error("Error en la redirección:", e);
        // Fallback seguro en caso de error
        return `${baseUrl}/dashboard`;
      }
    }, // <-- Aquí faltaba la llave de cierre
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
