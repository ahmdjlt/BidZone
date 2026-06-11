"use client";

import { useState } from "react";

const INITIAL_VISIBLE = 4;
const LOAD_MORE_BATCH = 10;

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
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const visibleBids = bids.slice(0, visibleCount);
  const hasMore = visibleCount < bids.length;
  const remaining = bids.length - visibleCount;

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

      {(hasMore || visibleCount > INITIAL_VISIBLE) && (
        <div className="mt-1 flex items-center gap-4">
          {hasMore && (
            <button
              onClick={() =>
                setVisibleCount((count) => Math.min(count + LOAD_MORE_BATCH, bids.length))
              }
              className="flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:brightness-110"
            >
              Load more ({Math.min(LOAD_MORE_BATCH, remaining)} of {remaining})
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4"
              >
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {visibleCount > INITIAL_VISIBLE && (
            <button
              onClick={() => setVisibleCount(INITIAL_VISIBLE)}
              className="flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:brightness-110"
            >
              Show less
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4 rotate-180"
              >
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
