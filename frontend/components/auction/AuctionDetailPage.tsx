"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import BidForm from "./BidForm";
import BidHistory, { type Bid as BidHistoryItem } from "./BidHistory";
import AuthModal from "@/components/auth/AuthModal";
import { getAuctionContact, recordBrowsingEvent } from "@/lib/api/auctions";
import { getBidsByAuction, placeBid } from "@/lib/api/bids";
import type { Auction, AuctionContact } from "@/types/auction";
import type { Bid } from "@/types/bid";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/hooks/useSocket";
import { useAuction } from "@/hooks/queries/useAuction";

export interface AuctionDetailPageProps {
  slug: string;
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
  if (Number.isNaN(date.getTime())) return "Unknown";
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

export default function AuctionDetailPage({ slug }: AuctionDetailPageProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: auction, isLoading, error } = useAuction(slug);
  const firstImageUrl = auction?.images?.[0]?.url;
  const primaryImageUrl = auction?.imageUrl;
  const [bids, setBids] = useState<Bid[]>([]);
  const [isBidding, setIsBidding] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [contact, setContact] = useState<AuctionContact | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const { lastBid, isConnecting } = useSocket(auction?.id);
  const knownBidIdsRef = useRef(new Set<number>());

  // Load bids when auction id is available
  useEffect(() => {
    if (!auction?.id) return;
    let cancelled = false;

    getBidsByAuction(auction.id)
      .then((result) => { if (!cancelled) setBids(result); })
      .catch(() => { /* bids will be empty; WS fills them in */ });

    return () => { cancelled = true; };
  }, [auction?.id]);

  // Load contact info for closed auctions
  useEffect(() => {
    if (!auction || auction.status !== "Closed" || !user) {
      setContact(null);
      return;
    }
    let cancelled = false;

    getAuctionContact(auction.id)
      .then((c) => { if (!cancelled) setContact(c); })
      .catch(() => { if (!cancelled) setContact(null); });

    return () => { cancelled = true; };
  }, [auction, user]);

  // Set initial selected image when auction loads (only on auction id change)
  useEffect(() => {
    if (!auction?.id) { setSelectedImageUrl(""); return; }
    setSelectedImageUrl(firstImageUrl || primaryImageUrl || "/auction-images/abstract-oil-canvas.svg");
  }, [auction?.id, firstImageUrl, primaryImageUrl]);

  useEffect(() => {
    if (!isAuthenticated || !auction?.id) return;
    void recordBrowsingEvent({ eventType: "AuctionView", auctionId: auction.id }).catch(() => undefined);
  }, [auction?.id, isAuthenticated]);

  // Track known bid IDs for deduplication
  useEffect(() => {
    knownBidIdsRef.current = new Set(bids.map((b) => b.id));
  }, [bids]);

  // Merge WebSocket bids into local state + update query cache
  useEffect(() => {
    if (!lastBid || !auction || lastBid.auctionId !== auction.id) return;

    const isNewBid = !knownBidIdsRef.current.has(lastBid.id);
    knownBidIdsRef.current.add(lastBid.id);

    setBids((current) => {
      const updated = current
        .filter((b) => b.id !== lastBid.id)
        .map((b) => (b.status === "Winning" ? { ...b, status: "Outbid" as const } : b));
      return [lastBid, ...updated].sort((a, b) => b.amount - a.amount);
    });

    queryClient.setQueryData(["auction", slug], (old: Auction | undefined) => {
      if (!old || old.id !== lastBid.auctionId) return old;
      return {
        ...old,
        currentPrice: Math.max(old.currentPrice, lastBid.amount),
        bidCount: old.bidCount + (isNewBid ? 1 : 0),
      };
    });
  }, [lastBid, auction, slug, queryClient]);

  const handlePlaceBid = useCallback(
    async (amount: number) => {
      if (!isAuthenticated) {
        setShowAuthModal(true);
        return;
      }
      if (!auction) throw new Error("Auction not available.");
      setIsBidding(true);
      try {
        await placeBid(auction.id, amount);
        await queryClient.invalidateQueries({ queryKey: ["auction", slug] });
        const freshBids = await getBidsByAuction(auction.id);
        setBids(freshBids);
      } finally {
        setIsBidding(false);
      }
    },
    [isAuthenticated, auction, slug, queryClient]
  );

  const bidHistory = useMemo(() => toBidHistory(bids), [bids]);
  const myLatestBid = useMemo(() => {
    if (!user) return null;
    return (
      bids
        .filter((b) => b.bidderId == user.id)
        .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())[0] ?? null
    );
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
            {error instanceof Error ? error.message : "Auction not found."}
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
  if (isBidding) disabledLabel = "Placing bid...";
  else if (isWinning) disabledLabel = "Winning";
  else if (isAuctionClosed) disabledLabel = "Auction closed";
  else if (isOwner) disabledLabel = "Your listing";

  let stateMessage: string | null = null;
  let stateTone: "success" | "warning" | "neutral" = "neutral";

  if (isOwner) { stateMessage = "You can't bid on your own listing."; stateTone = "neutral"; }
  else if (isWinning) { stateMessage = "You are currently the highest bidder."; stateTone = "success"; }
  else if (isOutbid) { stateMessage = "You were outbid. Increase your bid to take the lead."; stateTone = "warning"; }
  else if (isWon) { stateMessage = "Auction ended. You won this item."; stateTone = "success"; }
  else if (isLost) { stateMessage = "Auction ended. This item was won by another bidder."; stateTone = "warning"; }
  else if (isAuctionClosed) stateMessage = "This auction has ended.";

  return (
    <div className="min-h-screen page-gradient">
      <main className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8">
        {isConnecting && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
            Reconnecting to live updates...
          </div>
        )}
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
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Description</p>
              <p className="text-sm leading-relaxed text-text-body">{auction.description}</p>
            </div>

            <div className="mt-5 border-t border-border/40 pt-5">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">Details</p>
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
            <h1 className="text-xl font-semibold tracking-tight text-text-heading sm:text-2xl">{auction.title}</h1>
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
                showBidButton={true}
                bidLabel={!isAuthenticated ? "Sign in to bid" : undefined}
              />
            </div>

            <div className="mt-6">
              <BidHistory bids={bidHistory} />
            </div>

            {contact && (
              <div className="mt-6 rounded-xl border border-border-strong bg-accent-soft/40 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Contact details</p>
                <p className="mt-2 text-sm text-text-heading">
                  {contact.viewerRole === "Buyer" ? "Seller" : "Buyer"}: @{contact.counterpartyUsername}
                </p>
                <p className="mt-1 text-sm text-text-heading">Email: {contact.counterpartyEmail}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          redirectTo={`/auctions/${slug}`}
        />
      )}
    </div>
  );
}
