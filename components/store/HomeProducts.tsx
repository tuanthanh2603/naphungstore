import NextLink from "next/link";
import type { StoreProduct } from "@/types/store/product";
import ProductCard from "./ProductCard";

export default function HomeProducts({ products }: { products: StoreProduct[] }) {
  return (
    <section id="san-pham" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:pb-14">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">
            Sản phẩm nổi bật
          </h2>
          <NextLink
            href="/danh-muc"
            className="text-sm text-stone no-underline hover:text-ink"
          >
            Xem tất cả →
          </NextLink>
        </div>

        {products.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-separator px-6 py-14 text-center">
            <p className="text-lg font-medium text-ink">Chưa có sản phẩm</p>
            <p className="mt-2 text-sm text-stone">
              Thêm sản phẩm trong trang quản trị để khách xem và chọn mua tại đây.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <NextLink
                href="/danh-muc"
                className="inline-flex h-10 items-center rounded-full border border-separator px-6 text-sm text-ink no-underline hover:bg-ivory"
              >
                Xem thêm
              </NextLink>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
