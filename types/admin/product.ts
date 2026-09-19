export type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
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
