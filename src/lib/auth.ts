import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";
import { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";

// Inicializar cliente de Redis con Upstash
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
});

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

        // Intentar obtener el usuario desde la caché
        const cacheKey = `user:email:${credentials.email}`;
        const cachedUser = await redis.get<string>(cacheKey);

        let user: User | null;

        if (cachedUser) {
          user = JSON.parse(cachedUser);
        } else {
          // Si no está en caché, buscar en la base de datos
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // Guardar en caché si se encuentra
          if (user) {
            await redis.set(cacheKey, JSON.stringify(user), {
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

        if (!isPasswordValid) {
          throw new Error("Contraseña inválida");
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
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        await redis.hset(`user:${user.id}:data`, {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          lastLogin: new Date().toISOString(),
        });
        await redis.expire(`user:${user.id}:data`, 30 * 24 * 60 * 60); // 30 días
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;

        // Obtener datos básicos desde Redis
        const userData = await redis.hgetall(`user:${token.id}:data`);
        if (userData) {
          session.user.name = userData.name as string;
          session.user.email = userData.email as string;
          session.user.image = userData.image as string;
        }

        // Obtener perfil del usuario
        let profile: { height?: number; currentWeight?: number } | null =
          await redis.get(`profile:${token.id}`);

        if (!profile) {
          const dbProfile = await prisma.profile.findUnique({
            where: { userId: token.id as string },
          });

          if (dbProfile) {
            profile = {
              height: dbProfile.height
                ? parseFloat(dbProfile.height)
                : undefined,
              currentWeight: dbProfile.currentWeight
                ? parseFloat(dbProfile.currentWeight)
                : undefined,
            };
            await redis.set(`profile:${token.id}`, JSON.stringify(profile), {
              ex: 60 * 60 * 24, // 24 horas
            });
          }
        }

        session.user.profile = profile || undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
