"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import BidForm from "./BidForm";
import BidHistory, { type Bid as BidHistoryItem } from "./BidHistory";
import { getAuctionById, getAuctionContact } from "@/lib/api/auctions";
import { getBidsByAuction, placeBid } from "@/lib/api/bids";
import type { Auction, AuctionContact } from "@/types/auction";
import type { Bid } from "@/types/bid";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/hooks/useSocket";

export interface AuctionDetailPageProps {
  auctionId: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toBidHistory(bids: Bid[]): BidHistoryItem[] {
  return bids.map((bid) => ({
    id: String(bid.id),
    bidder: bid.bidderUsername,
    amount: formatCurrency(bid.amount),
    time: formatDateTime(bid.placedAt),
    isWinning: bid.status === "Winning" || bid.status === "Won",
  }));
}

export default function AuctionDetailPage({ auctionId }: AuctionDetailPageProps) {
  const user = useAuthStore((state) => state.user);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBidding, setIsBidding] = useState(false);
  const [contact, setContact] = useState<AuctionContact | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const { lastBid } = useSocket(auctionId);
  const knownBidIdsRef = useRef(new Set<number>());

  const loadAuction = useCallback(async (showLoader = false) => {
    if (!auctionId) {
      setError("Invalid auction id.");
      setIsLoading(false);
      return;
    }

    if (showLoader) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const [auctionResponse, bidsResponse] = await Promise.all([
        getAuctionById(auctionId),
        getBidsByAuction(auctionId),
      ]);
      setAuction(auctionResponse);
      setBids(bidsResponse);

      if (user && auctionResponse.status === "Closed") {
        try {
          const contactResponse = await getAuctionContact(auctionId);
          setContact(contactResponse);
        } catch {
          setContact(null);
        }
      } else {
        setContact(null);
      }
    } catch (loadError) {
      if (showLoader) {
        setError(loadError instanceof Error ? loadError.message : "Could not load auction.");
        setAuction(null);
        setBids([]);
        setContact(null);
      }
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, [auctionId, user]);

  useEffect(() => {
    let cancelled = false;

    async function runLoad() {
      await loadAuction(true);
      if (cancelled) {
        return;
      }
    }

    void runLoad();

    return () => {
      cancelled = true;
    };
  }, [loadAuction]);

  useEffect(() => {
    if (!auction || auction.status !== "Active") {
      return;
    }

    const intervalId = setInterval(() => {
      void loadAuction();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [auction, loadAuction]);

  useEffect(() => {
    if (!auction) {
      setSelectedImageUrl("");
      return;
    }

    const firstGalleryImage = auction.images?.[0]?.url;
    setSelectedImageUrl(firstGalleryImage || auction.imageUrl || "/auction-images/abstract-oil-canvas.svg");
  }, [auction]);

  useEffect(() => {
    knownBidIdsRef.current = new Set(bids.map((bid) => bid.id));
  }, [bids]);

  useEffect(() => {
    if (!lastBid || lastBid.auctionId !== auctionId) {
      return;
    }

    const isNewBid = !knownBidIdsRef.current.has(lastBid.id);
    knownBidIdsRef.current.add(lastBid.id);

    setBids((currentBids) => {
      const updatedBids = currentBids
        .filter((bid) => bid.id !== lastBid.id)
        .map((bid) => (bid.status === "Winning" ? { ...bid, status: "Outbid" as const } : bid));

      return [lastBid, ...updatedBids].sort((left, right) => right.amount - left.amount);
    });

    setAuction((currentAuction) => {
      if (!currentAuction || currentAuction.id !== lastBid.auctionId) {
        return currentAuction;
      }

      return {
        ...currentAuction,
        currentPrice: Math.max(currentAuction.currentPrice, lastBid.amount),
        bidCount: currentAuction.bidCount + (isNewBid ? 1 : 0),
      };
    });
  }, [auctionId, lastBid]);

  const handlePlaceBid = useCallback(async (amount: number) => {
    if (!auction) {
      throw new Error("Auction is not available.");
    }

    setIsBidding(true);
    try {
      await placeBid(auction.id, amount);
      await loadAuction();
    } finally {
      setIsBidding(false);
    }
  }, [auction, loadAuction]);

  const bidHistory = useMemo(() => toBidHistory(bids), [bids]);
  const myLatestBid = useMemo(() => {
    if (!user) {
      return null;
    }

    return bids
      .filter((bid) => bid.bidderId == user.id)
      .sort((left, right) => new Date(right.placedAt).getTime() - new Date(left.placedAt).getTime())[0] ?? null;
  }, [bids, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen page-gradient">
        <main className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8">
          <div className="rounded-xl border border-dashed border-border-strong px-6 py-8 text-sm text-text-muted">
            Loading auction details...
          </div>
        </main>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen page-gradient">
        <main className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8">
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
            {error ?? "Auction not found."}
          </div>
        </main>
      </div>
    );
  }

  const isAuctionClosed = auction.status !== "Active";
  const isOwner = user?.id === auction.sellerId;
  const isWinning = myLatestBid?.status === "Winning";
  const isWon = myLatestBid?.status === "Won";
  const isOutbid = myLatestBid?.status === "Outbid";
  const isLost = myLatestBid?.status === "Lost";
  const isBidDisabled = isAuctionClosed || isBidding || isWinning || isOwner;

  let disabledLabel: string | undefined;
  if (isBidding) {
    disabledLabel = "Placing bid...";
  } else if (isWinning) {
    disabledLabel = "Winning";
  } else if (isAuctionClosed) {
    disabledLabel = "Auction closed";
  }

  let stateMessage: string | null = null;
  let stateTone: "success" | "warning" | "neutral" = "neutral";

  if (isWinning) {
    stateMessage = "You are currently the highest bidder.";
    stateTone = "success";
  } else if (isOutbid) {
    stateMessage = "You were outbid. Increase your bid to take the lead.";
    stateTone = "warning";
  } else if (isWon) {
    stateMessage = "Auction ended. You won this item.";
    stateTone = "success";
  } else if (isLost) {
    stateMessage = "Auction ended. This item was won by another bidder.";
    stateTone = "warning";
  } else if (isAuctionClosed) {
    stateMessage = "This auction has ended.";
  }

  return (
    <div className="min-h-screen page-gradient">
      <main className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-card-bg card-shadow">
              <Image
                src={selectedImageUrl || auction.imageUrl || "/auction-images/abstract-oil-canvas.svg"}
                alt={auction.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {auction.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {auction.images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImageUrl(image.url)}
                    className={`relative aspect-[4/3] overflow-hidden rounded-md border transition ${
                      selectedImageUrl === image.url ? "border-accent" : "border-border-strong"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${auction.title} image ${image.sortOrder + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-border/40 pt-5">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                Description
              </p>
              <p className="text-sm leading-relaxed text-text-body">{auction.description}</p>
            </div>

            <div className="mt-5 border-t border-border/40 pt-5">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                Details
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Category</p>
                  <p className="mt-0.5 text-sm text-text-heading">{auction.categoryName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Status</p>
                  <p className="mt-0.5 text-sm text-text-heading">{auction.status}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Start time</p>
                  <p className="mt-0.5 text-sm text-text-heading">{formatDateTime(auction.startTime)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">End time</p>
                  <p className="mt-0.5 text-sm text-text-heading">{formatDateTime(auction.endTime)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Starting price</p>
                  <p className="mt-0.5 text-sm text-text-heading">{formatCurrency(auction.startingPrice)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Reserve price</p>
                  <p className="mt-0.5 text-sm text-text-heading">
                    {auction.reservePrice == null ? "No reserve" : formatCurrency(auction.reservePrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-heading sm:text-2xl">
              {auction.title}
            </h1>
            <p className="mt-1 text-sm text-text-muted">Sold by @{auction.sellerUsername}</p>

            <div className="mt-4">
              <BidForm
                currentBid={auction.currentPrice}
                minIncrement={1}
                totalBids={auction.bidCount}
                endTime={auction.endTime}
                onPlaceBid={handlePlaceBid}
                disabled={isBidDisabled}
                disabledLabel={disabledLabel}
                stateMessage={stateMessage}
                stateTone={stateTone}
                showBidButton={!isOwner}
              />
            </div>

            <div className="mt-6">
              <BidHistory bids={bidHistory} />
            </div>

            {contact && (
              <div className="mt-6 rounded-xl border border-border-strong bg-accent-soft/40 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                  Contact details
                </p>
                <p className="mt-2 text-sm text-text-heading">
                  {contact.viewerRole === "Buyer" ? "Seller" : "Buyer"}: @{contact.counterpartyUsername}
                </p>
                <p className="mt-1 text-sm text-text-heading">
                  Email: {contact.counterpartyEmail}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
