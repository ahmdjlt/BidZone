import type { AuctionPreview } from "@/components/auction/AuctionCard";
import type { AuctionSummary } from "@/types/auction";

export function formatAuctionCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatAuctionEndsIn(value: string): string {
  const end = new Date(value);
  const diffMs = end.getTime() - Date.now();

  if (Number.isNaN(end.getTime()) || diffMs <= 0) {
    return "Ended";
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours.toString().padStart(2, "0")}h`;
  }

  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function toAuctionPreview(auction: AuctionSummary): AuctionPreview {
  return {
    id: auction.id,
    title: auction.title,
    description: `${auction.categoryName} auction`,
    location: "Online",
    category: auction.categoryName,
    currentBid: formatAuctionCurrency(auction.currentPrice),
    bids: auction.bidCount,
    endsIn: formatAuctionEndsIn(auction.endTime),
    watchers: 0,
    imageUrl: auction.imageUrl || "/auction-images/abstract-oil-canvas.svg",
    imageAccent: "linear-gradient(135deg,#2f80ff,#8ec5ff)",
  };
}
