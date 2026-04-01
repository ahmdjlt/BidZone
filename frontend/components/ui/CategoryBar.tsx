"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Category {
  label: string;
  icon: string;
}

export default function CategoryBar({ categories }: { categories: Category[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <section className="relative mt-5">
      {canScrollLeft && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 bottom-3 z-10 w-12 bg-gradient-to-r from-[var(--page-gradient)] to-transparent" />
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute left-0 top-[40%] z-20 -translate-y-1/2 text-text-muted transition hover:text-text-heading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
        </>
      )}

      <div ref={scrollRef} className="flex gap-5 overflow-x-auto px-2 pb-2 scrollbar-hide">
        {categories.map((cat, i) => (
          <Link
            key={cat.label}
            href={`/auctions?category=${encodeURIComponent(cat.label)}`}
            className={`group flex shrink-0 flex-col items-center gap-1.5 ${
              i === 0 ? "text-accent" : "text-text-muted hover:text-text-heading"
            } transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
            </svg>
            <span className="whitespace-nowrap text-[11px] font-semibold">{cat.label}</span>
            {i === 0 && <span className="h-[2px] w-full rounded-full bg-accent" />}
          </Link>
        ))}
      </div>

      {canScrollRight && (
        <>
          <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-[var(--page-gradient)] to-transparent" />
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute right-0 top-[40%] z-20 -translate-y-1/2 text-text-muted transition hover:text-text-heading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}
