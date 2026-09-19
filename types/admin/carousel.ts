export type CarouselStatus = "active" | "hidden";

export type CarouselRecord = {
  id: string;
  title: string;
  eyebrow: string | null;
  description: string | null;
  href: string;
  cta: string;
  imageUrl: string;
  sortOrder: number;
  status: string;
};
