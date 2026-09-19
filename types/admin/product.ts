export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string | null;
  sortOrder: number;
  featured: boolean;
  status: string;
  category: { name: string } | null;
  images: Array<{ imageUrl: string }>;
};

export type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  imageUrls: string[];
  categoryId: string | null;
  categoryName: string | null;
  sortOrder: number;
  featured: boolean;
  status: string;
};

export type ProductCategoryOption = {
  id: string;
  name: string;
  path: string;
};
