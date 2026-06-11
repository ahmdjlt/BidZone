# BidZone Frontend Improvements — Design Spec

**Date:** 2026-05-15  
**Status:** Approved  
**Scope:** Slug routing, TanStack Query caching, error handling & resilience, performance cleanup

---

## 1. Overview

Four coordinated improvements to the BidZone frontend and backend. They are ordered by dependency: slug routing must land first because TanStack Query cache keys are designed around slugs, not numeric IDs.

| Area | Touches |
|------|---------|
| Slug routing | DB migration, backend, frontend routing |
| TanStack Query | Frontend only (replaces direct fetch + polling) |
| Error handling | Frontend (stores, boundary, WS, API) + backend (global middleware) |
| Cleanup | Frontend (categories fetch, SEO metadata, null safety) |

---

## 2. Slug Routing

### 2.1 Database

Add a `slug` column to the `Auctions` table:

```sql
ALTER TABLE "Auctions" ADD COLUMN "Slug" VARCHAR(255) NOT NULL DEFAULT '';
CREATE UNIQUE INDEX "IX_Auctions_Slug" ON "Auctions" ("Slug");
```

- Generated as: kebab-case of title + `-` + 4-character alphanumeric suffix (e.g., `iphone-15-pro-max-a3f2`)
- Suffix prevents collisions when titles are identical
- Immutable after creation (title changes do not update slug)
- EF Core migration backfills slugs for all existing auction rows at migration time

### 2.2 Backend

**New helper:** `BidZone.BusinessLogic/Helpers/SlugHelper.cs`
- `GenerateSlug(string title)` → lowercase, strip special chars, replace spaces with `-`, append `-{4 random alphanum chars}`

**Entity update:** `BidZone.Domains/Entities/Auction.cs`
- Add `public string Slug { get; set; } = string.Empty;`

**DTO update:** All auction response DTOs include `slug` field.

**New endpoint:** `GET /api/auctions/slug/{slug}`
- Returns single auction by slug
- Returns 404 with ProblemDetails if not found

**Existing endpoint:** `GET /api/auctions/{id}` — kept for internal use (admin/tools), not removed.

**Create auction flow:** `AuctionLogic.CreateAuction()` calls `SlugHelper.GenerateSlug(title)` and persists slug on creation.

### 2.3 Frontend

- Route changes from `app/auctions/[id]/` → `app/auctions/[slug]/`
- All `<Link href="/auctions/{auction.id}">` → `<Link href="/auctions/{auction.slug}">`
- API call in detail page: `GET /api/auctions/slug/{slug}` instead of `GET /api/auctions/{id}`
- Invalid slug → `notFound()` (renders Next.js 404 page), not a broken render
- `generateMetadata({ params })` fetches auction by slug and returns title/description/OG tags

---

## 3. TanStack Query Caching

### 3.1 Installation

```
@tanstack/react-query
@tanstack/react-query-devtools (dev only)
```

### 3.2 Provider

