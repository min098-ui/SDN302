import { PrismaClient } from "@prisma/client";

// Extended type fallback to ensure VS Code TypeScript Server recognizes new models immediately
type ExtendedPrismaClient = PrismaClient & {
  message: any;
  notification: any;
  activityLog: any;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma: ExtendedPrismaClient =
  globalForPrisma.prisma ??
  (new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }) as ExtendedPrismaClient);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
