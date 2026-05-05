"use client";

import { useEffect, useState } from "react";

interface BidFormProps {
  currentBid: number;
  minIncrement?: number;
  totalBids?: number;
  estimatedValue?: number;
  endTime?: string;
  onPlaceBid?: (amount: number) => Promise<void> | void;
  disabled?: boolean;
}

function useCountdown(endTime?: string) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!endTime) return;
    function update() {
      const diff = new Date(endTime!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Ended");
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(
        `${d}D ${h.toString().padStart(2, "0")}H ${m.toString().padStart(2, "0")}min ${s.toString().padStart(2, "0")}s`
      );
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return timeLeft;
}

export default function BidForm({
  currentBid,
  minIncrement = 50,
  totalBids = 0,
  estimatedValue,
  endTime,
  onPlaceBid,
  disabled = false,
}: BidFormProps) {
  const minimumBid = currentBid + minIncrement;
  const [amount, setAmount] = useState(minimumBid);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const countdown = useCountdown(endTime);

  function increment() {
    setAmount((prev) => prev + minIncrement);
    setError("");
  }

  function decrement() {
    setAmount((prev) => {
      const next = prev - minIncrement;
      return next >= minimumBid ? next : prev;
    });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) {
      return;
    }

    if (amount < minimumBid) {
      setError(`Minimum bid is $${minimumBid.toLocaleString()}`);
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      await onPlaceBid?.(amount);
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (submitError) {
      setIsSubmitting(false);
      setError(submitError instanceof Error ? submitError.message : "Failed to place bid.");
    }
  }

  return (
    <div className="space-y-3">
      {/* Current bid */}
      <div>
        <p className="text-xs font-medium text-text-muted">Current bid</p>
        <p className="text-2xl font-bold tabular-nums tracking-tight text-text-heading">
          ${currentBid.toLocaleString()}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          {countdown && (
            <p className="font-semibold text-accent">
              {countdown}
            </p>
          )}
          <p className="text-text-muted">
            {totalBids} bid{totalBids !== 1 ? "s" : ""} · Min: ${minimumBid.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Amount input with +/- */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(Number(e.target.value));
                setError("");
              }}
              min={minimumBid}
              step={minIncrement}
              disabled={disabled || isSubmitting}
              className="w-full rounded-lg bg-accent-soft/50 py-2.5 pl-7 pr-3 text-sm font-semibold tabular-nums text-text-heading outline-none transition-colors placeholder:text-text-muted focus:ring-2 focus:ring-accent/20"
              placeholder={minimumBid.toString()}
            />
          </div>
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || isSubmitting}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft/50 text-base font-bold text-text-heading transition hover:bg-accent-soft"
          >
            −
          </button>
          <button
            type="button"
            onClick={increment}
            disabled={disabled || isSubmitting}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft/50 text-base font-bold text-text-heading transition hover:bg-accent-soft"
          >
            +
          </button>
        </div>

        {error && (
          <p className="text-xs font-medium text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(16,84,209,0.85)] transition-all ${
            success
              ? "bg-green-500"
              : isSubmitting
                ? "cursor-wait bg-accent/70"
                : "bg-accent hover:brightness-110 active:scale-[0.98]"
          }`}
        >
          {success ? "Bid placed!" : disabled ? "Bidding unavailable" : isSubmitting ? "Placing bid..." : "Bid now"}
        </button>

        {estimatedValue && (
          <button
            type="button"
            className="w-full rounded-lg bg-accent-soft/50 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent-soft"
          >
            Buy it now (${estimatedValue.toLocaleString()})
          </button>
        )}

        <button
          type="button"
          className="w-full rounded-lg bg-accent-soft/50 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent-soft"
        >
          Make an offer
        </button>
      </form>
    </div>
  );
}
