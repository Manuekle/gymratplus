/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions, User, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";

// Inicializar Redis
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

const PROFILE_CACHE_TTL = 60 * 5; // 5 minutos

async function getUserIdFromSession() {
  // Esta función es un placeholder. Implementa la lógica adecuada
  // para obtener el userId de la sesión actual en el contexto de servidor.
  return null;
}

// Definir un tipo de usuario extendido para incluir la contraseña
interface CustomUser extends User {
  id: string;
  email?: string | null; // Permitir null y undefined
  password?: string | null;
  name: string;
  image: string;
}

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
        console.log("Received Credentials:", credentials);

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciales requeridas");
        }

        // Buscar en la base de datos primero
        const user: CustomUser | null = (await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
          },
        })) as CustomUser | null;

        // Si user.password es null, asignarle undefined
        if (user) {
          user.password = user.password ?? undefined;
        }

        // Buscar en caché
        if (!user) {
          const cacheKey = `user:email:${credentials.email}`;
          const cachedUser = await redis.get<string>(cacheKey);

          if (cachedUser) {
            try {
              const parsedUser = JSON.parse(cachedUser);
              console.log("Usuario cargado desde caché:", parsedUser);
              return parsedUser; // Retorna el usuario desde caché si está disponible
            } catch (error) {
              console.error("Error al parsear el usuario en caché:", error);
            }
          }

          throw new Error("Usuario no encontrado");
        }

        // Validar la contraseña
        if (!user.password) {
          throw new Error("Contraseña no encontrada en la base de datos");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Contraseña inválida");
        }

        // Guardar en caché si aún no está
        const cacheKey = `user:email:${credentials.email}`;
        await redis.set(cacheKey, JSON.stringify(user), { ex: 60 * 10 }); // 10 min

        console.log("Usuario guardado en caché:", user);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | AdapterUser }) {
      if (user) {
        const customUser = user as CustomUser; // Forzar tipo CustomUser

        token.id = customUser.id;
        await redis.hset(`user:${customUser.id}:data`, {
          id: customUser.id,
          email: customUser.email ?? "",
          name: customUser.name ?? "",
          image: customUser.image ?? "",
        });
        await redis.expire(`user:${customUser.id}:data`, 30 * 24 * 60 * 60); // 30 días
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        // Registrar actividad para tracking de usuarios activos
        await redis.set(`user:${token.id}:lastActive`, Date.now().toString(), {
          ex: 60 * 60 * 24 * 7, // Expira en 7 días
        });

        // Obtener datos básicos desde Redis
        const userData = (await redis.hgetall(
          `user:${session.user.id}:data`
        )) as Record<string, string | undefined>;

        if (userData) {
          session.user.name = userData.name ?? null;
          session.user.email = userData.email ?? null;
          session.user.image = userData.image ?? null;
        }

        // Obtener el perfil del usuario desde Redis o la BD
        let profile: any = await redis.get(`profile:${session.user.id}`);

        if (!profile) {
          profile = await prisma.profile.findUnique({
            where: { userId: session.user.id },
          });

          if (profile) {
            await redis.set(`profile:${token.id}`, profile, {
              ex: 60 * 60 * 24, // 24 horas
            });
          }
        }

        (session.user as any).profile = profile || null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redireccionar a onboarding si el usuario no tiene un perfil completo
      if (url.startsWith(baseUrl)) {
        // Verificar si necesita completar onboarding
        const userId = await getUserIdFromSession();
        if (userId) {
          // Intentar obtener el perfil desde caché primero
          const profileCacheKey = `profile:${userId}`;
          let profile = await redis.get(profileCacheKey);

          if (!profile) {
            // Si no está en caché, consultar base de datos
            profile = await prisma.profile.findUnique({
              where: { userId },
            });

            // Almacenar en caché para futuras consultas
            if (profile) {
              await redis.set(profileCacheKey, profile, {
                ex: PROFILE_CACHE_TTL,
              });
            }
          }
        }
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
