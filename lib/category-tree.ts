import type { CategoryRecord, CategoryRow } from "@/types/admin/category";
import type { HeaderCategoryColumn } from "@/types/store/category";

export function categoryHref(slug: string) {
  return `/danh-muc/${slug}`;
}

export function toHeaderCategoryColumns(
  categories: Array<
    Pick<
      CategoryRecord,
      "id" | "name" | "slug" | "imageUrl" | "parentId" | "sortOrder" | "status"
    >
  >,
): HeaderCategoryColumn[] {
  const active = categories.filter((category) => category.status === "active");
  const byParent = new Map<string | null, typeof active>();

  for (const category of active) {
    const list = byParent.get(category.parentId) ?? [];
    list.push(category);
    byParent.set(category.parentId, list);
  }

  for (const list of byParent.values()) {
    list.sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.name.localeCompare(right.name, "vi"),
    );
  }

  return (byParent.get(null) ?? []).map((root) => ({
    id: root.id,
    title: root.name,
    href: categoryHref(root.slug),
    items: (byParent.get(root.id) ?? []).map((item) => ({
      id: item.id,
      label: item.name,
      href: categoryHref(item.slug),
      imageUrl: item.imageUrl,
      children: (byParent.get(item.id) ?? []).map((child) => ({
        id: child.id,
        label: child.name,
        href: categoryHref(child.slug),
      })),
    })),
  }));
}

export const MAX_CATEGORY_LEVEL = 3;

export function getCategoryLevel(depth: number) {
  return depth + 1;
}

export function staysWithinMaxLevels(newDepth: number, subtreeHeight = 0) {
  return newDepth >= 0 && newDepth + subtreeHeight <= MAX_CATEGORY_LEVEL - 1;
}

export function getSubtreeHeight(
  categories: Array<{ id: string; parentId: string | null }>,
  id: string,
  seen = new Set<string>(),
): number {
  if (seen.has(id)) {
    return 0;
  }

  seen.add(id);
  const children = categories.filter((category) => category.parentId === id);

  if (children.length === 0) {
    return 0;
  }

  return (
    1 +
    Math.max(
      ...children.map((child) => getSubtreeHeight(categories, child.id, seen)),
    )
  );
}

export function getEligibleParents(
  categories: CategoryRow[],
  options: {
    movingId?: string;
    descendantIds: Set<string>;
    subtreeHeight: number;
  },
) {
  return categories.filter((category) => {
    if (category.id === options.movingId || options.descendantIds.has(category.id)) {
      return false;
    }

    return staysWithinMaxLevels(category.depth + 1, options.subtreeHeight);
  });
}

export function flattenCategoryTree(categories: CategoryRecord[]): CategoryRow[] {
  const byParent = new Map<string | null, CategoryRecord[]>();

  for (const category of categories) {
    const key = category.parentId;
    const list = byParent.get(key) ?? [];
    list.push(category);
    byParent.set(key, list);
  }

  for (const list of byParent.values()) {
    list.sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.name.localeCompare(right.name, "vi"),
    );
  }

  const byId = new Map(categories.map((category) => [category.id, category]));
  const childCountById = new Map<string, number>();

  for (const category of categories) {
    if (!category.parentId) {
      continue;
    }

    childCountById.set(
      category.parentId,
      (childCountById.get(category.parentId) ?? 0) + 1,
    );
  }

  function buildPath(category: CategoryRecord) {
    const parts = [category.name];
    let parentId = category.parentId;

    while (parentId) {
      const parent = byId.get(parentId);

      if (!parent) {
        break;
      }

      parts.unshift(parent.name);
      parentId = parent.parentId;
    }

    return parts.join(" / ");
  }

  const rows: CategoryRow[] = [];

  function walk(parentId: string | null, depth: number) {
    const children = byParent.get(parentId) ?? [];

    for (const category of children) {
      rows.push({
        ...category,
        parentName: category.parentId
          ? (byId.get(category.parentId)?.name ?? null)
          : null,
        path: buildPath(category),
        depth,
        childCount: childCountById.get(category.id) ?? 0,
      });
      walk(category.id, depth + 1);
    }
  }

  walk(null, 0);

  return rows;
}
