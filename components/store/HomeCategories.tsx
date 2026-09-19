import NextLink from "next/link";
import { categoryHref } from "@/lib/category-tree";
import type { StoreCollection } from "@/types/store/home";
import StoreMedia from "./StoreMedia";

export default function HomeCategories({
  categories,
}: {
  categories: StoreCollection[];
}) {
  return (
    <section id="danh-muc" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            Danh mục
          </h2>
          <NextLink
            href="/danh-muc"
            className="text-sm text-stone no-underline hover:text-ink"
          >
            Xem tất cả →
          </NextLink>
        </div>

        {categories.length === 0 ? (
          <p className="mt-6 text-sm text-stone">Chưa có danh mục để chọn.</p>
        ) : (
          <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {categories.map((category) => (
              <NextLink
                key={category.id}
                href={categoryHref(category.slug)}
                className="group flex flex-col items-center gap-2 text-center no-underline"
              >
                <div className="relative size-[4.5rem] overflow-hidden rounded-full bg-sand sm:size-20">
                  <StoreMedia
                    src={category.imageUrl}
                    alt={category.name}
                    sizes="80px"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="line-clamp-2 text-xs font-medium text-ink sm:text-sm">
                  {category.name}
                </span>
              </NextLink>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
