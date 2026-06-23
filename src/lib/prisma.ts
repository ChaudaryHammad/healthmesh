import { Pool, type PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string {
  const url = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL or DIRECT_URL must be set.");
  }
  return url;
}

function createPool(): Pool {
  const connectionString = resolveDatabaseUrl();
  const config: PoolConfig = { connectionString };

  // Supabase requires SSL; session/direct URLs work better than transaction pooler for Prisma.
  if (connectionString.includes("supabase.com")) {
    config.ssl = { rejectUnauthorized: false };
  }

  return new Pool(config);
}

const createPrismaClient = () => {
  const pool = createPool();
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
