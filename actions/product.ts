"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { PRODUCT_IMAGE, toProductImageUrls } from "@/lib/product";
import {
  deleteRemovedLocalProductImages,
  saveProductImageFile,
} from "@/lib/product-upload";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export type ProductActionResult = {
  error?: string;
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeOptional(value: unknown) {
  const text = normalizeText(value);
  return text || null;
}

function normalizeSlug(slug: unknown, fallbackName: string) {
  return slugify(normalizeText(slug) || fallbackName);
}

function normalizeStatus(status: unknown) {
  return status === "hidden" ? "hidden" : "active";
}

function normalizeSortOrder(sortOrder: unknown) {
  const value = Number(sortOrder);
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function normalizePrice(price: unknown) {
  const value = Number(String(price ?? "").replace(/[^\d]/g, ""));
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function normalizeImageUrls(urls: unknown) {
  const list = Array.isArray(urls) ? urls : [urls];
  const unique = new Set<string>();

  for (const url of list) {
    const value = normalizeText(url);

    if (value) {
      unique.add(value);
    }
  }

  return [...unique].slice(0, PRODUCT_IMAGE.maxCount);
}

export async function uploadProductImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Vui lòng chọn ảnh." };
  }

  return saveProductImageFile(file);
}

async function getProductImageUrls(productId: string) {
  const [product, images] = await Promise.all([
    prisma.tblProduct.findUnique({
      where: { id: productId },
      select: { imageUrl: true },
    }),
    prisma.tblProductImage.findMany({
      where: { productId },
      select: { imageUrl: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!product) {
    return [];
  }

  return toProductImageUrls(product.imageUrl, images);
}

type ProductInput = {
  name: string;
  slug?: string;
  description?: string | null;
  price: number | string;
  imageUrls?: string[];
  categoryId?: string | null;
  sortOrder?: number;
  featured?: boolean;
  status?: string;
};

function parseProductFields(input: ProductInput) {
  const name = normalizeText(input.name);
  const slug = normalizeSlug(input.slug, name);
  const price = normalizePrice(input.price);
  const imageUrls = normalizeImageUrls(input.imageUrls);

  return { name, slug, price, imageUrls };
}

async function replaceProductImages(productId: string, imageUrls: string[]) {
  await prisma.tblProductImage.deleteMany({
    where: { productId },
  });

  if (imageUrls.length === 0) {
    return;
  }

  await prisma.tblProductImage.createMany({
    data: imageUrls.map((imageUrl, index) => ({
      productId,
      imageUrl,
      sortOrder: index,
    })),
  });
}

function revalidateProductPaths(slug?: string) {
  revalidatePath("/admin/product");
  revalidatePath("/");
  revalidatePath("/danh-muc", "layout");

  if (slug) {
    revalidatePath(`/san-pham/${slug}`);
  }
}

export async function createProduct(input: ProductInput): Promise<ProductActionResult> {
  await requireAdmin();

  const { name, slug, price, imageUrls } = parseProductFields(input);

  if (!name) {
    return { error: "Vui lòng nhập tên sản phẩm." };
  }

  if (!slug) {
    return { error: "Slug không hợp lệ." };
  }

  if (price <= 0) {
    return { error: "Vui lòng nhập giá lớn hơn 0." };
  }

  try {
    const product = await prisma.tblProduct.create({
      data: {
        name,
        slug,
        description: normalizeOptional(input.description),
        price,
        imageUrl: imageUrls[0] ?? null,
        categoryId: normalizeOptional(input.categoryId),
        sortOrder: normalizeSortOrder(input.sortOrder),
        featured: Boolean(input.featured),
        status: normalizeStatus(input.status),
      },
      select: { id: true },
    });

    await replaceProductImages(product.id, imageUrls);
  } catch {
    return { error: "Slug đã tồn tại hoặc không thể tạo sản phẩm." };
  }

  revalidateProductPaths(slug);
  return {};
}

export async function updateProduct(
  input: ProductInput & { id: string },
): Promise<ProductActionResult> {
  await requireAdmin();

  const id = normalizeText(input.id);
  const { name, slug, price, imageUrls } = parseProductFields(input);

  if (!id) {
    return { error: "Sản phẩm không hợp lệ." };
  }

  if (!name) {
    return { error: "Vui lòng nhập tên sản phẩm." };
  }

  if (price <= 0) {
    return { error: "Vui lòng nhập giá lớn hơn 0." };
  }

  try {
    const previousUrls = await getProductImageUrls(id);

    await prisma.tblProduct.update({
      where: { id },
      data: {
        name,
        slug,
        description: normalizeOptional(input.description),
        price,
        imageUrl: imageUrls[0] ?? null,
        categoryId: normalizeOptional(input.categoryId),
        sortOrder: normalizeSortOrder(input.sortOrder),
        featured: Boolean(input.featured),
        status: normalizeStatus(input.status),
      },
    });

    await replaceProductImages(id, imageUrls);
    await deleteRemovedLocalProductImages(previousUrls, imageUrls);
  } catch {
    return { error: "Slug đã tồn tại hoặc không thể cập nhật sản phẩm." };
  }

  revalidateProductPaths(slug);
  return {};
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  await requireAdmin();

  const productId = id.trim();

  if (!productId) {
    return { error: "Sản phẩm không hợp lệ." };
  }

  const previousUrls = await getProductImageUrls(productId);

  try {
    await prisma.tblProduct.delete({
      where: { id: productId },
    });
    await deleteRemovedLocalProductImages(previousUrls, []);
  } catch {
    return { error: "Không thể xóa sản phẩm." };
  }

  revalidateProductPaths();
  return {};
}
