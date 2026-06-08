// Dashboard browse page - browse/search/filter auctions (sidebar layout)
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AuctionGrid from "@/components/auction/AuctionGrid";
import { getAuctions, recordBrowsingEvent } from "@/lib/api/auctions";
import { toAuctionPreview } from "@/lib/auctionPreview";
import { useAuthStore } from "@/store/authStore";
import type { AuctionSummary } from "@/types/auction";

const categories = ["All", "Art", "Interiors", "Jewellery", "Watches", "Fashion", "Coins & Stamps", "Comics", "Cars & Bikes", "Wine & Spirits", "Electronics", "Collectibles", "Sports", "Books", "Toys", "Photography", "Musical"] as const;
type Category = (typeof categories)[number];

const sortOptions = ["Ending Soon", "Most Bids", "Price: Low to High", "Price: High to Low"] as const;
type SortOption = (typeof sortOptions)[number];

function mapSortToBackend(sort: SortOption): "ending_soon" | "price_asc" | "price_desc" | undefined {
  if (sort === "Ending Soon") return "ending_soon";
  if (sort === "Price: Low to High") return "price_asc";
  if (sort === "Price: High to Low") return "price_desc";
  return undefined;
}

function slugifyCategory(category: Category): string | undefined {
  if (category === "All") return undefined;
  return category.toLowerCase().replace(/&/g, "").replace(/\s+/g, "-");
}

export default function DashboardBrowsePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [activeSort, setActiveSort] = useState<SortOption>("Ending Soon");
  const [searchTerm, setSearchTerm] = useState("");
  const [auctions, setAuctions] = useState<AuctionSummary[]>([]);
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAuctions() {
      setIsLoadingAuctions(true);
      setLoadError(null);

      try {
        const result = await getAuctions({
          search: searchTerm.trim() || undefined,
          category: slugifyCategory(activeCategory),
          sort: mapSortToBackend(activeSort),
        });

        if (!cancelled) {
          setAuctions(result);
        }
      } catch (error) {
        if (!cancelled) {
          setAuctions([]);
          setLoadError(error instanceof Error ? error.message : "Could not load auctions.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAuctions(false);
        }
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadAuctions();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeCategory, activeSort, searchTerm]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const categorySlug = slugifyCategory(activeCategory);
    if (!categorySlug) {
      return;
    }

    void recordBrowsingEvent({
      eventType: "CategoryView",
      categorySlug,
    }).catch(() => undefined);
  }, [activeCategory, isAuthenticated]);

  useEffect(() => {
    const trimmedSearch = searchTerm.trim();
    if (!isAuthenticated || trimmedSearch.length < 2) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void recordBrowsingEvent({
        eventType: "Search",
        searchTerm: trimmedSearch,
      }).catch(() => undefined);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, searchTerm]);

  const sortedAuctions = useMemo(() => {
    const previews = auctions.map(toAuctionPreview);

    if (activeSort === "Most Bids") {
      return previews.sort((a, b) => b.bids - a.bids);
    }

    return previews;
  }, [activeSort, auctions]);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-label">
          Marketplace
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text-heading sm:text-4xl">
          Browse Auctions
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-body">
          Discover live auctions across every category. Place your bid before time runs out.
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative sm:max-w-sm">
          <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search auctions..."
            className="w-full rounded-xl border border-border-strong bg-input-bg py-2.5 pl-10 pr-4 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              activeCategory === cat
                ? "bg-accent text-white shadow-[0_12px_28px_-18px_rgba(8,72,184,0.95)]"
                : "border border-border-strong bg-card-bg text-text-label hover:bg-accent-soft"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results + Sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">
          Showing <span className="font-semibold text-text-heading">{sortedAuctions.length}</span> auctions
        </p>
        <div ref={sortDropdownRef} className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsSortOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-border-strong bg-input-bg px-4 py-2.5 text-left text-sm font-medium text-text-heading focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:min-w-[190px]"
          >
            <span>{activeSort}</span>
            <svg
              className={`h-4 w-4 text-text-heading transition-transform ${isSortOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 8l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {isSortOpen && (
            <div className="absolute left-0 z-20 mt-1 w-full overflow-hidden rounded-xl border border-border-strong bg-card-bg shadow-[0_12px_24px_-16px_var(--card-shadow)]">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setActiveSort(option);
                    setIsSortOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm leading-tight ${
                    option === activeSort
                      ? "bg-accent font-medium text-white"
                      : "text-text-heading hover:bg-accent-soft"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoadingAuctions ? (
        <div className="rounded-xl border border-dashed border-border-strong px-5 py-7 text-sm text-text-muted">
          Loading live auctions...
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {loadError}
        </div>
      ) : sortedAuctions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong px-5 py-7 text-sm text-text-muted">
          No auctions found for the current filters.
        </div>
      ) : (
        <AuctionGrid auctions={sortedAuctions} />
      )}
    </>
  );
}
