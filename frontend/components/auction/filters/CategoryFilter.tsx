"use client";

import { CATEGORY_ICONS, GENERIC_ICON } from "@/lib/categoryIcons";

export interface CategoryOption {
  label: string;
  slug: string | null;
}

interface CategoryFilterProps {
  categories: CategoryOption[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
}

/** Shared list of selectable category pills, used in both the dropdown and the drawer. */
export default function CategoryFilter({ categories, activeSlug, onSelect }: CategoryFilterProps) {
  return (
    <>
      {categories.map((cat) => (
        <button
          key={cat.slug ?? "all"}
          type="button"
          onClick={() => onSelect(cat.slug)}
          aria-pressed={activeSlug === cat.slug}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
            activeSlug === cat.slug
              ? "bg-accent font-medium text-white"
              : "text-text-heading hover:bg-accent-soft"
          }`}
        >
          {cat.slug && (
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={CATEGORY_ICONS[cat.slug] ?? GENERIC_ICON} />
            </svg>
          )}
          {cat.label}
        </button>
      ))}
    </>
  );
}
