import NextLink from "next/link";
import { formatVnd } from "@/lib/money";
import { productHref } from "@/lib/product";
import type { StoreProduct } from "@/types/store/product";
import StoreMedia from "./StoreMedia";

export default function ProductCard({
  product,
  priority = false,
}: {
  product: StoreProduct;
  priority?: boolean;
}) {
  return (
    <NextLink
      href={productHref(product.slug)}
      className="group block no-underline"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-sand">
        <StoreMedia
          src={product.imageUrl}
          alt={product.name}
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="mt-3 text-base font-semibold text-ink">{formatVnd(product.price)}</p>
      <h3 className="mt-1 line-clamp-2 text-sm leading-5 text-stone">{product.name}</h3>
      {product.categoryName ? (
        <p className="mt-1 text-xs text-stone/80">{product.categoryName}</p>
      ) : null}
    </NextLink>
  );
}
