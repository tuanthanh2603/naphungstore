"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { uploadProductImageFile } from "@/lib/cloudinary";
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

function normalizeImageUrl(url: unknown) {
  const value = normalizeText(url);
  return value || null;
}

export async function uploadProductImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Vui lòng chọn ảnh." };
  }

  return uploadProductImageFile(file);
}

export async function createProduct(input: {
  name: string;
  slug?: string;
  description?: string | null;
  price: number | string;
  imageUrl?: string | null;
  categoryId?: string | null;
  sortOrder?: number;
  featured?: boolean;
  status?: string;
}): Promise<ProductActionResult> {
  await requireAdmin();

  const name = normalizeText(input.name);

  if (!name) {
    return { error: "Vui lòng nhập tên sản phẩm." };
  }

  const slug = normalizeSlug(input.slug, name);

  if (!slug) {
    return { error: "Slug không hợp lệ." };
  }

  const price = normalizePrice(input.price);

  if (price <= 0) {
    return { error: "Vui lòng nhập giá lớn hơn 0." };
  }

  try {
    await prisma.tblProduct.create({
      data: {
        name,
        slug,
        description: normalizeOptional(input.description),
        price,
        imageUrl: normalizeImageUrl(input.imageUrl),
        categoryId: normalizeOptional(input.categoryId),
        sortOrder: normalizeSortOrder(input.sortOrder),
        featured: Boolean(input.featured),
        status: normalizeStatus(input.status),
      },
    });
  } catch {
    return { error: "Slug đã tồn tại hoặc không thể tạo sản phẩm." };
  }

  revalidatePath("/admin/product");
  revalidatePath("/");
  revalidatePath("/danh-muc", "layout");
  return {};
}

export async function updateProduct(input: {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  price: number | string;
  imageUrl?: string | null;
  categoryId?: string | null;
  sortOrder?: number;
  featured?: boolean;
  status?: string;
}): Promise<ProductActionResult> {
  await requireAdmin();

  const id = normalizeText(input.id);
  const name = normalizeText(input.name);

  if (!id) {
    return { error: "Sản phẩm không hợp lệ." };
  }

  if (!name) {
    return { error: "Vui lòng nhập tên sản phẩm." };
  }

  const slug = normalizeSlug(input.slug, name);
  const price = normalizePrice(input.price);

  if (price <= 0) {
    return { error: "Vui lòng nhập giá lớn hơn 0." };
  }

  try {
    await prisma.tblProduct.update({
      where: { id },
      data: {
        name,
        slug,
        description: normalizeOptional(input.description),
        price,
        imageUrl: normalizeImageUrl(input.imageUrl),
        categoryId: normalizeOptional(input.categoryId),
        sortOrder: normalizeSortOrder(input.sortOrder),
        featured: Boolean(input.featured),
        status: normalizeStatus(input.status),
      },
    });
  } catch {
    return { error: "Slug đã tồn tại hoặc không thể cập nhật sản phẩm." };
  }

  revalidatePath("/admin/product");
  revalidatePath("/");
  revalidatePath("/danh-muc", "layout");
  revalidatePath(`/san-pham/${slug}`);
  return {};
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  await requireAdmin();

  const productId = id.trim();

  if (!productId) {
    return { error: "Sản phẩm không hợp lệ." };
  }

  try {
    await prisma.tblProduct.delete({
      where: { id: productId },
    });
  } catch {
    return { error: "Không thể xóa sản phẩm." };
  }

  revalidatePath("/admin/product");
  revalidatePath("/");
  revalidatePath("/danh-muc", "layout");
  return {};
}
