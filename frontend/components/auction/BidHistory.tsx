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
      <div className="rounded-2xl border border-blue-100 bg-white p-6 text-center">
        <p className="text-sm text-slate-400">No bids yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white">
      <div className="flex items-center justify-between border-b border-blue-100 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
          Bid history
        </p>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
          {bids.length} bids
        </span>
      </div>

      <ul className="divide-y divide-blue-50">
        {visibleBids.map((bid, index) => (
          <li
            key={bid.id}
            className={`flex items-center justify-between px-5 py-3 transition-colors ${index === 0
                ? "bg-blue-50/50"
                : "hover:bg-blue-50/30"
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${index === 0
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700"
                  }`}
              >
                {bid.bidder.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-950">
                  {bid.bidder}
                  {index === 0 && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      Highest
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">{bid.time}</p>
              </div>
            </div>
            <p
              className={`text-sm font-semibold tabular-nums ${index === 0 ? "text-blue-700" : "text-blue-950"
                }`}
            >
              {bid.amount}
            </p>
          </li>
        ))}
      </ul>

      {bids.length > 5 && (
        <div className="border-t border-blue-100 px-5 py-3 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800"
          >
            {showAll ? "Show less" : `Show all ${bids.length} bids`}
          </button>
        </div>
      )}
    </div>
  );
}
