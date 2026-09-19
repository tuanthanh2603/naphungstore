export const PRODUCT_IMAGE = {
  width: 1000,
  height: 1000,
  minWidth: 400,
  minHeight: 400,
  maxCount: 8,
  maxBytes: 5 * 1024 * 1024,
} as const;

export function productHref(slug: string) {
  return `/san-pham/${slug}`;
}

export function toProductImageUrls(
  imageUrl: string | null | undefined,
  images: Array<{ imageUrl: string }> = [],
) {
  const urls = images.map((image) => image.imageUrl).filter(Boolean);

  if (urls.length > 0) {
    return urls;
  }

  return imageUrl ? [imageUrl] : [];
}
