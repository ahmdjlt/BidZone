import type { AuthResponse } from "@/types/user";

const SERVER_API_BASE = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5171";
const API_BASE = typeof window === "undefined" ? SERVER_API_BASE : "";

let accessToken: string | null = null;
let refreshPromise: Promise<AuthResponse | null> | null = null;
let authFailureHandler: (() => void) | null = null;

export interface ApiFetchOptions extends RequestInit {
  retryOnAuthFailure?: boolean;
  skipAuth?: boolean;
}

export function getApiBase(): string {
  return API_BASE;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export function setAuthFailureHandler(handler: (() => void) | null): void {
  authFailureHandler = handler;
}

export async function refreshAccessToken(): Promise<AuthResponse | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      clearAccessToken();
      authFailureHandler?.();
      return null;
    }

    const session = (await res.json()) as AuthResponse;
    setAccessToken(session.accessToken);
    return session;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiFetch<T>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const { retryOnAuthFailure = true, skipAuth = false, headers: initialHeaders, signal: externalSignal, ...requestInit } = options;
  const headers = new Headers(initialHeaders);

  if (requestInit.body && !(requestInit.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (accessToken && !skipAuth && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  if (externalSignal) {
    externalSignal.addEventListener("abort", () => controller.abort());
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${url}`, {
      credentials: "include",
      headers,
      signal: controller.signal,
      ...requestInit,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (res.status === 401 && !skipAuth && retryOnAuthFailure) {
    const session = await refreshAccessToken();
    if (session) {
      return apiFetch<T>(url, { ...options, retryOnAuthFailure: false });
    }
  }

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

async function getErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json") || contentType.includes("application/problem+json")) {
    const body = await res.json().catch(() => null);
    return (
      body?.message
      ?? body?.title
      ?? (Array.isArray(body?.errors) ? body.errors.join(" ") : null)
      ?? `Request failed: ${res.status}`
    );
  }

  const body = await res.text().catch(() => "");
  return body || `Request failed: ${res.status}`;
}
