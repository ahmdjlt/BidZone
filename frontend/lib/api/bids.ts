import type { Bid } from "@/types/bid";
import { apiFetch } from "@/lib/api/client";

export async function placeBid(auctionId: number, amount: number): Promise<Bid> {
  return apiFetch<Bid>("/api/bids", {
    method: "POST",
    body: JSON.stringify({ auctionId, amount }),
  });
}

export async function getBidsByAuction(auctionId: number | string): Promise<Bid[]> {
  return apiFetch<Bid[]>(`/api/bids/auction/${auctionId}`);
}

export async function getMyBids(): Promise<Bid[]> {
  return apiFetch<Bid[]>("/api/bids/my");
}

export async function getRecentBids(limit = 15): Promise<Bid[]> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  return apiFetch<Bid[]>(`/api/bids/recent?${params.toString()}`);
}

export async function getHighestBid(auctionId: number | string): Promise<Bid | null> {
  try {
    return await apiFetch<Bid>(`/api/bids/auction/${auctionId}/highest`);
  } catch {
    return null;
  }
}
