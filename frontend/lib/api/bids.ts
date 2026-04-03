import type { Bid } from "@/types/bid";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5171";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

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

export async function getHighestBid(auctionId: number | string): Promise<Bid | null> {
  try {
    return await apiFetch<Bid>(`/api/bids/auction/${auctionId}/highest`);
  } catch {
    return null;
  }
}
