/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions, User, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";
import { redis } from "@/lib/redis";

// Cache en memoria para datos de usuario
const userDataCache = new Map<
  string,
  {
    data: Record<string, string | undefined>;
    timestamp: number;
  }
>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

// Función helper para obtener datos de usuario con caché
async function getUserDataWithCache(userId: string) {
  const cached = userDataCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Limpiar la caché en memoria
  userDataCache.delete(userId);

  let userData = (await redis.hgetall(`user:${userId}:data`)) as Record<
    string,
    string | undefined
  >;

  if (!userData || Object.keys(userData).length === 0) {
    const userFromDB = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        experienceLevel: true,
        image: true,
        profile: true,
      },
    });

    if (userFromDB) {
      userData = {
        name: userFromDB.name ?? "",
        email: userFromDB.email ?? "",
        experienceLevel: userFromDB.experienceLevel ?? "",
        image: userFromDB.image ?? "",
        profile: userFromDB.profile
          ? JSON.stringify(userFromDB.profile)
          : undefined,
      };

      // Limpiar la caché de Redis antes de actualizar
      await redis.del(`user:${userId}:data`);
      await redis.hmset(`user:${userId}:data`, userData);
      await redis.expire(`user:${userId}:data`, 60 * 60 * 24); // 24 horas
    }
  }

  if (userData) {
    userDataCache.set(userId, {
      data: userData,
      timestamp: Date.now(),
    });
  }

  return userData;
}

// Definir un tipo de usuario extendido para incluir la contraseña
interface CustomUser extends User {
  id: string;
  email?: string | null; // Permitir null y undefined
  password?: string | null;
  name: string;
  experienceLevel: string;
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
        const customUser = user as CustomUser;
        token.id = customUser.id;
        // Obtener isInstructor de la base de datos
        const dbUser = await prisma.user.findUnique({
          where: { id: customUser.id },
          select: { isInstructor: true },
        });
        token.isInstructor = dbUser?.isInstructor ?? false;
        await redis.hset(`user:${customUser.id}:data`, {
          id: customUser.id,
          email: customUser.email ?? "",
          name: customUser.name ?? "",
          experienceLevel: customUser.experienceLevel ?? "",
          image: customUser.image ?? "",
        });
        await redis.expire(`user:${customUser.id}:data`, 30 * 24 * 60 * 60); // 30 días
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.isInstructor = token.isInstructor as boolean;
        // Obtener datos básicos usando el sistema de caché
        const userData = await getUserDataWithCache(session.user.id);
        // Obtener datos actualizados de la base de datos
        const userFromDB = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            name: true,
            email: true,
            experienceLevel: true,
            image: true,
            profile: true,
          },
        });
        session.user.name = userFromDB?.name ?? userData?.name ?? "";
        session.user.email = userFromDB?.email ?? userData?.email ?? "";
        session.user.experienceLevel =
          userFromDB?.experienceLevel ?? userData?.experienceLevel ?? "";
        session.user.image = userFromDB?.image ?? userData?.image ?? "";
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
        // Agregar datos para localStorage
        session.user = {
          ...session.user,
          _localStorage: {
            name: session.user.name,
            email: session.user.email,
            experienceLevel: session.user.experienceLevel,
            image: session.user.image,
            profile: (session.user as any).profile,
          },
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Si viene de un login, siempre manda al dashboard
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`;
      }
      // Si hay un callbackUrl válido, úsalo
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
