"use client";

import { useEffect, useState, useRef } from "react";

export interface LiveBid {
  id: string;
  bidder: string;
  amount: string;
  timestamp: Date;
}

interface LiveBidFeedProps {
  initialBids?: LiveBid[];
  simulateRealTime?: boolean;
}

const simulatedBidders = [
  "Alex M.", "Sarah K.", "Dan P.", "Ioana R.", "Mihai T.",
  "Elena V.", "Andrei S.", "Clara D.", "Radu N.", "Maria L.",
];

function randomBidder() {
  return simulatedBidders[Math.floor(Math.random() * simulatedBidders.length)];
}

export default function LiveBidFeed({
  initialBids = [],
  simulateRealTime = false,
}: LiveBidFeedProps) {
  const [bids, setBids] = useState<LiveBid[]>(initialBids);
  const [lastAmount, setLastAmount] = useState(2840);
  const listRef = useRef<HTMLDivElement>(null);

  // Simulate incoming bids for demo
  useEffect(() => {
    if (!simulateRealTime) return;

    const interval = setInterval(() => {
      setLastAmount((prev) => {
        const increment = Math.floor(Math.random() * 4 + 1) * 50;
        const newAmount = prev + increment;

        const newBid: LiveBid = {
          id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          bidder: randomBidder(),
          amount: `$${newAmount.toLocaleString()}`,
          timestamp: new Date(),
        };

        setBids((current) => [newBid, ...current].slice(0, 20));
        return newAmount;
      });
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [simulateRealTime]);

  // Auto-scroll to top on new bid
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [bids.length]);

  function timeAgo(date: Date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white">
      <div className="flex items-center justify-between border-b border-blue-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            Live feed
          </p>
        </div>
        <span className="text-xs text-slate-400">
          {bids.length} bids
        </span>
      </div>

      <div ref={listRef} className="max-h-72 overflow-y-auto">
        {bids.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-slate-400">Waiting for bids...</p>
            <div className="mt-3 flex justify-center gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-300 [animation-delay:300ms]" />
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-blue-50">
            {bids.map((bid, index) => (
              <li
                key={bid.id}
                className={`flex items-center justify-between px-5 py-2.5 transition-all duration-500 ${index === 0
                    ? "animate-[slideIn_400ms_ease] bg-blue-50/60"
                    : ""
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${index === 0
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-600"
                      }`}
                  >
                    {bid.bidder.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-950">
                      {bid.bidder}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {timeAgo(bid.timestamp)}
                    </p>
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
        )}
      </div>
    </div>
  );
}
