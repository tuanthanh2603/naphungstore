import CategoryManager from "@/components/admin/CategoryManager";
import { requireAdmin } from "@/lib/auth/admin";
import { flattenCategoryTree } from "@/lib/category-tree";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh mục | Admin | NA PHÙNG STORE",
  robots: { index: false, follow: false },
};

export default async function AdminCategoryPage() {
  await requireAdmin();

  const categories = await prisma.tblCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      parentId: true,
      sortOrder: true,
      status: true,
    },
  });

  return <CategoryManager categories={flattenCategoryTree(categories)} />;
}
