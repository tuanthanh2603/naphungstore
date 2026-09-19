import NextLink from "next/link";
import { categoryHref } from "@/lib/category-tree";
import type { StoreCollection } from "@/types/store/home";
import StoreMedia from "./StoreMedia";

export default function CollectionCard({
  collection,
  index = 0,
}: {
  collection: StoreCollection;
  index?: number;
  featured?: boolean;
}) {
  return (
    <NextLink
      href={categoryHref(collection.slug)}
      className="group block overflow-hidden border border-gold/20 bg-white no-underline"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        <StoreMedia
          src={collection.imageUrl}
          alt={collection.name}
          sizes="(min-width: 1024px) 33vw, 50vw"
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="px-4 py-4">
        <p className="text-[10px] tracking-[0.24em] text-gold uppercase">
          {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="mt-1 font-display text-2xl font-medium text-ink">
          {collection.name}
        </h3>
        <span className="mt-1 inline-block text-[11px] tracking-[0.18em] text-stone uppercase transition-colors group-hover:text-gold">
          Xem sản phẩm
        </span>
      </div>
    </NextLink>
  );
}
