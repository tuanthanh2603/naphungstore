export const PRODUCT_IMAGE = {
  width: 1000,
  height: 1000,
  minWidth: 400,
  minHeight: 400,
} as const;

export function productHref(slug: string) {
  return `/san-pham/${slug}`;
}
