import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | ReturnType<typeof basePrisma.$extends>
};

const basePrisma = new PrismaClient({
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

export const prisma = basePrisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
