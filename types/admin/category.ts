export type CategoryStatus = "active" | "hidden";

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  status: string;
};

export type CategoryRow = CategoryRecord & {
  parentName: string | null;
  path: string;
  depth: number;
  childCount: number;
};
