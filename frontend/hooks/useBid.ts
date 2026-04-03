"use client";

import { useEffect, useState } from "react";
import { useBidStore } from "@/store/bidStore";

export function useBid(auctionId?: number | string) {
  const { bids, isLoading, fetchBids, placeBid } = useBidStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auctionId) {
      fetchBids(auctionId);
    }
  }, [auctionId, fetchBids]);

  const submitBid = async (auctionIdOverride: number, amount: number) => {
    setError(null);
    try {
      return await placeBid(auctionIdOverride, amount);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to place bid";
      setError(message);
      throw err;
    }
  };

  return {
    bids,
    placeBid: submitBid,
    isLoading,
    error,
  };
}
