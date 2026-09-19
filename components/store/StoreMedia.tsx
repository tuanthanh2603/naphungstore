import Image from "next/image";
import { cn } from "@heroui/react";

export default function StoreMedia({
  src,
  alt,
  className,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: {
  src: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (src?.includes("res.cloudinary.com")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  if (src) {
    return <img src={src} alt={alt} className={cn("size-full object-cover", className)} />;
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "size-full bg-[linear-gradient(145deg,#e4d8c4_0%,#f4efe6_48%,#c9b089_100%)]",
        className,
      )}
    />
  );
}
