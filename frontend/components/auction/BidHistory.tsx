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
  const visibleBids = showAll ? bids : bids.slice(0, 4);

  if (bids.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-text-muted">No bids yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div>
      <ul>
        {visibleBids.map((bid, index) => (
          <li
            key={bid.id}
            className="flex items-center justify-between py-2.5"
          >
            <div className="flex items-baseline gap-2">
              <p className={`text-sm font-medium ${index === 0 ? "text-text-heading" : "text-text-body"}`}>
                {bid.bidder}
              </p>
            </div>
            <div className="flex items-baseline gap-4">
              <p className="text-xs text-text-muted">{bid.time}</p>
              <p className={`text-sm font-semibold tabular-nums ${index === 0 ? "text-accent" : "text-text-heading"}`}>
                {bid.amount}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {bids.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-1 flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:brightness-110"
        >
          {showAll ? "Show less" : `See all bids (${bids.length})`}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`size-4 transition-transform ${showAll ? "rotate-180" : ""}`}
          >
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}
