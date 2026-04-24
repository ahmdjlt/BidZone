import type { Auction, AuctionSummary, CreateAuctionData, UpdateAuctionData, Category } from "@/types/auction";
import { apiFetch } from "@/lib/api/client";

export interface AuctionFilters {
  search?: string;
  category?: string;
  sort?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function getAuctions(filters?: AuctionFilters): Promise<AuctionSummary[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.category) params.set("category", filters.category);
  if (filters?.sort) params.set("sort", filters.sort);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters?.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  const qs = params.toString();
  return apiFetch<AuctionSummary[]>(`/api/auctions${qs ? `?${qs}` : ""}`);
}

export async function getAuctionById(id: string | number): Promise<Auction> {
  return apiFetch<Auction>(`/api/auctions/${id}`);
}

export async function createAuction(data: CreateAuctionData): Promise<Auction> {
  return apiFetch<Auction>("/api/auctions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAuction(id: string | number, data: UpdateAuctionData): Promise<Auction> {
  return apiFetch<Auction>(`/api/auctions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAuction(id: string | number): Promise<void> {
  return apiFetch<void>(`/api/auctions/${id}`, { method: "DELETE" });
}

export async function getMyAuctions(): Promise<Auction[]> {
  return apiFetch<Auction[]>("/api/auctions/my");
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories");
}

export async function getAuctionsByCategory(categoryId: number): Promise<AuctionSummary[]> {
  return apiFetch<AuctionSummary[]>(`/api/categories/${categoryId}/auctions`);
}
