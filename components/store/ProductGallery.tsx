"use client";

import { useState } from "react";
import StoreMedia from "./StoreMedia";

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? null;

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-sand">
        <StoreMedia src={current} alt={name} priority />
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((image, imageIndex) => (
            <button
              key={`${image}-${imageIndex}`}
              type="button"
              onClick={() => setIndex(imageIndex)}
              aria-label={`Xem ảnh ${imageIndex + 1}`}
              aria-current={imageIndex === index ? true : undefined}
              className={`relative aspect-square overflow-hidden rounded-lg bg-sand ${
                imageIndex === index ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100"
              }`}
            >
              <StoreMedia src={image} alt={`${name} ${imageIndex + 1}`} sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
