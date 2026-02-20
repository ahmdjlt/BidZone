// Auction listing page - browse/search/filter all available auctions
"use client";

import { useState } from "react";
import AuctionGrid from "@/components/auction/AuctionGrid";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { AuctionPreview } from "@/components/auction/AuctionCard";

const categories = ["All", "Collectibles", "Electronics", "Art", "Sports Cards", "Gear", "Books", "Home Design"] as const;
type Category = (typeof categories)[number];

const sortOptions = ["Ending Soon", "Most Bids", "Price: Low → High", "Price: High → Low"] as const;

const allAuctions: AuctionPreview[] = [
  { id: "rare-seiko-chrono", title: "Rare Seiko Chronograph", category: "Collectibles", currentBid: "$1,240", bids: 37, endsIn: "Ends in 2h 11m", watchers: 91, imageAccent: "linear-gradient(135deg,#2f80ff,#8ec5ff)" },
  { id: "psa10-jordan-rookie", title: "PSA 10 Jordan Rookie Card", category: "Sports Cards", currentBid: "$6,850", bids: 52, endsIn: "Ends in 5h 44m", watchers: 138, imageAccent: "linear-gradient(135deg,#3d9bff,#d5ebff)" },
  { id: "mid-century-lounge-chair", title: "Mid-Century Lounge Chair", category: "Home Design", currentBid: "$2,100", bids: 19, endsIn: "Ends in 1d 03h", watchers: 64, imageAccent: "linear-gradient(135deg,#2c6ce8,#5fc7ff)" },
  { id: "signed-first-edition", title: "Signed First Edition Novel", category: "Books", currentBid: "$740", bids: 26, endsIn: "Ends in 8h 14m", watchers: 58, imageAccent: "linear-gradient(135deg,#105ed6,#8cbcff)" },
  { id: "lens-master-kit", title: "Cinema Lens Master Kit", category: "Gear", currentBid: "$4,920", bids: 14, endsIn: "Ends in 3d 06h", watchers: 72, imageAccent: "linear-gradient(135deg,#1a7cf4,#88d6ff)" },
  { id: "vintage-polaroid", title: "Vintage Polaroid SX-70", category: "Electronics", currentBid: "$380", bids: 41, endsIn: "Ends in 1h 35m", watchers: 104, imageAccent: "linear-gradient(135deg,#2468d6,#7ec4ff)" },
  { id: "abstract-oil-canvas", title: "Abstract Oil on Canvas", category: "Art", currentBid: "$3,200", bids: 22, endsIn: "Ends in 2d 18h", watchers: 87, imageAccent: "linear-gradient(135deg,#1955c0,#63b3ff)" },
  { id: "limited-sneakers", title: "Limited Edition Air Max 1", category: "Collectibles", currentBid: "$890", bids: 33, endsIn: "Ends in 6h 02m", watchers: 112, imageAccent: "linear-gradient(135deg,#3576e8,#a2d4ff)" },
];

export default function AuctionsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered =
    activeCategory === "All"
      ? allAuctions
      : allAuctions.filter((a) => a.category === activeCategory);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_right,#d5e8ff_0,transparent_34%),linear-gradient(to_bottom,#f5f9ff_0%,#eef5ff_52%,#f6faff_100%)]">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-10 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Marketplace
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-blue-950 sm:text-4xl">
            Browse Auctions
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Discover live auctions across every category. Place your bid before time runs out.
          </p>
        </div>

        {/* Search + Sort bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search auctions..."
              className="w-full rounded-xl border border-blue-200 bg-white py-2.5 pl-10 pr-4 text-sm text-blue-950 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-blue-950 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100">
            {sortOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Category pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-[0_12px_28px_-18px_rgba(8,72,184,0.95)]"
                  : "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="mb-4 text-sm text-slate-500">
          Showing <span className="font-semibold text-blue-950">{filtered.length}</span> auctions
        </p>

        {/* Grid */}
        <AuctionGrid auctions={filtered} />
      </main>

      <Footer />
    </div>
  );
}
