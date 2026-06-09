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

const SORT_OPTIONS = [
  { label: "Ending Soon", value: "ending_soon" },
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Trending", value: "trending" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const CLOSING_OPTIONS = [
  { label: "Any time", value: "any" },
  { label: "Ending today", value: "today" },
  { label: "Ending this week", value: "week" },
  { label: "Ending this month", value: "month" },
] as const;

type ClosingValue = (typeof CLOSING_OPTIONS)[number]["value"];

export default function AuctionsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: apiCategories = [] } = useCategories();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [apiAuctions, setApiAuctions] = useState<AuctionSummary[]>([]);
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filter bar dropdowns
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);

  // Drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  // Active filter values
  const [activeSort, setActiveSort] = useState<SortValue>("ending_soon");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [closingDate, setClosingDate] = useState<ClosingValue>("any");

  // Draft values edited inside the drawer before Apply
  const [draftMin, setDraftMin] = useState("");
  const [draftMax, setDraftMax] = useState("");
  const [draftClosing, setDraftClosing] = useState<ClosingValue>("any");
  const [draftSort, setDraftSort] = useState<SortValue>("ending_soon");

  const activeCategorySlug = searchParams.get("category");
  const searchQuery = searchParams.get("q")?.trim() || "";

  const categories = [
    { label: "All", slug: null as string | null },
    ...apiCategories.map((c) => ({ label: c.name, slug: c.slug })),
  ];

  const activeCategoryName = activeCategorySlug
    ? apiCategories.find((c) => c.slug === activeCategorySlug)?.name ?? "Categories"
    : "Categories";

  // Sync draft state when drawer opens
  useEffect(() => {
    if (isFilterOpen) {
      setDraftMin(minPrice);
      setDraftMax(maxPrice);
      setDraftClosing(closingDate);
      setDraftSort(activeSort);
      setExpandedFilter(null);
    }
  }, [isFilterOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Click-outside for dropdowns
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

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!isFilterOpen) return;
    const scrollY = window.scrollY;
    const { body } = document;
    const prev = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [isFilterOpen]);

  // Fetch auctions
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
          sort: activeSort,
          status: "Active",
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        });

        if (!cancelled) setApiAuctions(auctions);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Could not load auctions.");
          setApiAuctions([]);
        }
      } finally {
        if (!cancelled) setIsLoadingAuctions(false);
      }
    }

    void loadAuctions();
    return () => { cancelled = true; };
  }, [activeCategorySlug, activeSort, minPrice, maxPrice, searchQuery]);

  // Browsing signals
  useEffect(() => {
    if (!isAuthenticated || !activeCategorySlug) return;
    if (activeCategorySlug === "this-week" || activeCategorySlug === "trending") return;
    void recordBrowsingEvent({ eventType: "CategoryView", categorySlug: activeCategorySlug }).catch(() => undefined);
  }, [activeCategorySlug, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || searchQuery.length < 2) return;
    const id = window.setTimeout(() => {
      void recordBrowsingEvent({ eventType: "Search", searchTerm: searchQuery }).catch(() => undefined);
    }, 500);
    return () => window.clearTimeout(id);
  }, [isAuthenticated, searchQuery]);

  const handleCategoryChange = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const applyDrawerFilters = () => {
    setMinPrice(draftMin);
    setMaxPrice(draftMax);
    setClosingDate(draftClosing);
    setActiveSort(draftSort);
    setIsFilterOpen(false);
  };

  const clearAllFilters = () => {
    setDraftMin("");
    setDraftMax("");
    setDraftClosing("any");
    setDraftSort("ending_soon");
    handleCategoryChange(null);
    setMinPrice("");
    setMaxPrice("");
    setClosingDate("any");
    setActiveSort("ending_soon");
    setIsFilterOpen(false);
  };

  const hasActiveFilters = minPrice || maxPrice || closingDate !== "any" || activeSort !== "ending_soon" || activeCategorySlug;

  const sortedAuctions = useMemo(() => {
    let auctions = [...apiAuctions];

    if (activeCategorySlug === "this-week") {
      const now = Date.now();
      auctions = auctions.filter((a) => {
        const end = new Date(a.endTime).getTime();
        return a.status === "Active" && end >= now && end <= now + 7 * 24 * 60 * 60 * 1000;
      });
    }

    if (closingDate !== "any") {
      const now = Date.now();
      const cutoff: Record<string, number> = {
        today: now + 24 * 60 * 60 * 1000,
        week: now + 7 * 24 * 60 * 60 * 1000,
        month: now + 30 * 24 * 60 * 60 * 1000,
      };
      auctions = auctions.filter((a) => {
        const end = new Date(a.endTime).getTime();
        return end >= now && end <= cutoff[closingDate];
      });
    }

    return Array.from(new Map(auctions.map((a) => [a.id, a])).values()).map(toAuctionPreview);
  }, [apiAuctions, activeCategorySlug, closingDate]);

  const toggleSection = (key: string) => setExpandedFilter((prev) => (prev === key ? null : key));

  return (
    <div className="page-gradient relative min-h-screen">
      <Navbar />

      <main className="mx-auto w-full max-w-[1440px] px-6 pb-10 pt-10 sm:px-10">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading sm:text-4xl">
          All Live Bids
        </h1>

        {/* Filter bar */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-border pb-4">
          {/* Filters drawer button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
              hasActiveFilters
                ? "border-accent bg-accent-soft/50 text-accent"
                : "border-border-strong bg-card-bg text-text-heading hover:bg-accent-soft"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M7 12h10M10 18h4" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {[activeCategorySlug, minPrice || maxPrice, closingDate !== "any", activeSort !== "ending_soon"].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Categories dropdown */}
          <div ref={categoriesRef} className="relative">
            <button
              type="button"
              onClick={() => { setIsCategoriesOpen((v) => !v); setIsPriceOpen(false); }}
              className={`flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                isCategoriesOpen || activeCategorySlug
                  ? "border-accent bg-accent-soft/50 text-accent"
                  : "border-border-strong bg-card-bg text-text-heading hover:bg-accent-soft"
              }`}
            >
              {activeCategoryName}
              <svg className={`h-3.5 w-3.5 transition-transform ${isCategoriesOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none">
                <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isCategoriesOpen && (
              <div className="absolute left-0 z-30 mt-1 max-h-80 w-56 overflow-y-auto rounded-xl border border-border-strong bg-card-bg p-1 shadow-xl">
                {categories.map((cat) => (
                  <button
                    key={cat.slug ?? "all"}
                    type="button"
                    onClick={() => { handleCategoryChange(cat.slug); setIsCategoriesOpen(false); }}
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
              {minPrice || maxPrice ? `$${minPrice || "0"} – $${maxPrice || "any"}` : "Price"}
              <svg className={`h-3.5 w-3.5 transition-transform ${isPriceOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none">
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
                  <span className="text-text-muted">–</span>
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
                {(minPrice || maxPrice) && (
                  <button
                    type="button"
                    onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                    className="mt-3 w-full text-center text-xs font-medium text-accent transition hover:text-accent/80"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active sort badge */}
          {activeSort !== "ending_soon" && (
            <span className="flex items-center gap-1.5 rounded-lg border border-accent bg-accent-soft/50 px-3 py-2 text-sm font-medium text-accent">
              {SORT_OPTIONS.find((o) => o.value === activeSort)?.label}
              <button type="button" onClick={() => setActiveSort("ending_soon")} className="ml-0.5 hover:text-accent/70">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm text-text-muted underline-offset-2 transition hover:text-text-heading hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="mb-4 mt-4 text-sm text-text-muted">
          Showing <span className="font-semibold text-text-heading">{sortedAuctions.length}</span> auctions
          {searchQuery && (
            <span> for <span className="font-semibold text-text-heading">&quot;{searchQuery}&quot;</span></span>
          )}
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

      {/* Filter drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />

          <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-card-bg shadow-2xl">
            {/* Header */}
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

            {/* Accordion filters */}
            <div className="flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              {/* Category */}
              <div className="border-b border-border">
                <button
                  type="button"
                  onClick={() => toggleSection("category")}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-accent-soft/40"
                >
                  <span className="text-sm font-medium text-text-heading">
                    Category
                    {activeCategorySlug && (
                      <span className="ml-2 text-xs font-normal text-accent">
                        {apiCategories.find((c) => c.slug === activeCategorySlug)?.name}
                      </span>
                    )}
                  </span>
                  <svg className={`h-4 w-4 text-accent transition-transform ${expandedFilter === "category" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {expandedFilter === "category" && (
                  <div className="max-h-60 overflow-y-auto px-4 pb-4">
                    {categories.map((cat) => (
                      <button
                        key={cat.slug ?? "all"}
                        type="button"
                        onClick={() => { handleCategoryChange(cat.slug); }}
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

              {/* Budget */}
              <div className="border-b border-border">
                <button
                  type="button"
                  onClick={() => toggleSection("budget")}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-accent-soft/40"
                >
                  <span className="text-sm font-medium text-text-heading">
                    Budget
                    {(draftMin || draftMax) && (
                      <span className="ml-2 text-xs font-normal text-accent">
                        ${draftMin || "0"} – ${draftMax || "any"}
                      </span>
                    )}
                  </span>
                  <svg className={`h-4 w-4 text-accent transition-transform ${expandedFilter === "budget" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {expandedFilter === "budget" && (
                  <div className="px-6 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={draftMin}
                          onChange={(e) => setDraftMin(e.target.value)}
                          className="w-full rounded-lg border border-border-strong bg-surface-alt py-2 pl-7 pr-3 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      </div>
                      <span className="text-text-muted">–</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">$</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={draftMax}
                          onChange={(e) => setDraftMax(e.target.value)}
                          className="w-full rounded-lg border border-border-strong bg-surface-alt py-2 pl-7 pr-3 text-sm text-text-heading placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      </div>
                    </div>
                    {(draftMin || draftMax) && (
                      <button type="button" onClick={() => { setDraftMin(""); setDraftMax(""); }} className="mt-2 text-xs text-accent transition hover:text-accent/70">
                        Clear
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Closing date */}
              <div className="border-b border-border">
                <button
                  type="button"
                  onClick={() => toggleSection("closing")}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-accent-soft/40"
                >
                  <span className="text-sm font-medium text-text-heading">
                    Closing date
                    {draftClosing !== "any" && (
                      <span className="ml-2 text-xs font-normal text-accent">
                        {CLOSING_OPTIONS.find((o) => o.value === draftClosing)?.label}
                      </span>
                    )}
                  </span>
                  <svg className={`h-4 w-4 text-accent transition-transform ${expandedFilter === "closing" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {expandedFilter === "closing" && (
                  <div className="px-6 pb-4 flex flex-col gap-1">
                    {CLOSING_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDraftClosing(opt.value)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          draftClosing === opt.value
                            ? "bg-accent font-medium text-white"
                            : "text-text-heading hover:bg-accent-soft"
                        }`}
                      >
                        <span className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${draftClosing === opt.value ? "border-white" : "border-border-strong"}`}>
                          {draftClosing === opt.value && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort */}
              <div className="border-b border-border">
                <button
                  type="button"
                  onClick={() => toggleSection("sort")}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-accent-soft/40"
                >
                  <span className="text-sm font-medium text-text-heading">
                    Sort by
                    <span className="ml-2 text-xs font-normal text-accent">
                      {SORT_OPTIONS.find((o) => o.value === draftSort)?.label}
                    </span>
                  </span>
                  <svg className={`h-4 w-4 text-accent transition-transform ${expandedFilter === "sort" ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {expandedFilter === "sort" && (
                  <div className="px-6 pb-4 flex flex-col gap-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDraftSort(opt.value)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          draftSort === opt.value
                            ? "bg-accent font-medium text-white"
                            : "text-text-heading hover:bg-accent-soft"
                        }`}
                      >
                        <span className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${draftSort === opt.value ? "border-white" : "border-border-strong"}`}>
                          {draftSort === opt.value && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-border p-4">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 rounded-lg border border-border-strong py-3 text-sm font-semibold text-text-heading transition hover:bg-accent-soft"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={applyDrawerFilters}
                className="flex-1 rounded-lg bg-accent py-3 text-sm font-semibold text-white transition hover:brightness-110"
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
