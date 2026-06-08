// Auction listing page - browse/search/filter all available auctions
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AuctionGrid from "@/components/auction/AuctionGrid";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toAuctionPreview } from "@/lib/auctionPreview";
import { getAuctions, recordBrowsingEvent } from "@/lib/api/auctions";
import { useCategories } from "@/hooks/queries/useCategories";
import { CATEGORY_ICONS, GENERIC_ICON } from "@/lib/categoryIcons";
import { useAuthStore } from "@/store/authStore";
import type { AuctionSummary } from "@/types/auction";

const filterSections = [
  { label: "Category", key: "category" },
  { label: "Reserve price", key: "reserve" },
  { label: "Buy now", key: "buynow" },
  { label: "Shipping", key: "shipping" },
  { label: "Closing date", key: "closing" },
  { label: "Budget", key: "budget" },
  { label: "Location", key: "location" },
  { label: "Dimensions", key: "dimensions" },
  { label: "Brand", key: "brand" },
  { label: "Condition", key: "condition" },
] as const;

const sortOptions = ["Price: Low to High", "Price: High to Low"] as const;
type SortOption = (typeof sortOptions)[number];

function mapSortToBackend(sort: SortOption): "price_asc" | "price_desc" {
  return sort === "Price: High to Low" ? "price_desc" : "price_asc";
}

