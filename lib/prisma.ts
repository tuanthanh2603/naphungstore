import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { buildDatabaseUrl, toPrismaPgConnection } from "@/lib/env";

const PRISMA_CLIENT_VERSION = "tbl-product-v1";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaVersion: string | undefined;
};

function createPrismaClient() {
  const databaseUrl = buildDatabaseUrl();

  if (!databaseUrl) {
    throw new Error(
      "Thiếu DATABASE_URL hoặc SUPABASE_DB_PASSWORD trong .env cho Prisma.",
    );
  }

  const adapter = new PrismaPg(toPrismaPgConnection(databaseUrl), {
    schema: "naphung",
  });

  return new PrismaClient({ adapter });
}

export function getPrisma() {
  if (
    !globalForPrisma.prisma ||
    globalForPrisma.prismaVersion !== PRISMA_CLIENT_VERSION
  ) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaVersion = PRISMA_CLIENT_VERSION;
  }

  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrisma();
    const value = Reflect.get(client, property, client);

    return typeof value === "function" ? value.bind(client) : value;
  },
});
