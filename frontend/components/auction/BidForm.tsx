"use client";

import { useState } from "react";

interface BidFormProps {
  currentBid: number;
  minIncrement?: number;
  onPlaceBid?: (amount: number) => void;
}

export default function BidForm({
  currentBid,
  minIncrement = 50,
  onPlaceBid,
}: BidFormProps) {
  const minimumBid = currentBid + minIncrement;
  const [amount, setAmount] = useState(minimumBid.toString());
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const quickAmounts = [
    minimumBid,
    minimumBid + minIncrement,
    minimumBid + minIncrement * 3,
    minimumBid + minIncrement * 5,
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) {
      setError("Please enter a valid amount");
      return;
    }
    if (numAmount < minimumBid) {
      setError(`Minimum bid is $${minimumBid.toLocaleString()}`);
      return;
    }

    setError("");
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      onPlaceBid?.(numAmount);
      setTimeout(() => setSuccess(false), 2000);
    }, 800);
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
          Place your bid
        </p>
        <p className="text-xs text-slate-400">
          Min: <span className="font-semibold text-blue-700">${minimumBid.toLocaleString()}</span>
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600">
          Current highest bid
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-blue-950">
          ${currentBid.toLocaleString()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              min={minimumBid}
              step={minIncrement}
              className="w-full rounded-xl border border-blue-200 bg-white py-3 pl-8 pr-4 text-lg font-semibold tabular-nums text-blue-950 outline-none transition-colors placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder={minimumBid.toString()}
            />
          </div>
          {error && (
            <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
          )}
        </div>

        {/* Quick bid buttons */}
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setAmount(q.toString());
                setError("");
              }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold tabular-nums transition-colors ${parseFloat(amount) === q
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-blue-100 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/50"
                }`}
            >
              ${q.toLocaleString()}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-[0_16px_36px_-20px_rgba(16,84,209,0.85)] transition-all ${success
              ? "bg-green-500"
              : isSubmitting
                ? "cursor-wait bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
            }`}
        >
          {success ? "✓ Bid placed!" : isSubmitting ? "Placing bid..." : `Place bid — $${parseFloat(amount || "0").toLocaleString()}`}
        </button>
      </form>
    </div>
  );
}
