import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/store/ProductCard";
import ProductGallery from "@/components/store/ProductGallery";
import { categoryHref } from "@/lib/category-tree";
import { formatVnd } from "@/lib/money";
import { toProductImageUrls } from "@/lib/product";
import { prisma } from "@/lib/prisma";

type ProductPageProps = PageProps<"/san-pham/[slug]">;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.tblProduct.findFirst({
    where: { slug, status: "active" },
    select: { name: true },
  });

  return {
    title: product ? `${product.name} | NA PHÙNG STORE` : "Sản phẩm | NA PHÙNG STORE",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.tblProduct.findFirst({
    where: { slug, status: "active" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      categoryId: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const productImages = await prisma.tblProductImage.findMany({
    where: { productId: product.id },
    select: { imageUrl: true },
    orderBy: { sortOrder: "asc" },
  });

  const related = product.categoryId
    ? await prisma.tblProduct.findMany({
        where: {
          status: "active",
          categoryId: product.categoryId,
          id: { not: product.id },
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
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 4,
      })
    : [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-2">
        <ProductGallery
          images={toProductImageUrls(product.imageUrl, productImages)}
          name={product.name}
        />

        <div className="flex flex-col justify-center">
          {product.category ? (
            <NextLink
              href={categoryHref(product.category.slug)}
              className="text-[11px] tracking-[0.28em] text-gold uppercase no-underline hover:opacity-70"
            >
              {product.category.name}
            </NextLink>
          ) : (
            <p className="text-[11px] tracking-[0.28em] text-gold uppercase">Sản phẩm</p>
          )}
          <h1 className="mt-3 font-display text-4xl font-medium tracking-[-0.02em] text-ink sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-2xl text-ink">{formatVnd(product.price)}</p>
          {product.description ? (
            <p className="mt-5 max-w-xl text-sm leading-7 text-stone">{product.description}</p>
          ) : null}
          <NextLink
            href={product.category ? categoryHref(product.category.slug) : "/#san-pham"}
            className="mt-8 inline-flex h-11 w-fit items-center bg-ink px-6 text-[11px] tracking-[0.22em] text-ivory uppercase no-underline hover:bg-gold hover:text-ink"
          >
            Xem thêm sản phẩm
          </NextLink>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-medium text-ink">Sản phẩm cùng danh mục</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={{
                  id: item.id,
                  name: item.name,
                  slug: item.slug,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  categoryName: item.category?.name ?? null,
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
