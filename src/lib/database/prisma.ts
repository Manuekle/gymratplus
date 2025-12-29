import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL ||
          (process.env.NODE_ENV === "production"
            ? process.env.DATABASE_URL_PRO
            : process.env.DATABASE_URL_DEV),
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Note: Query performance monitoring via middleware requires Prisma extension
// For now, use Prisma's built-in query logging in development mode
// Slow queries will be visible in the console via the log configuration above
