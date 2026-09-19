import ProductManager from "@/components/admin/ProductManager";
import { flattenCategoryTree } from "@/lib/category-tree";
import { requireAdmin } from "@/lib/auth/admin";
import { toProductImageUrls } from "@/lib/product";
import { getPrisma } from "@/lib/prisma";
import type { ProductRecord } from "@/types/admin/product";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sản phẩm | Admin | NA PHÙNG STORE",
  robots: { index: false, follow: false },
};

export default async function AdminProductPage() {
  await requireAdmin();
  const prisma = getPrisma();

  const [products, imageRows, categories] = await Promise.all([
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
    prisma.tblProductImage.findMany({
      select: {
        productId: true,
        imageUrl: true,
      },
      orderBy: { sortOrder: "asc" },
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

  const imagesByProduct = new Map<string, Array<{ imageUrl: string }>>();

  for (const image of imageRows) {
    const list = imagesByProduct.get(image.productId) ?? [];
    list.push({ imageUrl: image.imageUrl });
    imagesByProduct.set(image.productId, list);
  }

  const records: ProductRecord[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    imageUrls: toProductImageUrls(product.imageUrl, imagesByProduct.get(product.id)),
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? null,
    sortOrder: product.sortOrder,
    featured: product.featured,
    status: product.status,
  }));

  return (
    <ProductManager
      products={records}
      categories={flattenCategoryTree(categories).map((category) => ({
        id: category.id,
        name: category.name,
        path: category.path,
      }))}
    />
  );
}
