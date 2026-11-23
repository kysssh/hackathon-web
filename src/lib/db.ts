import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import pg from "pg";

const globalForPrisma = globalThis as unknown as { db?: PrismaClient; pool?: pg.Pool };

const connectionString = process.env.DATABASE_URL ?? "";
const isRemoteDb =
  connectionString.includes("supabase.co") ||
  connectionString.includes("supabase.com") ||
  connectionString.includes("sslmode=");

const pool =
  globalForPrisma.pool ??
  new pg.Pool({
    connectionString,
    ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
  });

const adapter = new PrismaPg(pool);

export const db = globalForPrisma.db ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.db = db;
  globalForPrisma.pool = pool;
}
