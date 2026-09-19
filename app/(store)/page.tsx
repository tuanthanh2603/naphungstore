import type { Metadata } from "next";
import HomeCategories from "@/components/store/HomeCategories";
import HomeHero from "@/components/store/HomeHero";
import HomeProducts from "@/components/store/HomeProducts";
import { toManagedHeroSlides } from "@/lib/carousel";
import { toCategoryTiles, toHeroSlides } from "@/lib/category-tree";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "NA PHÙNG STORE | Cửa hàng",
  description:
    "NA PHÙNG STORE — chọn danh mục và sản phẩm, xem giá và mua những món bạn cần.",
};

export default async function Home() {
  const [categories, carouselSlides, products] = await Promise.all([
    prisma.tblCategory.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        parentId: true,
        sortOrder: true,
        status: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.tblCarousel.findMany({
      where: { status: "active" },
      select: {
        id: true,
        title: true,
        eyebrow: true,
        description: true,
        href: true,
        cta: true,
        imageUrl: true,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.tblProduct.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        imageUrl: true,
        featured: true,
        category: {
          select: { name: true },
        },
      },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      take: 12,
    }),
  ]);

  const slides =
    carouselSlides.length > 0
      ? toManagedHeroSlides(carouselSlides)
      : toHeroSlides(categories);

  return (
    <main className="bg-white">
      <HomeHero slides={slides} />
      <HomeCategories categories={toCategoryTiles(categories)} />
      <HomeProducts
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          imageUrl: product.imageUrl,
          categoryName: product.category?.name ?? null,
        }))}
      />
    </main>
  );
}
