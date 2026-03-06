// My Bids page - list of all bids placed by the current user with status
"use client";

import { useState } from "react";
import Link from "next/link";

const filters = ["All", "Winning", "Outbid", "Won"] as const;
type Filter = (typeof filters)[number];

interface BidEntry {
  id: string;
  auctionTitle: string;
  auctionId: string;
  myBid: string;
  currentHighest: string;
  status: "Winning" | "Outbid" | "Won" | "Lost";
  endsIn: string;
  category: string;
}

const bids: BidEntry[] = [
  { id: "b1", auctionTitle: "Rare Seiko Chronograph", auctionId: "rare-seiko-chrono", myBid: "$1,240", currentHighest: "$1,240", status: "Winning", endsIn: "2h 11m", category: "Collectibles" },
  { id: "b2", auctionTitle: "PSA 10 Jordan Rookie Card", auctionId: "psa10-jordan-rookie", myBid: "$6,400", currentHighest: "$6,850", status: "Outbid", endsIn: "5h 44m", category: "Sports Cards" },
  { id: "b3", auctionTitle: "Vintage Polaroid SX-70", auctionId: "vintage-polaroid", myBid: "$380", currentHighest: "$380", status: "Won", endsIn: "Ended", category: "Cameras" },
  { id: "b4", auctionTitle: "Cinema Lens Master Kit", auctionId: "lens-master-kit", myBid: "$4,600", currentHighest: "$4,920", status: "Outbid", endsIn: "3d 06h", category: "Gear" },
  { id: "b5", auctionTitle: "Signed First Edition Novel", auctionId: "signed-first-edition", myBid: "$740", currentHighest: "$740", status: "Winning", endsIn: "8h 14m", category: "Books" },
  { id: "b6", auctionTitle: "Herman Miller Aeron Chair", auctionId: "herman-miller-aeron", myBid: "$520", currentHighest: "$710", status: "Lost", endsIn: "Ended", category: "Furniture" },
];

function statusStyle(status: BidEntry["status"]) {
  switch (status) {
    case "Winning":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800";
    case "Outbid":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800";
    case "Won":
      return "bg-accent-soft text-text-label border-border-strong";
    case "Lost":
      return "bg-surface-alt text-text-muted border-border-strong";
  }
}

export default function MyBidsPage() {
  const [active, setActive] = useState<Filter>("All");

  const filtered = active === "All" ? bids : bids.filter((b) => b.status === active);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-label">
          Bid tracker
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-text-heading">
          My Bids
        </h1>
        <p className="mt-1 text-sm text-text-body">
          Track every bid you&apos;ve placed and stay on top of active auctions.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              active === f
                ? "bg-accent text-white shadow-[0_12px_28px_-18px_rgba(8,72,184,0.95)]"
                : "border border-border-strong bg-card-bg text-text-label hover:bg-accent-soft"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Bid cards */}
      <div className="space-y-4">
        {filtered.map((bid) => (
          <div
            key={bid.id}
            className="rounded-[1.7rem] border border-border bg-card-bg p-5 shadow-[0_16px_50px_-30px_var(--card-shadow-light)] transition hover:-translate-y-0.5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-label">
                  {bid.category}
                </p>
                <Link
                  href={`/auctions/${bid.auctionId}`}
                  className="text-lg font-semibold tracking-tight text-text-heading hover:text-text-label"
                >
                  {bid.auctionTitle}
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-border-strong bg-accent-soft px-3 py-1 text-xs font-semibold text-text-label">
                  {bid.endsIn === "Ended" ? "Ended" : `Ends in ${bid.endsIn}`}
                </span>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyle(bid.status)}`}>
                  {bid.status}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-accent-soft p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-label">
                  Your bid
                </p>
                <p className="mt-1 text-lg font-semibold text-text-heading">{bid.myBid}</p>
              </div>
              <div className="rounded-2xl border border-border p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                  Current highest
                </p>
                <p className="mt-1 text-lg font-semibold text-text-heading">{bid.currentHighest}</p>
              </div>
              {bid.status === "Outbid" && (
                <div className="flex items-end">
                  <button className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(8,72,184,0.95)] transition hover:brightness-110">
                    Bid again
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
