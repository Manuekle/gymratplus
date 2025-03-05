import NextAuth from "next-auth/next";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";

// Inicializar cliente de Redis con Upstash
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

// Cache de perfiles de usuario, para evitar consultas repetidas
const PROFILE_CACHE_TTL = 60 * 5; // 5 minutos

export const authOptions = {
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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciales requeridas");
        }

        // Intentar obtener el usuario desde la caché
        const cacheKey = `user:email:${credentials.email}`;
        const cachedUser = await redis.get(cacheKey);

        let user;

        if (cachedUser) {
          user = cachedUser;
        } else {
          // Si no está en caché, buscar en la base de datos
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // Guardar en caché si se encuentra
          if (user) {
            await redis.set(cacheKey, user, {
              ex: 60 * 10, // 10 minutos
            });
          }
        }

        if (!user || !user.password) {
          throw new Error("Usuario no encontrado");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        const failedLoginKey = `failed:login:${credentials.email}`;

        if (!isPasswordValid) {
          // Registrar intentos fallidos para posible rate limiting
          await redis.incr(failedLoginKey);
          await redis.expire(failedLoginKey, 60 * 30); // Expira en 30 minutos

          throw new Error("Contraseña inválida");
        }

        // Limpiar contador de intentos fallidos después de un inicio de sesión exitoso
        await redis.del(failedLoginKey);

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
    // Aumentar maxAge para sesiones más largas
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;

        // Almacenar datos básicos en Redis para acceso rápido
        await redis.hset(`user:${user.id}:data`, {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          lastLogin: new Date().toISOString(),
        });

        // Establecer expiración
        await redis.expire(`user:${user.id}:data`, 30 * 24 * 60 * 60); // 30 días
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;

        // Registrar actividad para tracking de usuarios activos
        await redis.set(`user:${token.id}:lastActive`, Date.now().toString(), {
          ex: 60 * 60 * 24 * 7, // Expira en 7 días
        });

        // Obtener datos básicos desde Redis
        const userData = await redis.hgetall(`user:${token.id}:data`);

        if (userData) {
          session.user.name = userData.name;
          session.user.email = userData.email;
          session.user.image = userData.image;
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

        session.user.profile = profile || null;
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

          if (!profile || !profile.height || !profile.currentWeight) {
            return `${baseUrl}/`;
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

  // Eventos para mantener caché sincronizada
  events: {
    createUser: async ({ user }) => {
      // Invalidar caché después de crear usuario
      await redis.del(`user:email:${user.email}`);
    },
    updateUser: async ({ user }) => {
      // Invalidar caché después de actualizar usuario
      await redis.del(`user:email:${user.email}`);
      await redis.del(`user:${user.id}:data`);
      await redis.del(`profile:${user.id}`);
    },
    signOut: async ({ token }) => {
      // Opcional: Limpiar datos de sesión específicos al cerrar sesión
      if (token?.id) {
        await redis.del(`user:${token.id}:lastActive`);
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Función mejorada para obtener el ID de usuario de la sesión
async function getUserIdFromSession() {
  // Esta función es un placeholder. Implementa la lógica adecuada
  // para obtener el userId de la sesión actual en el contexto de servidor.
  return null;
}
