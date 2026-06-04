import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const log: ("query" | "error" | "warn")[] =
  process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"]
    : ["error"];

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL!;

  /* eslint-disable @typescript-eslint/no-require-imports */
  if (url.includes("neon.tech")) {
    // Neon serverless — WebSocket adapter
    const { PrismaNeon } = require("@prisma/adapter-neon");
    return new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }), log });
  }

  // Local Postgres (Docker) — standard pg adapter
  const { Pool } = require("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");
  return new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString: url })), log });
  /* eslint-enable @typescript-eslint/no-require-imports */
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
