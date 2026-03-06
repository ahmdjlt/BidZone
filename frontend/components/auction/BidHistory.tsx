"use client";

import { useState } from "react";

export interface Bid {
  id: string;
  bidder: string;
  amount: string;
  time: string;
  isWinning?: boolean;
}

interface BidHistoryProps {
  bids: Bid[];
}

export default function BidHistory({ bids }: BidHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleBids = showAll ? bids : bids.slice(0, 5);

  if (bids.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card-bg p-6 text-center">
        <p className="text-sm text-text-muted">No bids yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card-bg">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-label">
          Bid history
        </p>
        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-text-label">
          {bids.length} bids
        </span>
      </div>

      <ul className="divide-y divide-divider">
        {visibleBids.map((bid, index) => (
          <li
            key={bid.id}
            className={`flex items-center justify-between px-5 py-3 transition-colors ${index === 0
                ? "bg-accent-soft/50"
                : "hover:bg-accent-soft/30"
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${index === 0
                    ? "bg-accent text-white"
                    : "bg-accent-soft text-text-label"
                  }`}
              >
                {bid.bidder.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-heading">
                  {bid.bidder}
                  {index === 0 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      Highest
                    </span>
                  )}
                </p>
                <p className="text-xs text-text-muted">{bid.time}</p>
              </div>
            </div>
            <p
              className={`text-sm font-semibold tabular-nums ${index === 0 ? "text-text-label" : "text-text-heading"
                }`}
            >
              {bid.amount}
            </p>
          </li>
        ))}
      </ul>

      {bids.length > 5 && (
        <div className="border-t border-border px-5 py-3 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-semibold text-accent transition-colors hover:brightness-110"
          >
            {showAll ? "Show less" : `Show all ${bids.length} bids`}
          </button>
        </div>
      )}
    </div>
  );
}
