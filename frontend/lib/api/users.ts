import type { User, AuthResponse, LoginRequest, RegisterRequest } from "@/types/user";
import type { WatchlistItem, DashboardStats, BidActivity } from "@/types/auction";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5171";
const TOKEN_STORAGE_KEY = "bidzone.auth.token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${url}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await res.json().catch(() => null);
      const message =
        body?.message
        ?? (Array.isArray(body?.errors) ? body.errors.join(" ") : null)
        ?? `Request failed: ${res.status}`;
      throw new Error(message);
    }

    const body = await res.text().catch(() => "");
    throw new Error(body || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logout(): Promise<void> {
  return apiFetch<void>("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>("/api/auth/me");
}

// Users
export async function getUserProfile(userId: number | string): Promise<User> {
  return apiFetch<User>(`/api/users/${userId}`);
}

export async function updateUserProfile(userId: number | string, data: Partial<User>): Promise<User> {
  return apiFetch<User>(`/api/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Watchlist
export async function getWatchlist(): Promise<WatchlistItem[]> {
  return apiFetch<WatchlistItem[]>("/api/watchlist");
}

export async function addToWatchlist(auctionId: number): Promise<WatchlistItem> {
  return apiFetch<WatchlistItem>(`/api/watchlist/${auctionId}`, { method: "POST" });
}

export async function removeFromWatchlist(auctionId: number): Promise<void> {
  return apiFetch<void>(`/api/watchlist/${auctionId}`, { method: "DELETE" });
}

// Reports (Admin)
export async function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/api/reports/dashboard");
}

export async function getBidActivity(days?: number): Promise<BidActivity[]> {
  const qs = days ? `?days=${days}` : "";
  return apiFetch<BidActivity[]>(`/api/reports/bid-activity${qs}`);
}
