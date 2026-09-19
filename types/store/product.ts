export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  imageUrls?: string[];
  categoryName: string | null;
};
