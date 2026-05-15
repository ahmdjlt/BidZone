import type { User, AuthResponse, LoginRequest, RegisterRequest } from "@/types/user";
import type { WatchlistItem, DashboardStats, BidActivity } from "@/types/auction";
import {
  apiFetch,
  clearAccessToken,
  getAccessToken,
  refreshAccessToken,
  setAccessToken,
} from "@/lib/api/client";

export function getAuthToken(): string | null {
  return getAccessToken();
}

export function clearAuthToken(): void {
  clearAccessToken();
}

// Auth
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const session = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    retryOnAuthFailure: false,
    skipAuth: true,
  });
  setAccessToken(session.accessToken);
  return session;
}

export interface RegisterPendingResponse {
  message: string;
  requiresEmailConfirmation: boolean;
}

export type RegisterResult =
  | { status: "authenticated"; session: AuthResponse }
  | { status: "pending"; message: string };

export async function register(data: RegisterRequest): Promise<RegisterResult> {
  const result = await apiFetch<AuthResponse | RegisterPendingResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    retryOnAuthFailure: false,
    skipAuth: true,
  });

  if ("requiresEmailConfirmation" in result) {
    return { status: "pending", message: result.message };
  }

  setAccessToken(result.accessToken);
  return { status: "authenticated", session: result };
}

export async function confirmEmail(email: string, token: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/confirm-email", {
    method: "POST",
    body: JSON.stringify({ email, token }),
    retryOnAuthFailure: false,
    skipAuth: true,
  });
}

export async function resendConfirmation(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/auth/resend-confirmation", {
    method: "POST",
    body: JSON.stringify({ email }),
    retryOnAuthFailure: false,
    skipAuth: true,
  });
}

export async function refreshSession(): Promise<AuthResponse | null> {
  return refreshAccessToken();
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/api/auth/logout", { method: "POST" });
  } finally {
    clearAccessToken();
  }
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
