import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import CollectionCard from "@/components/store/CollectionCard";
import ProductCard from "@/components/store/ProductCard";
import StoreMedia from "@/components/store/StoreMedia";
import { collectCategoryIds } from "@/lib/category-tree";
import { prisma } from "@/lib/prisma";

type CategoryPageProps = PageProps<"/danh-muc/[slug]">;

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.tblCategory.findFirst({
    where: { slug, status: "active" },
    select: { name: true },
  });

  return {
    title: category ? `${category.name} | NA PHÙNG STORE` : "Danh mục | NA PHÙNG STORE",
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await prisma.tblCategory.findFirst({
    where: { slug, status: "active" },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      parentId: true,
    },
  });

  if (!category) {
    notFound();
  }

  const [allCategories, children] = await Promise.all([
    prisma.tblCategory.findMany({
      where: { status: "active" },
      select: { id: true, parentId: true },
    }),
    prisma.tblCategory.findMany({
      where: { parentId: category.id, status: "active" },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  const products = await prisma.tblProduct.findMany({
    where: {
      status: "active",
      categoryId: { in: collectCategoryIds(allCategories, category.id) },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      imageUrl: true,
      category: {
        select: { name: true },
      },
    },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main>
      <section className="border-b border-gold/20 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="relative size-20 shrink-0 overflow-hidden bg-sand sm:size-24">
            {category.imageUrl ? (
              <StoreMedia src={category.imageUrl} alt={category.name} priority sizes="96px" />
            ) : (
              <div className="flex size-full items-center justify-center text-xs text-stone">
                {category.name}
              </div>
            )}
          </div>
          <div>
            <p className="text-[11px] tracking-[0.28em] text-gold uppercase">Danh mục</p>
            <h1 className="mt-1 font-display text-3xl font-medium tracking-[-0.02em] text-ink sm:text-4xl">
              {category.name}
            </h1>
            <p className="mt-2 text-sm text-stone">
              {products.length} sản phẩm
              {children.length > 0 ? ` · ${children.length} danh mục con` : ""}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {children.length > 0 ? (
          <div className="mb-12">
            <h2 className="font-display text-2xl font-medium text-ink">Danh mục con</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((child, index) => (
                <CollectionCard key={child.id} collection={child} index={index} />
              ))}
            </div>
          </div>
        ) : null}

        <h2 className="font-display text-2xl font-medium text-ink">Sản phẩm</h2>
        {products.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  imageUrl: product.imageUrl,
                  categoryName: product.category?.name ?? null,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 border border-gold/20 bg-white px-6 py-16 text-center">
            <p className="font-display text-2xl font-medium text-ink">Chưa có sản phẩm</p>
            <p className="mt-2 text-sm text-stone">
              Danh mục {category.name} chưa có sản phẩm để chọn.
            </p>
            <NextLink
              href="/#danh-muc"
              className="mt-6 inline-flex text-[11px] tracking-[0.18em] text-gold uppercase no-underline"
            >
              Quay lại danh mục
            </NextLink>
          </div>
        )}
      </section>
    </main>
  );
}