export default function AuctionsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: apiCategories = [] } = useCategories();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [apiAuctions, setApiAuctions] = useState<AuctionSummary[]>([]);
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<SortOption>("Price: Low to High");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const activeCategorySlug = searchParams.get("category");
  const searchQuery = searchParams.get("q")?.trim() || "";

  const categories = [
    { label: "All", slug: null as string | null },
    ...apiCategories.map((c) => ({ label: c.name, slug: c.slug })),
  ];

  const activeCategoryName = activeCategorySlug
    ? apiCategories.find((c) => c.slug === activeCategorySlug)?.name ?? "Categories"
    : "Categories";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
      if (priceRef.current && !priceRef.current.contains(event.target as Node)) {
        setIsPriceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isFilterOpen) {
      return;
    }

    const scrollY = window.scrollY;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPosition = body.style.position;
    const previousTop = body.style.top;
    const previousWidth = body.style.width;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      body.style.overflow = previousOverflow;
      body.style.position = previousPosition;
      body.style.top = previousTop;
      body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isFilterOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadAuctions() {
      setIsLoadingAuctions(true);
      setLoadError(null);

      try {
        const isSpecialCategory = activeCategorySlug === "this-week" || activeCategorySlug === "trending";
        const category = !isSpecialCategory ? activeCategorySlug ?? undefined : undefined;

        const auctions = await getAuctions({
          search: searchQuery || undefined,
          category,
          sort: mapSortToBackend(activeSort),
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        });

        if (!cancelled) {
          setApiAuctions(auctions);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Could not load auctions.");
          setApiAuctions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAuctions(false);
        }
      }
    }

    void loadAuctions();

    return () => {
      cancelled = true;
    };
  }, [activeCategorySlug, activeSort, minPrice, maxPrice, searchQuery]);

  useEffect(() => {
    if (!isAuthenticated || !activeCategorySlug) {
      return;
    }

    if (activeCategorySlug === "this-week" || activeCategorySlug === "trending") {
      return;
    }

    void recordBrowsingEvent({
      eventType: "CategoryView",
      categorySlug: activeCategorySlug,
    }).catch(() => undefined);
  }, [activeCategorySlug, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || searchQuery.length < 2) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void recordBrowsingEvent({
        eventType: "Search",
        searchTerm: searchQuery,
      }).catch(() => undefined);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, searchQuery]);

  const handleCategoryChange = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const sortedAuctions = useMemo(() => {
    let auctions = [...apiAuctions];

    if (activeCategorySlug === "this-week") {
      const now = Date.now();
      const weekAhead = now + 7 * 24 * 60 * 60 * 1000;
      auctions = auctions.filter((auction) => {
        const endTime = new Date(auction.endTime).getTime();
        return auction.status === "Active" && endTime >= now && endTime <= weekAhead;
      });
    }

    if (activeCategorySlug === "trending") {
      auctions.sort((left, right) => right.bidCount - left.bidCount);
    }

    const uniqueAuctions = Array.from(
      new Map(auctions.map((auction) => [auction.id, auction])).values()
    );

    return uniqueAuctions.map(toAuctionPreview);
  }, [activeCategorySlug, apiAuctions]);

  return (
    <div className="page-gradient relative min-h-screen">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-6 pb-10 pt-10 sm:px-10">
        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight text-text-heading sm:text-4xl">
          All Live Bids
        </h1>

        {/* Filter bar */}
        <div className="mt-6 flex items-center gap-3 border-b border-border pb-4">
          {/* Filters button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border-strong bg-card-bg px-4 py-2.5 text-sm font-medium text-text-heading transition hover:bg-accent-soft"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M7 12h10M10 18h4" />
            </svg>
            Filters
          </button>

          {/* Categories dropdown */}
          <div ref={categoriesRef} className="relative">
            <button
              type="button"
              onClick={() => { setIsCategoriesOpen((v) => !v); setIsPriceOpen(false); }}
              className={`flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                isCategoriesOpen
                  ? "border-accent bg-accent-soft/50 text-accent"
                  : "border-border-strong bg-card-bg text-text-heading hover:bg-accent-soft"
              }`}
            >
              {activeCategoryName}
              <svg
                className={`h-3.5 w-3.5 transition-transform ${isCategoriesOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20" fill="none"
              >
                <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isCategoriesOpen && (
              <div className="absolute left-0 z-30 mt-1 max-h-80 w-56 overflow-y-auto rounded-xl border border-border-strong bg-card-bg p-1 shadow-xl">
                {categories.map((cat) => (
                  <button
                    key={cat.slug ?? "all"}
                    type="button"
                    onClick={() => {
                      handleCategoryChange(cat.slug);
                      setIsCategoriesOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                      activeCategorySlug === cat.slug
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
              </div>
            )}
          </div>

          {/* Price dropdown */}
          <div ref={priceRef} className="relative">
            <button
              type="button"
              onClick={() => { setIsPriceOpen((v) => !v); setIsCategoriesOpen(false); }}
              className={`flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                isPriceOpen || minPrice || maxPrice
                  ? "border-accent bg-accent-soft/50 text-accent"
                  : "border-border-strong bg-card-bg text-text-heading hover:bg-accent-soft"
              }`}
            >
              {minPrice || maxPrice
                ? `$${minPrice || "0"} - $${maxPrice || "any"}`
                : "Price"}
              <svg
                className={`h-3.5 w-3.5 transition-transform ${isPriceOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20" fill="none"
              >
                <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isPriceOpen && (
              <div className="absolute left-0 z-30 mt-1 w-64 rounded-xl border border-border-strong bg-card-bg p-4 shadow-xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Price range</p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full rounded-lg border border-border-strong bg-surface-alt py-2 pl-7 pr-3 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <span className="text-text-muted">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full rounded-lg border border-border-strong bg-surface-alt py-2 pl-7 pr-3 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setActiveSort(option)}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                        option === activeSort
                          ? "bg-accent text-white"
                          : "bg-accent-soft/50 text-text-heading hover:bg-accent-soft"
                      }`}
                    >
                      {option === "Price: Low to High" ? "Low to High" : "High to Low"}
                    </button>
                  ))}
                </div>

                {(minPrice || maxPrice) && (
                  <button
                    type="button"
                    onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                    className="mt-3 w-full text-center text-xs font-medium text-accent hover:text-accent/80 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="mt-4 mb-4 text-sm text-text-muted">
          Showing <span className="font-semibold text-text-heading">{sortedAuctions.length}</span> auctions
          {searchQuery ? (
            <span>
              {" "}for <span className="font-semibold text-text-heading">&quot;{searchQuery}&quot;</span>
            </span>
          ) : null}
        </p>

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
      </main>

      {/* Filter drawer overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Drawer */}
          <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-card-bg shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="text-lg font-bold text-text-heading">Filters</h2>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="rounded-lg p-1.5 text-text-muted transition hover:bg-accent-soft hover:text-text-heading"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter list */}
            <div className="flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filterSections.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className="flex w-full items-center justify-between border-b border-border px-6 py-4 text-left transition hover:bg-accent-soft/40"
                >
                  <span className="text-sm font-medium text-text-heading">{filter.label}</span>
                  <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Drawer footer */}
            <div className="p-4">
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="w-full rounded-lg bg-accent py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
