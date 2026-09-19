import type { Metadata } from "next";
import CollectionCard from "@/components/store/CollectionCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Danh mục | NA PHÙNG STORE",
  description: "Chọn danh mục để xem và mua sản phẩm tại NA PHÙNG STORE.",
};

export default async function CategoryIndexPage() {
  const collections = await prisma.tblCategory.findMany({
    where: { status: "active", parentId: null },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <p className="text-[11px] tracking-[0.28em] text-gold uppercase">Cửa hàng</p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.02em] text-ink">
        Danh mục
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-stone">
        Chọn danh mục để xem sản phẩm và tiếp tục mua sắm.
      </p>

      {collections.length === 0 ? (
        <p className="mt-12 text-sm text-stone">Chưa có danh mục.</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => (
            <CollectionCard key={collection.id} collection={collection} index={index} />
          ))}
        </div>
      )}
    </main>
  );
}
