"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { uploadCarouselImageFile } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export type CarouselActionResult = {
  error?: string;
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeOptional(value: unknown) {
  const text = normalizeText(value);
  return text || null;
}

function normalizeStatus(status: unknown) {
  return status === "hidden" ? "hidden" : "active";
}

function normalizeSortOrder(sortOrder: unknown) {
  const value = Number(sortOrder);
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function normalizeHref(href: unknown) {
  const value = normalizeText(href) || "#san-pham";

  if (value.startsWith("/") || value.startsWith("#")) {
    return value;
  }

  try {
    const url = new URL(value);
    return url.toString();
  } catch {
    return "#san-pham";
  }
}

export async function uploadCarouselImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Vui lòng chọn ảnh." };
  }

  return uploadCarouselImageFile(file);
}

export async function createCarouselSlide(input: {
  title: string;
  eyebrow?: string | null;
  description?: string | null;
  href?: string;
  cta?: string;
  imageUrl: string;
  sortOrder?: number;
  status?: string;
}): Promise<CarouselActionResult> {
  await requireAdmin();

  const title = normalizeText(input.title);
  const imageUrl = normalizeText(input.imageUrl);

  if (!title) {
    return { error: "Vui lòng nhập tiêu đề slide." };
  }

  if (!imageUrl) {
    return { error: "Vui lòng tải ảnh carousel." };
  }

  try {
    await prisma.tblCarousel.create({
      data: {
        title,
        eyebrow: normalizeOptional(input.eyebrow),
        description: normalizeOptional(input.description),
        href: normalizeHref(input.href),
        cta: normalizeText(input.cta) || "Xem sản phẩm",
        imageUrl,
        sortOrder: normalizeSortOrder(input.sortOrder),
        status: normalizeStatus(input.status),
      },
    });
  } catch {
    return { error: "Không thể tạo slide carousel." };
  }

  revalidatePath("/admin/carousel");
  revalidatePath("/");
  return {};
}

export async function updateCarouselSlide(input: {
  id: string;
  title: string;
  eyebrow?: string | null;
  description?: string | null;
  href?: string;
  cta?: string;
  imageUrl: string;
  sortOrder?: number;
  status?: string;
}): Promise<CarouselActionResult> {
  await requireAdmin();

  const id = normalizeText(input.id);
  const title = normalizeText(input.title);
  const imageUrl = normalizeText(input.imageUrl);

  if (!id) {
    return { error: "Slide không hợp lệ." };
  }

  if (!title) {
    return { error: "Vui lòng nhập tiêu đề slide." };
  }

  if (!imageUrl) {
    return { error: "Vui lòng tải ảnh carousel." };
  }

  try {
    await prisma.tblCarousel.update({
      where: { id },
      data: {
        title,
        eyebrow: normalizeOptional(input.eyebrow),
        description: normalizeOptional(input.description),
        href: normalizeHref(input.href),
        cta: normalizeText(input.cta) || "Xem sản phẩm",
        imageUrl,
        sortOrder: normalizeSortOrder(input.sortOrder),
        status: normalizeStatus(input.status),
      },
    });
  } catch {
    return { error: "Không thể cập nhật slide carousel." };
  }

  revalidatePath("/admin/carousel");
  revalidatePath("/");
  return {};
}

export async function deleteCarouselSlide(id: string): Promise<CarouselActionResult> {
  await requireAdmin();

  const slideId = id.trim();

  if (!slideId) {
    return { error: "Slide không hợp lệ." };
  }

  try {
    await prisma.tblCarousel.delete({
      where: { id: slideId },
    });
  } catch {
    return { error: "Không thể xóa slide carousel." };
  }

  revalidatePath("/admin/carousel");
  revalidatePath("/");
  return {};
}