Add `components/providers/QueryProvider.tsx` (client component):

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    },
  },
});
```

Wrap `app/layout.tsx` children with `<QueryProvider>`.

### 3.3 Query Hooks

All hooks live in `hooks/queries/`. Each wraps `useQuery` or `useMutation`.

| Hook | Endpoint | Stale Time | Notes |
|------|----------|------------|-------|
| `useAuction(slug)` | `GET /api/auctions/slug/{slug}` | 30s | Primary auction detail hook |
| `useAuctions(filters)` | `GET /api/auctions` | 60s | Auction list with filter params |
| `useCategories()` | `GET /api/categories` | 5 min | Replaces hardcoded category list |
| `useProfile()` | `GET /api/users/me` | 2 min | Authenticated user profile |
| `useBidHistory(auctionId)` | `GET /api/bids/auction/{id}` | 10s | Recent bids for an auction |
| `usePlaceBid()` | `POST /api/bids` | — | Mutation; invalidates auction + bids on success |
| `useWatchlist()` | `GET /api/watchlist` | 2 min | User watchlist |
| `useToggleWatchlist()` | `POST/DELETE /api/watchlist/{id}` | — | Mutation; invalidates watchlist |

### 3.4 WebSocket Integration

Replace the 5-second polling interval with WebSocket-driven cache invalidation:

```ts
// In useSocket or AuctionDetailPage
socket.on('bid_placed', () => {
  queryClient.invalidateQueries({ queryKey: ['auction', slug] });
  queryClient.invalidateQueries({ queryKey: ['bids', auctionId] });
});
```

The 5-second `setInterval` polling in `AuctionDetailPage.tsx` is removed entirely. WebSocket is the real-time source; TanStack Query's `staleTime` handles background refresh on focus/reconnect.

### 3.5 Zustand Store Relationship

Zustand stores (`authStore`, `auctionStore`, `bidStore`) are **not replaced**. Auth state (token, user identity) stays in Zustand. Server data (auctions, bids, categories) moves to TanStack Query. The `auctionStore` and `bidStore` may be slimmed down as their data fetching logic is extracted into query hooks.

---

## 4. Error Handling & Resilience

### 4.1 Global Error Boundary (Frontend)

Add `components/ErrorBoundary.tsx` — a React class component:
- Catches unhandled render errors
- Shows a friendly fallback UI with a "Try again" button that resets the boundary
- Wraps the root layout content (inside `QueryProvider`)

### 4.2 Zustand Store Fixes

Both `authStore` and `auctionStore` currently swallow errors silently. Fix pattern:

```ts
// Add to store state
error: string | null;

// In actions
} catch (err) {
  set({ error: err instanceof Error ? err.message : 'Something went wrong' });
} finally {
  set({ isLoading: false });
}
```

`bootstrapAuth()` silent catch is replaced with a logged error + `set({ user: null })` to ensure the app correctly reflects unauthenticated state rather than ambiguous state.

### 4.3 API Client Timeout

`lib/api/client.ts` — add `AbortController` with 30-second timeout to every `apiFetch` call:

```ts
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30_000);
// pass controller.signal to fetch
// clear timeout in finally
```

Aborted requests surface as `"Request timed out"` error message to the caller.

### 4.4 WebSocket Reconnect

`lib/socket.ts` currently fires "disconnect" on error and never reconnects. Replace with exponential backoff reconnect:

- Attempt 1: retry after 1s
- Attempt 2: retry after 2s
- Attempt 3+: retry after 4s, 8s, 16s, max 30s cap
- Max 10 reconnect attempts before giving up and emitting a `connection_failed` event
- On successful reconnect, re-subscribe to the auction room and emit `connected` event
- UI shows a "Reconnecting…" indicator when socket is in retry state

### 4.5 Backend Global Exception Middleware

Add `BidZone.Api/Middleware/ExceptionMiddleware.cs`:

```csharp
public async Task InvokeAsync(HttpContext context)
{
    try { await _next(context); }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unhandled exception");
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = 500,
            Title = "An unexpected error occurred.",
            Detail = _env.IsDevelopment() ? ex.Message : null
        });
    }
}
```

Register before all other middleware in `Program.cs`. All unhandled exceptions now return structured JSON instead of HTML stack traces.

### 4.6 Null Safety Fixes

- `auctions/[slug]/page.tsx`: replace `Number(id)` coercion + fallback-to-0 with proper slug validation → `notFound()` on empty/invalid slug
- `AuctionDetailPage.tsx`: guard all `auction.` accesses behind null check before render (component should return loading/error state if `auction` is null)
- `getAuctionContact()`: log error to `console.error` instead of `null`; surface to UI if contact fetch fails
- `UploadsController.cs`: add file size limit (10MB) and MIME type validation (`image/jpeg`, `image/png`, `image/webp`) before passing to Cloudinary

---

## 5. Performance & Cleanup

### 5.1 Remove Hardcoded Categories

`app/auctions/page.tsx` lines 13-33 contain a static array of categories with SVG icons. Replace with:
- `useCategories()` hook fetches from `GET /api/categories`
- Map returned categories to icon components using a local `CATEGORY_ICONS` map (slug → icon component)
- Unknown categories fall back to a generic icon
- Loading state: skeleton placeholders matching the current pill layout
- The `CATEGORY_ICONS` map lives in `lib/categoryIcons.tsx`

### 5.2 SEO Metadata

Add `generateMetadata()` to:
- `app/auctions/[slug]/page.tsx` — fetches auction by slug, returns title, description, Open Graph image (first auction image), canonical URL
- `app/auctions/page.tsx` — static metadata: "Browse Auctions | BidZone"
- `app/profile/page.tsx` — static metadata: "My Profile | BidZone"

Pattern:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const auction = await fetchAuctionBySlug(params.slug);
  if (!auction) return { title: 'Not Found | BidZone' };
  return {
    title: `${auction.title} | BidZone`,
    description: auction.description?.slice(0, 160),
    openGraph: { images: [auction.images?.[0]?.url ?? ''] },
  };
}
```

