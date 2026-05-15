"use client";

import { useEffect, useState } from "react";
import { getRecentBids } from "@/lib/api/bids";
import type { Bid } from "@/types/bid";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function formatTimeAgo(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function BidCard({ bid }: { bid: Bid }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-border bg-card-bg/60 px-4 py-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-500">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </span>
      <span className="text-xs text-text-muted whitespace-nowrap">
        <span className="font-semibold text-text-heading">{bid.bidderUsername}</span>
        {" bid "}
        <span className="font-semibold text-green-500">{formatCurrency(bid.amount)}</span>
        {" on "}
        <span className="text-text-heading">{bid.auctionTitle}</span>
      </span>
      <span className="text-[10px] text-text-muted whitespace-nowrap">{formatTimeAgo(bid.placedAt)}</span>
    </div>
  );
}

export default function LiveBidTicker() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRecentBids() {
      try {
        const recent = await getRecentBids(15);
        if (!cancelled) {
          setBids(recent);
        }
      } catch {
        if (!cancelled) {
          setBids([]);
        }
      } finally {
        if (!cancelled) {
          setHasLoaded(true);
        }
      }
    }

    void loadRecentBids();
    const intervalId = window.setInterval(() => {
      void loadRecentBids();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  if (!hasLoaded || bids.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden py-3">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[var(--page-gradient)] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[var(--page-gradient)] to-transparent" />

      <div className="flex w-max animate-marquee gap-4">
        {bids.map((bid) => (
          <BidCard key={bid.id} bid={bid} />
        ))}
        {bids.map((bid) => (
          <BidCard key={`dup-${bid.id}`} bid={bid} />
        ))}
      </div>
    </div>
  );
}
