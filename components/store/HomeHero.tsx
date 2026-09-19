"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/types/store/home";
import StoreMedia from "./StoreMedia";

const AUTOPLAY_MS = 6500;

export default function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const items =
    slides.length > 0
      ? slides
      : [
          {
            id: "shop",
            eyebrow: "Cửa hàng",
            title: "NA PHÙNG STORE",
            description: "Chọn danh mục và sản phẩm bạn cần.",
            href: "#san-pham",
            cta: "Xem sản phẩm",
            imageUrl: null,
          },
        ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerX = useRef<number | null>(null);
  const current = items[index] ?? items[0];
  const canCycle = items.length > 1;

  function goTo(nextIndex: number) {
    const total = items.length;
    setPaused(true);
    setIndex(((nextIndex % total) + total) % total);
  }

  useEffect(() => {
    if (!canCycle || paused) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % items.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [canCycle, items.length, paused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Khuyến mãi cửa hàng"
      className="bg-white px-4 pt-4 sm:px-6 lg:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={(event) => {
        pointerX.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (pointerX.current == null || !canCycle) {
          return;
        }

        const delta = event.clientX - pointerX.current;
        pointerX.current = null;

        if (delta > 48) {
          goTo(index - 1);
        } else if (delta < -48) {
          goTo(index + 1);
        }
      }}
    >
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-sand">
        <div className="relative aspect-[16/9] lg:aspect-[12/5]">
          {items.map((slide, slideIndex) => {
            const active = slideIndex === index;

            return (
              <NextLink
                key={slide.id}
                href={slide.href}
                aria-hidden={!active}
                tabIndex={active ? 0 : -1}
                className={`absolute inset-0 no-underline transition-opacity duration-500 ${
                  active ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                {slide.imageUrl ? (
                  <StoreMedia
                    src={slide.imageUrl}
                    alt={slide.title}
                    priority={slideIndex === 0}
                    sizes="100vw"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-ivory px-6 text-center">
                    <div>
                      <p className="text-sm text-stone">{slide.eyebrow}</p>
                      <h1 className="mt-2 font-display text-3xl font-medium text-ink sm:text-5xl">
                        {slide.title}
                      </h1>
                    </div>
                  </div>
                )}
              </NextLink>
            );
          })}
        </div>

        {canCycle ? (
          <>
            <button
              type="button"
              aria-label="Slide trước"
              onClick={() => goTo(index - 1)}
              className="absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-ink shadow-sm"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Slide sau"
              onClick={() => goTo(index + 1)}
              className="absolute right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-ink shadow-sm"
            >
              <ChevronRightIcon className="size-4" />
            </button>
            <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
              {items.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Chuyển tới ${slide.title}`}
                  aria-current={slideIndex === index ? true : undefined}
                  onClick={() => goTo(slideIndex)}
                  className={`h-1.5 cursor-pointer rounded-full border-0 transition-all ${
                    slideIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
      <span className="sr-only">{current.title}</span>
    </section>
  );
}