### 5.3 Image Optimization

Replace bare `<img>` tags with `next/image` where auction images are rendered. Add Cloudinary and picsum.photos domains to `next.config.ts` `images.remotePatterns`.

---

## 6. Files Changed Summary

### Backend
| File | Change |
|------|--------|
| `BidZone.Domains/Entities/Auction.cs` | Add `Slug` property |
| `BidZone.DataAccess/Migrations/` | New migration: add slug column + unique index |
| `BidZone.BusinessLogic/Helpers/SlugHelper.cs` | New: slug generation helper |
| `BidZone.BusinessLogic/Core/AuctionLogic.cs` | Call `SlugHelper` on create |
| `BidZone.Api/Controllers/AuctionsController.cs` | Add `GET slug/{slug}` endpoint |
| `BidZone.Domains/DTOs/` | Add `Slug` to all auction response DTOs |
| `BidZone.Api/Middleware/ExceptionMiddleware.cs` | New: global exception handler |
| `BidZone.Api/Program.cs` | Register exception middleware |
| `BidZone.BusinessLogic/Core/BidLogic.cs` | Surface watchlist insert error, add logging |
| `BidZone.Api/Controllers/UploadsController.cs` | Add file size + MIME validation |

### Frontend
| File | Change |
|------|--------|
| `package.json` | Add `@tanstack/react-query`, `@tanstack/react-query-devtools` |
| `components/providers/QueryProvider.tsx` | New: QueryClient provider |
| `app/layout.tsx` | Wrap with `QueryProvider` |
| `app/auctions/[id]/` → `app/auctions/[slug]/` | Rename route segment |
| `app/auctions/[slug]/page.tsx` | Use slug, `useAuction(slug)`, `generateMetadata` |
| `app/auctions/page.tsx` | Use `useAuctions()`, `useCategories()`, remove hardcoded list |
| `app/profile/page.tsx` | Add static metadata |
| `hooks/queries/useAuction.ts` | New |
| `hooks/queries/useAuctions.ts` | New |
| `hooks/queries/useCategories.ts` | New |
| `hooks/queries/useProfile.ts` | New |
| `hooks/queries/useBidHistory.ts` | New |
| `hooks/queries/usePlaceBid.ts` | New |
| `hooks/queries/useWatchlist.ts` | New |
| `hooks/queries/useToggleWatchlist.ts` | New |
| `lib/categoryIcons.tsx` | New: slug → icon map |
| `lib/api/client.ts` | Add 30s timeout via `AbortController` |
| `lib/socket.ts` | Add exponential backoff reconnect |
| `store/authStore.ts` | Fix silent catch in `bootstrapAuth`, add `error` state |
| `store/auctionStore.ts` | Add `error` state, fix silent catch |
| `components/ErrorBoundary.tsx` | New: global error boundary |
| `components/auction/AuctionDetailPage.tsx` | Remove polling, use `useAuction`, WS invalidation |
| `next.config.ts` | Add image remote patterns |

---

## 7. Out of Scope

- Backend Redis caching (not needed once TanStack Query handles client-side caching; revisit if DB load becomes an issue)
- User profile public pages (`/profile/[userId]`) — already noted as unimplemented; not addressed here
- Content Security Policy headers — separate security concern
- Test coverage for new hooks — existing test suite not extended in this pass
