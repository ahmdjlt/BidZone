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
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Outbid":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Won":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Lost":
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

export default function MyBidsPage() {
  const [active, setActive] = useState<Filter>("All");

  const filtered = active === "All" ? bids : bids.filter((b) => b.status === active);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
          Bid tracker
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-blue-950">
          My Bids
        </h1>
        <p className="mt-1 text-sm text-slate-600">
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
                ? "bg-blue-600 text-white shadow-[0_12px_28px_-18px_rgba(8,72,184,0.95)]"
                : "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
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
            className="rounded-[1.7rem] border border-blue-100 bg-white p-5 shadow-[0_16px_50px_-30px_rgba(27,111,242,0.2)] transition hover:-translate-y-0.5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                  {bid.category}
                </p>
                <Link
                  href={`/auctions/${bid.auctionId}`}
                  className="text-lg font-semibold tracking-tight text-blue-950 hover:text-blue-700"
                >
                  {bid.auctionTitle}
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {bid.endsIn === "Ended" ? "Ended" : `Ends in ${bid.endsIn}`}
                </span>
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyle(bid.status)}`}>
                  {bid.status}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-blue-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                  Your bid
                </p>
                <p className="mt-1 text-lg font-semibold text-blue-950">{bid.myBid}</p>
              </div>
              <div className="rounded-2xl border border-blue-100 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Current highest
                </p>
                <p className="mt-1 text-lg font-semibold text-blue-950">{bid.currentHighest}</p>
              </div>
              {bid.status === "Outbid" && (
                <div className="flex items-end">
                  <button className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(8,72,184,0.95)] transition hover:bg-blue-700">
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
