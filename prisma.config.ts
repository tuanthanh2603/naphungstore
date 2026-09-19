import "dotenv/config";
import { defineConfig } from "prisma/config";
import { buildDirectDatabaseUrl } from "./lib/env";

const databaseUrl =
  buildDirectDatabaseUrl() ||
  "postgresql://postgres:postgres@127.0.0.1:5432/postgres";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
