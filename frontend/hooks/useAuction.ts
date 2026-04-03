"use client";

import { useEffect } from "react";
import { useAuctionStore } from "@/store/auctionStore";
import type { AuctionFilters } from "@/lib/api/auctions";

export function useAuction(id?: string | number, filters?: AuctionFilters) {
  const {
    auctions,
    selectedAuction,
    isLoading,
    fetchAuctions,
    fetchAuction,
  } = useAuctionStore();

  useEffect(() => {
    if (id) {
      fetchAuction(id);
    } else {
      fetchAuctions(filters);
    }
  }, [id, fetchAuction, fetchAuctions, filters]);

  return {
    auction: selectedAuction,
    auctions,
    isLoading,
    refetch: id ? () => fetchAuction(id) : () => fetchAuctions(filters),
  };
}
