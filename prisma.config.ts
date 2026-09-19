import "dotenv/config";
import { defineConfig } from "prisma/config";
import { buildDirectDatabaseUrl } from "./lib/env";

const databaseUrl = buildDirectDatabaseUrl();

if (!databaseUrl) {
  throw new Error("Thiếu DATABASE_URL hoặc SUPABASE_DB_PASSWORD trong .env.");
}

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
