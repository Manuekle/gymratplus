/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { DefaultSession, NextAuthOptions, User, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { AdapterUser } from "next-auth/adapters";
import { redis } from "@/lib/redis";

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      isInstructor?: boolean;
      experienceLevel?: string;
      profile?: any;
      instructorProfile?: any;
      _localStorage?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        experienceLevel?: string | null;
        isInstructor?: boolean;
        profile?: any;
        instructorProfile?: any;
      };
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    isInstructor?: boolean;
    experienceLevel?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    isInstructor?: boolean;
  }
}

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
          user.password,
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

        // Obtener datos completos del usuario
        const dbUser = await prisma.user.findUnique({
          where: { id: customUser.id },
        });
        token.isInstructor = dbUser?.isInstructor ?? false;
        // @ts-expect-error interests puede no estar tipado correctamente
        token.interests = dbUser?.interests ?? [];
        // @ts-expect-error profile puede no estar tipado correctamente
        token.profile = dbUser?.profile ?? null;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      try {
        if (!session.user) return session;
        
        // Establecer valores por defecto
        session.user.id = typeof token.id === "string" ? token.id : "";
        
        // 1. Obtener datos del usuario desde la base de datos (sin caché para asegurar datos frescos)
        const userFromDB = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            name: true,
            email: true,
            experienceLevel: true,
            image: true,
            isInstructor: true,
            instructorProfile: {
              select: { 
                id: true,
                isPaid: true
              }
            }
          },
        }).catch(() => null);

        // 2. Determinar si el usuario es instructor (directamente desde la base de datos)
        const isInstructor = Boolean(userFromDB?.isInstructor);

        // 3. Si el estado no coincide, actualizar la base de datos
        if (userFromDB && userFromDB.isInstructor !== isInstructor) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: { isInstructor }
          });
        }

        // 4. Obtener perfil de instructor si es necesario
        let instructorProfile = null;
        if (isInstructor) {
          instructorProfile = await prisma.instructorProfile.findUnique({
            where: { userId: session.user.id },
          }).catch(() => null);
        }

        // 5. Obtener datos en caché (solo para valores por defecto)
        const cachedUserData = await getUserDataWithCache(session.user.id).catch(() => ({} as Record<string, string>));
        
        // 6. Preparar datos seguros para la sesión
        const safeUserData = {
          name: userFromDB?.name || (cachedUserData?.name || ""),
          email: userFromDB?.email || (cachedUserData?.email || ""),
          experienceLevel: userFromDB?.experienceLevel || (cachedUserData?.experienceLevel || ""),
          image: userFromDB?.image || (cachedUserData?.image || ""),
          isInstructor
        };
        
        // 7. Establecer el estado en la sesión
        session.user.isInstructor = isInstructor;

        // Obtener perfil del usuario
        let profile = null;
        try {
          const cachedProfile = await redis.get(`profile:${session.user.id}`);
          profile = cachedProfile && typeof cachedProfile === 'string' ? JSON.parse(cachedProfile) : null;
          
          if (!profile) {
            profile = await prisma.profile.findUnique({
              where: { userId: session.user.id },
            });
            
            if (profile) {
              await redis.set(
                `profile:${session.user.id}`, 
                JSON.stringify(profile),
                { ex: 60 * 60 * 24 } // 24 horas
              );
            }
          }
        } catch (error) {
          console.error("Error al cargar el perfil:", error);
        }

        // Construir objeto de sesión
        return {
          ...session,
          user: {
            ...session.user,
            ...safeUserData,
            profile: profile || null,
            instructorProfile: instructorProfile || null,
            _localStorage: {
              ...safeUserData,
              profile: profile || null,
              instructorProfile: instructorProfile || null
            }
          }
        };
      } catch (error) {
        console.error("Error en la sesión:", error);
        // Devolver una sesión mínima en caso de error
        return {
          ...session,
          user: {
            id: session.user?.id || "",
            name: session.user?.name || "",
            email: session.user?.email || "",
            image: session.user?.image || "",
            isInstructor: false,
            experienceLevel: "",
            profile: null,
            instructorProfile: null,
            _localStorage: {
              name: session.user?.name || "",
              email: session.user?.email || "",
              image: session.user?.image || "",
              isInstructor: false,
              experienceLevel: "",
              profile: null,
              instructorProfile: null
            }
          }
        };
      }

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
