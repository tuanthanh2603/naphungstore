import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { buildDatabaseUrl, toPrismaPgConnection } from "@/lib/env";
import type { PrismaClient as PrismaClientInstance } from "@/types/prisma";

const PRISMA_CLIENT_VERSION = "tbl-product-image-v2";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientInstance | undefined;
  prismaVersion: string | undefined;
};

function createPrismaClient(): PrismaClientInstance {
  const databaseUrl = buildDatabaseUrl();

  if (!databaseUrl) {
    throw new Error(
      "Thiếu DATABASE_URL hoặc SUPABASE_DB_PASSWORD trong .env cho Prisma.",
    );
  }

  const adapter = new PrismaPg(toPrismaPgConnection(databaseUrl), {
    schema: "naphung",
  });

  return new PrismaClient({ adapter }) as PrismaClientInstance;
}

export function getPrisma(): PrismaClientInstance {
  if (
    !globalForPrisma.prisma ||
    globalForPrisma.prismaVersion !== PRISMA_CLIENT_VERSION
  ) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaVersion = PRISMA_CLIENT_VERSION;
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrisma();
