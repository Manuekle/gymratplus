/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions, User, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";
import { JWT } from "next-auth/jwt";

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
  password?: string;
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciales requeridas");
        }

        // Buscar en caché
        const cacheKey = `user:email:${credentials.email}`;
        const cachedUser = await redis.get<string>(cacheKey);

        const user: CustomUser | null = cachedUser
          ? JSON.parse(cachedUser)
          : await prisma.user.findUnique({
              where: { email: credentials.email },
            });

        if (!user || !user.password) {
          throw new Error("Usuario no encontrado");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Contraseña inválida");
        }

        // Guardar en caché si es necesario
        if (!cachedUser) {
          await redis.set(cacheKey, JSON.stringify(user), { ex: 60 * 10 }); // 10 min
        }

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
    async jwt({ token, user }: { token: JWT; user?: CustomUser }) {
      if (user) {
        token.id = user.id;
        await redis.hset(`user:${user.id}:data`, {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        });
        await redis.expire(`user:${user.id}:data`, 30 * 24 * 60 * 60); // 30 días
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        // Registrar actividad para tracking de usuarios activos
        await redis.set(`user:${token.id}:lastActive`, Date.now().toString(), {
          ex: 60 * 60 * 24 * 7, // Expira en 7 días
        });

        // Obtener datos básicos desde Redis
        const userData = (await redis.hgetall(
          `user:${token.id}:data`
        )) as Record<string, string | undefined>;

        if (userData) {
          session.user.name = userData.name ?? null;
          session.user.email = userData.email ?? null;
          session.user.image = userData.image ?? null;
        }

        // Obtener el perfil del usuario desde Redis o la BD
        let profile = await redis.get(`profile:${token.id}`);

        if (!profile) {
          profile = await prisma.profile.findUnique({
            where: { userId: token.id },
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
    error: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
