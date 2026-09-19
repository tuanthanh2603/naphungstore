import CarouselManager from "@/components/admin/CarouselManager";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carousel | Admin | NA PHÙNG STORE",
  robots: { index: false, follow: false },
};

export default async function AdminCarouselPage() {
  await requireAdmin();

  const slides = await prisma.tblCarousel.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      eyebrow: true,
      description: true,
      href: true,
      cta: true,
      imageUrl: true,
      sortOrder: true,
      status: true,
    },
  });

  return <CarouselManager slides={slides} />;
}
