import ProductManager from "@/components/admin/ProductManager";
import { flattenCategoryTree } from "@/lib/category-tree";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sản phẩm | Admin | NA PHÙNG STORE",
  robots: { index: false, follow: false },
};

export default async function AdminProductPage() {
  await requireAdmin();

  const [products, categories] = await Promise.all([
    prisma.tblProduct.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        imageUrl: true,
        categoryId: true,
        sortOrder: true,
        featured: true,
        status: true,
        category: {
          select: { name: true },
        },
      },
    }),
    prisma.tblCategory.findMany({
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
    }),
  ]);

  return (
    <ProductManager
      products={products.map((product) => ({
        ...product,
        categoryName: product.category?.name ?? null,
      }))}
      categories={flattenCategoryTree(categories).map((category) => ({
        id: category.id,
        name: category.name,
        path: category.path,
      }))}
    />
  );
}
