import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { buildDirectDatabaseUrl, toPrismaPgConnection } from "../lib/env";

const databaseUrl = buildDirectDatabaseUrl();

if (!databaseUrl) {
  throw new Error("Thiếu DATABASE_URL hoặc SUPABASE_DB_PASSWORD trong .env cho prisma db seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(toPrismaPgConnection(databaseUrl), {
    schema: "naphung",
  }),
});

const categories = [
  { name: "Nam", slug: "nam", parentSlug: null, sortOrder: 1 },
  { name: "Nữ", slug: "nu", parentSlug: null, sortOrder: 2 },
  { name: "Trẻ em", slug: "tre-em", parentSlug: null, sortOrder: 3 },
  { name: "Áo khoác nam", slug: "ao-khoac-nam", parentSlug: "nam", sortOrder: 1 },
  { name: "Quần nam", slug: "quan-nam", parentSlug: "nam", sortOrder: 2 },
  { name: "Phụ kiện nam", slug: "phu-kien-nam", parentSlug: "nam", sortOrder: 3 },
  { name: "Áo khoác dạ nam", slug: "ao-khoac-da-nam", parentSlug: "ao-khoac-nam", sortOrder: 1 },
  { name: "Áo khoác gió nam", slug: "ao-khoac-gio-nam", parentSlug: "ao-khoac-nam", sortOrder: 2 },
  { name: "Áo hoodie nam", slug: "ao-hoodie-nam", parentSlug: "ao-khoac-nam", sortOrder: 3 },
  { name: "Áo bomber nam", slug: "ao-bomber-nam", parentSlug: "ao-khoac-nam", sortOrder: 4 },
  { name: "Áo nữ", slug: "ao-nu", parentSlug: "nu", sortOrder: 1 },
  { name: "Quần nữ", slug: "quan-nu", parentSlug: "nu", sortOrder: 2 },
  { name: "Phụ kiện nữ", slug: "phu-kien-nu", parentSlug: "nu", sortOrder: 3 },
  { name: "Áo trẻ em", slug: "ao-tre-em", parentSlug: "tre-em", sortOrder: 1 },
  { name: "Quần trẻ em", slug: "quan-tre-em", parentSlug: "tre-em", sortOrder: 2 },
  { name: "Phụ kiện trẻ em", slug: "phu-kien-tre-em", parentSlug: "tre-em", sortOrder: 3 },
];

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const email = process.env.ADMIN_EMAIL ?? "admin@naphungstore.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin@123456";
  const fullName = process.env.ADMIN_FULL_NAME ?? "Administrator";
  const passwordHash = await bcrypt.hash(password, 12);

  const account = await prisma.tblAccount.upsert({
    where: { email },
    update: {
      username,
      passwordHash,
      fullName,
      role: "admin",
      status: "active",
    },
    create: {
      username,
      email,
      passwordHash,
      fullName,
      role: "admin",
      status: "active",
    },
  });

  console.log("Admin account ready:");
  console.log(`  id:       ${account.id}`);
  console.log(`  username: ${username}`);
  console.log(`  email:    ${email}`);
}

async function seedCategories() {
  for (const category of categories) {
    const parent = category.parentSlug
      ? await prisma.tblCategory.findUnique({
          where: { slug: category.parentSlug },
          select: { id: true },
        })
      : null;

    await prisma.tblCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        parentId: parent?.id ?? null,
        sortOrder: category.sortOrder,
        status: "active",
      },
      create: {
        name: category.name,
        slug: category.slug,
        parentId: parent?.id ?? null,
        sortOrder: category.sortOrder,
        status: "active",
      },
    });
  }

  console.log(`Categories ready: ${categories.length}`);
}

async function main() {
  await seedAdmin();
  await seedCategories();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
