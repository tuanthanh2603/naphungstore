"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { MAX_CATEGORY_LEVEL } from "@/lib/category-tree";
import { uploadCategoryImageFile } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export type CategoryActionResult = {
  error?: string;
};

function normalizeName(name: unknown) {
  return String(name ?? "").trim();
}

function normalizeSlug(slug: unknown, fallbackName: string) {
  return slugify(String(slug ?? "").trim() || fallbackName);
}

function normalizeStatus(status: unknown) {
  return status === "hidden" ? "hidden" : "active";
}

function normalizeSortOrder(sortOrder: unknown) {
  const value = Number(sortOrder);
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function normalizeImageUrl(url: unknown) {
  const value = String(url ?? "").trim();
  return value || null;
}

export async function uploadCategoryImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Vui lòng chọn ảnh." };
  }

  return uploadCategoryImageFile(file);
}

type CategoryParentRef = {
  parentId: string | null;
};

async function findCategoryParent(id: string): Promise<CategoryParentRef | null> {
  return prisma.tblCategory.findUnique({
    where: { id },
    select: { parentId: true },
  });
}

async function wouldCreateCycle(categoryId: string, parentId: string) {
  let currentId: string | null = parentId;

  while (currentId) {
    if (currentId === categoryId) {
      return true;
    }

    const parent = await findCategoryParent(currentId);
    currentId = parent?.parentId ?? null;
  }

  return false;
}

async function getCategoryLevel(id: string): Promise<number | null> {
  let level = 0;
  let currentId: string | null = id;
  const seen = new Set<string>();

  while (currentId) {
    if (seen.has(currentId)) {
      return null;
    }

    seen.add(currentId);
    level += 1;

    const node = await findCategoryParent(currentId);

    if (!node) {
      return null;
    }

    currentId = node.parentId;
  }

  return level;
}

async function getSubtreeHeight(id: string): Promise<number> {
  const children = await prisma.tblCategory.findMany({
    where: { parentId: id },
    select: { id: true },
  });

  if (children.length === 0) {
    return 0;
  }

  const heights = await Promise.all(children.map((child) => getSubtreeHeight(child.id)));
  return 1 + Math.max(...heights);
}

async function assertWithinThreeLevels(
  parentId: string | null,
  movingId?: string,
): Promise<CategoryActionResult | null> {
  if (!parentId) {
    const extra = movingId ? await getSubtreeHeight(movingId) : 0;

    if (1 + extra > MAX_CATEGORY_LEVEL) {
      return { error: "Chỉ hỗ trợ tối đa 3 cấp danh mục." };
    }

    return null;
  }

  const parentLevel = await getCategoryLevel(parentId);

  if (parentLevel == null) {
    return { error: "Danh mục cha không tồn tại." };
  }

  if (parentLevel >= MAX_CATEGORY_LEVEL) {
    return {
      error: "Chỉ hỗ trợ tối đa 3 cấp danh mục. Không thể thêm con cho danh mục cấp 3.",
    };
  }

  const extra = movingId ? await getSubtreeHeight(movingId) : 0;

  if (parentLevel + 1 + extra > MAX_CATEGORY_LEVEL) {
    return { error: "Chỉ hỗ trợ tối đa 3 cấp danh mục." };
  }

  return null;
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  imageUrl?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  status?: string;
}): Promise<CategoryActionResult> {
  await requireAdmin();

  const name = normalizeName(input.name);

  if (!name) {
    return { error: "Vui lòng nhập tên danh mục." };
  }

  const slug = normalizeSlug(input.slug, name);

  if (!slug) {
    return { error: "Slug không hợp lệ." };
  }

  const parentId = input.parentId?.trim() || null;
  const levelError = await assertWithinThreeLevels(parentId);

  if (levelError) {
    return levelError;
  }

  try {
    await prisma.tblCategory.create({
      data: {
        name,
        slug,
        imageUrl: normalizeImageUrl(input.imageUrl),
        parentId,
        sortOrder: normalizeSortOrder(input.sortOrder),
        status: normalizeStatus(input.status),
      },
    });
  } catch {
    return { error: "Slug đã tồn tại hoặc không thể tạo danh mục." };
  }

  revalidatePath("/admin/category");
  revalidatePath("/", "layout");
  return {};
}

export async function updateCategory(input: {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  status?: string;
}): Promise<CategoryActionResult> {
  await requireAdmin();

  const id = input.id.trim();
  const name = normalizeName(input.name);

  if (!id) {
    return { error: "Danh mục không hợp lệ." };
  }

  if (!name) {
    return { error: "Vui lòng nhập tên danh mục." };
  }

  const slug = normalizeSlug(input.slug, name);
  const parentId = input.parentId?.trim() || null;

  if (parentId === id) {
    return { error: "Danh mục không thể là cha của chính nó." };
  }

  if (parentId && (await wouldCreateCycle(id, parentId))) {
    return { error: "Không thể chọn danh mục con làm danh mục cha." };
  }

  const levelError = await assertWithinThreeLevels(parentId, id);

  if (levelError) {
    return levelError;
  }

  try {
    await prisma.tblCategory.update({
      where: { id },
      data: {
        name,
        slug,
        imageUrl: normalizeImageUrl(input.imageUrl),
        parentId,
        sortOrder: normalizeSortOrder(input.sortOrder),
        status: normalizeStatus(input.status),
      },
    });
  } catch {
    return { error: "Slug đã tồn tại hoặc không thể cập nhật danh mục." };
  }

  revalidatePath("/admin/category");
  revalidatePath("/", "layout");
  return {};
}

export async function deleteCategory(id: string): Promise<CategoryActionResult> {
  await requireAdmin();

  const categoryId = id.trim();

  if (!categoryId) {
    return { error: "Danh mục không hợp lệ." };
  }

  const childCount = await prisma.tblCategory.count({
    where: { parentId: categoryId },
  });

  if (childCount > 0) {
    return { error: "Hãy xóa danh mục con trước khi xóa danh mục này." };
  }

  try {
    await prisma.tblCategory.delete({
      where: { id: categoryId },
    });
  } catch {
    return { error: "Không thể xóa danh mục." };
  }

  revalidatePath("/admin/category");
  revalidatePath("/", "layout");
  return {};
}
