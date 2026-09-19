import type { HeroSlide } from "@/types/store/home";

export const CAROUSEL_IMAGE = {
  width: 1920,
  height: 800,
  aspectRatio: 1920 / 800,
  minWidth: 1280,
  minHeight: 534,
} as const;

export function carouselAspectClassName() {
  return "aspect-[12/5]";
}

export function toManagedHeroSlides(
  slides: Array<{
    id: string;
    title: string;
    eyebrow: string | null;
    description: string | null;
    href: string;
    cta: string;
    imageUrl: string;
  }>,
): HeroSlide[] {
  return slides.map((slide, index) => ({
    id: slide.id,
    eyebrow: slide.eyebrow?.trim() || `${String(index + 1).padStart(2, "0")} / Cửa hàng`,
    title: slide.title,
    description:
      slide.description?.trim() || `Xem sản phẩm ${slide.title} và chọn món phù hợp.`,
    href: slide.href.trim() || "#danh-muc",
    cta: slide.cta.trim() || "Xem sản phẩm",
    imageUrl: slide.imageUrl,
  }));
}
