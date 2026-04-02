// Auction listing page - browse/search/filter all available auctions
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AuctionGrid from "@/components/auction/AuctionGrid";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { AuctionPreview } from "@/components/auction/AuctionCard";

const categories = [
  { label: "All", slug: null, icon: "" },
  { label: "This Week", slug: "this-week", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" },
  { label: "Trending", slug: "trending", icon: "M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" },
  { label: "Art", slug: "art", icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159M3.75 19.5h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm12.75-11.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" },
  { label: "Interiors", slug: "interiors", icon: "M2.25 12l8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
  { label: "Jewellery", slug: "jewellery", icon: "M6 3h12l3 5-9 13L3 8l3-5Zm3.5 5h5M6.5 8L12 3.5 17.5 8" },
  { label: "Watches", slug: "watches", icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
  { label: "Fashion", slug: "fashion", icon: "M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" },
  { label: "Coins & Stamps", slug: "coins-stamps", icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" },
  { label: "Comics", slug: "comics", icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" },
  { label: "Cars & Bikes", slug: "cars-bikes", icon: "M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" },
  { label: "Wine & Spirits", slug: "wine-spirits", icon: "M9 2.25h6m-6 0v3a6.005 6.005 0 0 1-1.764 4.236L9 2.25Zm6 0v3a6.005 6.005 0 0 0 1.764 4.236L15 2.25ZM7.5 21.75h9M12 17.25v4.5m0-4.5a6 6 0 0 1-6-6v-1.5h12v1.5a6 6 0 0 1-6 6Z" },
  { label: "Electronics", slug: "electronics", icon: "M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" },
  { label: "Collectibles", slug: "collectibles", icon: "M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" },
  { label: "Sports", slug: "sports", icon: "M15.59 14.37a6 6 0 1 0-7.04-7.02m7.04 7.02a6 6 0 0 1-7.04-7.02m7.04 7.02l-2.83 2.83-4.24 4.24M8.55 7.35L5.72 10.18 1.48 14.42m7.07-7.07L6.4 9.5m5.3.2L9.55 11.85m5.3.21l-2.15 2.15M8 6.5l2.15-2.15m.2 5.3L8.2 11.8" },
  { label: "Books", slug: "books", icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" },
  { label: "Toys", slug: "toys", icon: "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.834 48.834 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" },
  { label: "Photography", slug: "photography", icon: "M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316ZM16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" },
  { label: "Musical", slug: "musical", icon: "M9 19.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-3a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9 19.5V7.5l12-3v12" },
] as const;

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

const sortOptions = ["Price: Low → High", "Price: High → Low"] as const;
type SortOption = (typeof sortOptions)[number];

const allAuctions: AuctionPreview[] = [
  { id: "rare-seiko-chrono", title: "Rare Seiko Chronograph", description: "Automatic Movement, 42mm Case, Stainless Steel Bracelet, Sapphire Crystal", location: "Tokyo, Japan", category: "Collectibles", currentBid: "$1,240", bids: 37, endsIn: "2h 11m", watchers: 91, imageUrl: "/auction-images/rare-seiko-chrono.svg", imageAccent: "linear-gradient(135deg,#2f80ff,#8ec5ff)" },
  { id: "psa10-jordan-rookie", title: "PSA 10 Jordan Rookie Card", description: "1986 Fleer #57, Gem Mint Condition, Authenticated & Graded", location: "Chicago, IL 60601", category: "Sports Cards", currentBid: "$6,850", bids: 52, endsIn: "5h 44m", watchers: 138, imageUrl: "/auction-images/psa10-jordan-rookie.svg", imageAccent: "linear-gradient(135deg,#3d9bff,#d5ebff)" },
  { id: "mid-century-lounge-chair", title: "Mid-Century Lounge Chair", description: "Walnut Frame, Italian Leather Cushions, Original 1960s Design", location: "Portland, OR 97201", category: "Home Design", currentBid: "$2,100", bids: 19, endsIn: "1d 03h", watchers: 64, imageUrl: "/auction-images/mid-century-lounge-chair.svg", imageAccent: "linear-gradient(135deg,#2c6ce8,#5fc7ff)" },
  { id: "signed-first-edition", title: "Signed First Edition Novel", description: "Hardcover, Dust Jacket Intact, Author-Signed, Near Fine Condition", location: "New York, NY 10001", category: "Books", currentBid: "$740", bids: 26, endsIn: "8h 14m", watchers: 58, imageUrl: "/auction-images/signed-first-edition.svg", imageAccent: "linear-gradient(135deg,#105ed6,#8cbcff)" },
  { id: "lens-master-kit", title: "Cinema Lens Master Kit", description: "3-Lens Set, PL Mount, T1.5 Aperture, Hard Carrying Case Included", location: "Los Angeles, CA 90028", category: "Gear", currentBid: "$4,920", bids: 14, endsIn: "3d 06h", watchers: 72, imageUrl: "/auction-images/lens-master-kit.svg", imageAccent: "linear-gradient(135deg,#1a7cf4,#88d6ff)" },
  { id: "vintage-polaroid", title: "Vintage Polaroid SX-70", description: "Original Leather Case, Film Tested, Excellent Working Condition", location: "San Francisco, CA 94102", category: "Electronics", currentBid: "$380", bids: 41, endsIn: "1h 35m", watchers: 104, imageUrl: "/auction-images/vintage-polaroid.svg", imageAccent: "linear-gradient(135deg,#2468d6,#7ec4ff)" },
  { id: "abstract-oil-canvas", title: "Abstract Oil on Canvas", description: "36x48 Gallery Wrapped, Signed by Artist, Certificate of Authenticity", location: "Miami, FL 33101", category: "Art", currentBid: "$3,200", bids: 22, endsIn: "2d 18h", watchers: 87, imageUrl: "/auction-images/abstract-oil-canvas.svg", imageAccent: "linear-gradient(135deg,#1955c0,#63b3ff)" },
  { id: "limited-sneakers", title: "Limited Edition Air Max 1", description: "Size 10, Deadstock, Original Box & Hang Tags Included", location: "Austin, TX 78701", category: "Collectibles", currentBid: "$890", bids: 33, endsIn: "6h 02m", watchers: 112, imageUrl: "/auction-images/limited-sneakers.svg", imageAccent: "linear-gradient(135deg,#3576e8,#a2d4ff)" },
];

export default function AuctionsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSort, setActiveSort] = useState<SortOption>("Price: Low → High");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const activeCategorySlug = searchParams.get("category");

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);

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

  const filtered =
    activeCategorySlug === null
      ? allAuctions
      : allAuctions.filter((auction) => {
          const category = categories.find((option) => option.label === auction.category);
          return category?.slug === activeCategorySlug;
        });

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
    const toNumber = (value: string) => Number(value.replace(/[^\d.]/g, ""));
    let auctions = [...filtered];

    // Price range filter
    const min = minPrice ? Number(minPrice) : 0;
    const max = maxPrice ? Number(maxPrice) : Infinity;
    if (minPrice || maxPrice) {
      auctions = auctions.filter((a) => {
        const price = toNumber(a.currentBid);
        return price >= min && price <= max;
      });
    }

    if (activeSort === "Price: High → Low") return auctions.sort((a, b) => toNumber(b.currentBid) - toNumber(a.currentBid));
    return auctions.sort((a, b) => toNumber(a.currentBid) - toNumber(b.currentBid));
  }, [filtered, activeSort, minPrice, maxPrice]);

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
              {activeCategory ? activeCategory.label : "Categories"}
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
                    key={cat.label}
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
                    {cat.icon && (
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
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
                ? `$${minPrice || "0"} – $${maxPrice || "∞"}`
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
                      {option === "Price: Low → High" ? "Low → High" : "High → Low"}
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
        </p>

        {/* Grid */}
        <AuctionGrid auctions={sortedAuctions} />
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
            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
