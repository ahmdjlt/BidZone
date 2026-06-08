"use client";

import { useEffect, useState } from "react";
import AuctionGrid from "@/components/auction/AuctionGrid";
import type { AuctionPreview } from "@/components/auction/AuctionCard";
import { getRecommendedAuctions } from "@/lib/api/auctions";
import { toAuctionPreview } from "@/lib/auctionPreview";

interface RecommendedAuctionsProps {
  title?: string;
  limit?: number;
  excludeAuctionId?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function RecommendedAuctions({
  title = "Recommended for you",
  limit = 8,
  excludeAuctionId,
  columns = 4,
  className = "",
}: RecommendedAuctionsProps) {
  const [auctions, setAuctions] = useState<AuctionPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const requestedLimit = excludeAuctionId ? limit + 1 : limit;
        const result = await getRecommendedAuctions(requestedLimit);
        const filtered = result
          .filter((auction) => auction.id !== excludeAuctionId)
          .slice(0, limit)
          .map(toAuctionPreview);

        if (!cancelled) {
          setAuctions(filtered);
        }
      } catch (error) {
        if (!cancelled) {
          setAuctions([]);
          setLoadError(error instanceof Error ? error.message : "Could not load recommendations.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [excludeAuctionId, limit]);

  if (isLoading) {
    return (
      <section className={className}>
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-text-heading">{title}</h2>
        <div className="rounded-xl border border-dashed border-border-strong px-5 py-7 text-sm text-text-muted">
          Loading recommendations...
        </div>
      </section>
    );
  }

  if (loadError || auctions.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <h2 className="mb-3 text-lg font-semibold tracking-tight text-text-heading">{title}</h2>
      <AuctionGrid auctions={auctions} columns={columns} />
    </section>
  );
}
